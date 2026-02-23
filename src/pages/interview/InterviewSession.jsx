import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ 프로젝트에 맞게 api 경로만 수정
import { api } from "../../lib/api"; // 예: src/api/api.js 또는 axiosInstance

const DEFAULT_QUESTIONS = [
  "자기소개를 간단히 해주시겠습니까?",
  "우리 회사에 지원한 동기는 무엇인가요?",
  "자신의 강점과 약점을 말씀해주세요.",
  "가장 기억에 남는 프로젝트 경험을 설명해주세요.",
  "팀에서 갈등이 발생했을 때 어떻게 해결하셨나요?",
  "5년 후 자신의 모습을 어떻게 그리고 계신가요?",
  "실패했던 경험과 그로부터 배운 점을 말씀해주세요.",
  "이 직무에서 가장 중요하다고 생각하는 역량은 무엇인가요?",
  "최근에 배운 새로운 기술이나 지식이 있나요?",
  "마지막으로 하고 싶은 말씀이 있으신가요?",
];

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// URL 메모리 누수 방지 유틸
function revokeUrlSafely(url) {
  try {
    if (url) URL.revokeObjectURL(url);
  } catch {}
}

export default function InterviewSession() {
  const navigate = useNavigate();

  // ✅ 업로드 상태는 반드시 컴포넌트 안에 있어야 함
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0~100
  const [uploadError, setUploadError] = useState("");
  const [uploadedSessionId, setUploadedSessionId] = useState(null);

  // ===== DOM/Media refs =====
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // ===== MediaRecorder refs =====
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ===== Data from InterviewSelect (localStorage) =====
  const interviewData = useMemo(() => {
    try {
      const raw = localStorage.getItem("interviewData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const totalCount = Number(interviewData?.settings?.questionCount ?? 10);

  const questions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalCount; i++) {
      arr.push(DEFAULT_QUESTIONS[i % DEFAULT_QUESTIONS.length]);
    }
    return arr;
  }, [totalCount]);

  // ===== State =====
  const [currentIndex, setCurrentIndex] = useState(0);

  // 질문별 녹음 저장 (덮어쓰기)
  // { blob, url, mimeType, createdAt }
  const [recordings, setRecordings] = useState(() =>
    Array(questions.length).fill(null)
  );

  const [isRecording, setIsRecording] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const [seconds, setSeconds] = useState(0);

  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiStatus, setAiStatus] = useState("대기 중");
  const [listeningStatus, setListeningStatus] = useState("녹음 대기 중");

  const [transcript, setTranscript] = useState(
    "답변 버튼을 눌러 녹음해주세요..."
  );

  const [modalOpen, setModalOpen] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentRecording = recordings[currentIndex];

  // answeredCount (녹음이 있는 질문 개수)
  const answeredCount = useMemo(() => {
    return recordings.filter((r) => r?.blob && r?.url).length;
  }, [recordings]);

  // ===== Init: webcam + timer =====
  useEffect(() => {
    let mounted = true;

    async function initWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("웹캠 접근 오류:", err);
        alert("웹캠/마이크에 접근할 수 없습니다. 권한을 확인해주세요.");
      }
    }

    function startTimer() {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    initWebcam();
    startTimer();

    return () => {
      mounted = false;

      // timer stop
      if (timerRef.current) clearInterval(timerRef.current);

      // stop TTS
      window.speechSynthesis?.cancel();

      // stop recorder
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch {}

      // stop webcam stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // 🔥 recordings URL 전부 revoke (메모리 누수 방지)
      recordings.forEach((r) => revokeUrlSafely(r?.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 질문 바뀔 때: 녹음 중이면 stop + TTS =====
  useEffect(() => {
    if (isRecording) stopRecording();

    setTranscript("답변 버튼을 눌러 녹음해주세요...");
    setListeningStatus("녹음 대기 중");

    speakQuestion(currentQuestion);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ===== TTS =====
  function speakQuestion(text) {
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 0.9;
    utter.pitch = 1.0;

    utter.onstart = () => {
      setAiSpeaking(true);
      setAiStatus("질문 읽는 중...");
    };
    utter.onend = () => {
      setAiSpeaking(false);
      setAiStatus("답변 대기 중");
    };

    synth.speak(utter);
  }

  // ===== Recording controls (MediaRecorder) =====
  function startRecording() {
    if (!streamRef.current) {
      alert("마이크 스트림이 없습니다. 권한을 확인해주세요.");
      return;
    }

    if (!isMicOn) {
      alert("마이크가 꺼져 있습니다. 마이크를 켜주세요.");
      return;
    }

    // 이미 녹음 중이면 무시
    if (isRecording) return;

    setIsRecording(true);
    setListeningStatus("녹음 중...");
    setTranscript("녹음 중입니다...");

    audioChunksRef.current = [];

    // ✅ 오디오 트랙만 추출해서 녹음 (영상 제외)
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());

    // 브라우저 호환 mimeType 후보
    const mimeTypes = ["audio/webm;codecs=opus", "audio/webm"];
    const selectedMime = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t));

    try {
      const recorder = new MediaRecorder(
        audioStream,
        selectedMime ? { mimeType: selectedMime } : undefined
      );

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const mime = selectedMime || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);

        // ✅ 질문별로 "덮어쓰기"
        setRecordings((prev) => {
          const next = [...prev];

          // 🔥 기존 url 있으면 revoke (메모리 누수 방지)
          revokeUrlSafely(next[currentIndex]?.url);

          next[currentIndex] = {
            blob,
            url,
            mimeType: mime,
            createdAt: new Date().toISOString(),
          };
          return next;
        });

        setTranscript("녹음이 저장되었습니다. 아래에서 재생할 수 있어요.");
        setListeningStatus("녹음 대기 중");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      console.error("MediaRecorder 시작 실패:", err);
      alert("이 브라우저에서 녹음이 지원되지 않거나 설정이 올바르지 않습니다.");
      setIsRecording(false);
      setListeningStatus("녹음 대기 중");
      setTranscript("녹음 시작에 실패했습니다.");
    }
  }

  function stopRecording() {
    setIsRecording(false);
    setListeningStatus("저장 중...");

    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      setListeningStatus("녹음 대기 중");
      return;
    }

    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch (err) {
      console.error("MediaRecorder stop 실패:", err);
      setListeningStatus("녹음 대기 중");
    }
  }

  // ✅ “다시 녹음” (기존 삭제 + 재녹음)
  function rerecordCurrent() {
    if (isRecording) {
      alert("현재 녹음 중입니다. 먼저 답변 완료를 눌러주세요.");
      return;
    }

    if (!confirm("이 질문의 기존 녹음을 삭제하고 다시 녹음할까요?")) return;

    setRecordings((prev) => {
      const next = [...prev];
      revokeUrlSafely(next[currentIndex]?.url);
      next[currentIndex] = null;
      return next;
    });

    setTranscript("기존 녹음을 삭제했습니다. 다시 녹음해주세요.");
    setListeningStatus("녹음 대기 중");
  }

  // ===== Navigation buttons =====
  function goNextQuestion() {
    if (isRecording) {
      alert("먼저 답변 녹음을 완료해주세요.");
      return;
    }

    if (currentIndex + 1 >= questions.length) {
      endInterview();
      return;
    }
    setCurrentIndex((i) => i + 1);
  }

  function skipQuestion() {
    if (!confirm("이 질문을 건너뛰시겠습니까?")) return;
    if (currentIndex + 1 >= questions.length) {
      endInterview();
      return;
    }
    setCurrentIndex((i) => i + 1);
  }

  function jumpTo(index) {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  }

  // ===== Camera/Mic toggle =====
  function toggleCamera() {
    const stream = streamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const next = !isCameraOn;
    track.enabled = next;
    setIsCameraOn(next);
  }

  function toggleMic() {
    const stream = streamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (!track) return;
    const next = !isMicOn;
    track.enabled = next;
    setIsMicOn(next);

    // 마이크 끄면 녹음 중지
    if (!next && isRecording) stopRecording();
  }

  // ===== End interview =====
  function endInterview() {
    if (timerRef.current) clearInterval(timerRef.current);

    window.speechSynthesis?.cancel();

    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch {}

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    setModalOpen(true);
  }

  // ✅ 업로드 함수 (files + questions + meta)
  async function uploadRecordingsToServer() {
    const filesToUpload = recordings
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => r?.blob);

    if (filesToUpload.length === 0) {
      throw new Error("업로드할 녹음 파일이 없습니다.");
    }

    const fd = new FormData();

    // files (질문 순서대로)
    filesToUpload.forEach(({ r, idx }) => {
      const ext = r.mimeType?.includes("webm") ? "webm" : "ogg";
      const file = new File([r.blob], `q${idx + 1}.${ext}`, { type: r.mimeType });
      fd.append("files", file);
    });

    // ✅ questions 같이 보내기 (서버: @RequestParam("questions") List<String>)
    questions.forEach((q) => fd.append("questions", q));

    fd.append("durationSec", String(seconds));
    fd.append("questionCount", String(questions.length));

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const res = await api.post("/api/interview/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress(pct);
        },
      });

      const sessionId = res?.data?.sessionId ?? null;
      setUploadedSessionId(sessionId);

      return res.data;
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "업로드에 실패했습니다. 잠시 후 다시 시도해주세요.";
      setUploadError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  }

  // ✅ 모달에서 "결과 확인(업로드)" 누르면 실행
  async function viewResults() {
    try {
      const data = await uploadRecordingsToServer();
      navigate("/interview/result", { state: { uploadResult: data } });
    } catch (err) {
      alert(err.message);
    }
  }

  function closeModal() {
    setModalOpen(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">🎤 AI 모의 면접</h1>
            <span className="text-gray-400">|</span>
            <span className="text-blue-400 font-semibold">
              질문 <span>{currentIndex + 1}</span> / <span>{questions.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
              <span className="font-mono">{formatTime(seconds)}</span>
            </div>
            <button
              onClick={() => {
                if (confirm("정말 면접을 종료하시겠습니까?")) endInterview();
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              면접 종료
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Webcam */}
            <div className="relative rounded-[20px] overflow-hidden bg-gray-800 shadow-[0_20px_60px_rgba(0,0,0,0.3)] h-[400px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={toggleCamera}
                  className={`bg-gray-700/90 hover:bg-gray-600 p-3 rounded-full transition ${
                    isCameraOn ? "" : "bg-red-600/90 hover:bg-red-700"
                  }`}
                  title="카메라 토글"
                >
                  📷
                </button>
                <button
                  onClick={toggleMic}
                  className={`bg-gray-700/90 hover:bg-gray-600 p-3 rounded-full transition ${
                    isMicOn ? "" : "bg-red-600/90 hover:bg-red-700"
                  }`}
                  title="마이크 토글"
                >
                  🎤
                </button>
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="font-semibold">녹음 중</span>
                </div>
              )}
            </div>

            {/* AI Question */}
            <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div
                    className={[
                      "w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center",
                      aiSpeaking ? "animate-pulse" : "",
                    ].join(" ")}
                  >
                    <span className="text-3xl">🤖</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">AI 면접관</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          aiSpeaking ? "bg-blue-500" : "bg-green-500"
                        }`}
                      />
                      <span
                        className={
                          aiSpeaking ? "text-blue-400 animate-pulse" : "text-gray-400"
                        }
                      >
                        {aiStatus}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-3">💬 면접 질문</div>
                    <p className="text-xl leading-relaxed">{currentQuestion}</p>
                  </div>

                  {aiSpeaking && (
                    <div className="flex items-center gap-1 mt-4">
                      <span className="text-sm text-blue-400 mr-2">AI 음성 재생 중</span>
                      <div className="w-1 h-4 bg-blue-400 rounded animate-pulse" />
                      <div className="w-1 h-6 bg-blue-400 rounded animate-pulse" />
                      <div className="w-1 h-5 bg-blue-400 rounded animate-pulse" />
                      <div className="w-1 h-7 bg-blue-400 rounded animate-pulse" />
                      <div className="w-1 h-4 bg-blue-400 rounded animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transcript / Recording */}
            <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">📝 내 답변</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{listeningStatus}</span>
                </div>
              </div>

              <div className="bg-gray-700 rounded-xl p-6 min-h-[140px]">
                <p className="text-lg leading-relaxed text-gray-300">{transcript}</p>
              </div>

              {/* 녹음 재생 */}
              {currentRecording?.url ? (
                <div className="mt-4 bg-gray-700 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">🎧 녹음 재생</div>
                  <audio controls src={currentRecording.url} className="w-full" />
                  <div className="text-xs text-gray-400 mt-2">
                    저장 형식: {currentRecording.mimeType}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-400">
                  아직 이 질문에 대한 녹음이 없습니다.
                </div>
              )}

              <div className="flex gap-4 mt-6">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
                  >
                    🎤 답변 시작
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
                  >
                    ⏹ 답변 완료
                  </button>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={rerecordCurrent}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  🔁 다시 녹음
                </button>

                <button
                  onClick={skipQuestion}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-semibold transition"
                >
                  건너뛰기
                </button>

                <button
                  onClick={goNextQuestion}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  다음 질문 →
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>💡</span> 면접 팁
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-lg p-4 text-sm">
                  <strong className="text-blue-400">STAR 기법:</strong>
                  <p className="text-gray-300 mt-1">상황(S), 과제(T), 행동(A), 결과(R)</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-sm">
                  <strong className="text-blue-400">구체적으로:</strong>
                  <p className="text-gray-300 mt-1">
                    추상적 답변보다 실제 경험을 구체적으로
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-sm">
                  <strong className="text-blue-400">간결하게:</strong>
                  <p className="text-gray-300 mt-1">2-3분 내로 핵심 전달</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">📋 질문 진행상황</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {questions.map((q, idx) => {
                  const answered = !!recordings[idx]?.url;
                  const active = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => jumpTo(idx)}
                      className={[
                        "w-full text-left p-3 rounded-lg text-sm transition",
                        active
                          ? "bg-blue-600 text-white"
                          : answered
                          ? "bg-green-900 text-green-200"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                      ].join(" ")}
                    >
                      <div className="font-semibold mb-1">Q{idx + 1}</div>
                      <div className="text-xs opacity-80">{q.slice(0, 30)}...</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analysis Info */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-3">🔍 AI 분석 중</h3>
              <div className="text-sm text-blue-100 space-y-2">
                <p>✓ 답변 내용 분석</p>
                <p>✓ 음성 톤 & 속도 분석</p>
                <p>✓ 표정 & 제스처 분석</p>
                <p className="mt-4 font-semibold">면접 종료 후 상세한 피드백을 제공합니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-10 max-w-md w-[92%] text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">면접이 완료되었습니다!</h2>
            <p className="text-gray-300 mb-6">
              총 <span className="text-blue-400 font-semibold">{answeredCount}</span>
              개의 질문에 녹음 답변하셨습니다.
            </p>

            {/* ✅ 업로드 UI */}
            <div className="flex flex-col gap-3">
              {uploadError && (
                <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-3 text-sm">
                  {uploadError}
                </div>
              )}

              {isUploading && (
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-200 mb-2">
                    업로드 중... {uploadProgress}%
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedSessionId && !isUploading && (
                <div className="bg-green-900/30 border border-green-700 text-green-200 rounded-lg p-3 text-sm">
                  업로드 완료! sessionId: <b>{uploadedSessionId}</b>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={viewResults}
                  disabled={isUploading}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                    isUploading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isUploading ? "업로드 중..." : "결과 확인(업로드)"}
                </button>

                <button
                  onClick={closeModal}
                  disabled={isUploading}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                    isUploading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  닫기
                </button>
              </div>

              {uploadError && !isUploading && (
                <button
                  onClick={viewResults}
                  className="w-full bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}