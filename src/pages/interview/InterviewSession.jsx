import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

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

function revokeUrlSafely(url) {
  try {
    if (url) URL.revokeObjectURL(url);
  } catch {}
}

const LightGradientOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-28 -right-28 w-[620px] h-[620px] bg-gradient-to-br from-blue-200/70 via-sky-200/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-200/60 via-purple-200/45 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-gradient-to-br from-sky-200/50 via-blue-200/35 to-transparent rounded-full blur-3xl" />
    </div>
  );
};

const glassCard =
  "bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)]";
const glassInner =
  "bg-white/55 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]";

export default function InterviewSession() {
  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadedSessionId, setUploadedSessionId] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const interviewData = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("interviewData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const selectedTargets = useMemo(() => {
    if (Array.isArray(interviewData?.selectedTargets)) return interviewData.selectedTargets;
    if (Array.isArray(interviewData?.targets)) return interviewData.targets;
    return [];
  }, [interviewData]);

  const totalCount = Number(interviewData?.settings?.questionCount ?? 10);

  const questions = useMemo(() => {
    const savedQuestions = Array.isArray(interviewData?.questions)
      ? interviewData.questions.map((q) => String(q || "").trim()).filter(Boolean)
      : [];

    if (savedQuestions.length > 0) {
      return savedQuestions;
    }

    const arr = [];
    for (let i = 0; i < totalCount; i++) {
      arr.push(DEFAULT_QUESTIONS[i % DEFAULT_QUESTIONS.length]);
    }
    return arr;
  }, [interviewData, totalCount]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState(() => Array(questions.length).fill(null));
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiStatus, setAiStatus] = useState("대기 중");
  const [listeningStatus, setListeningStatus] = useState("녹음 대기 중");
  const [transcript, setTranscript] = useState("답변 버튼을 눌러 녹음해주세요...");
  const [modalOpen, setModalOpen] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentRecording = recordings[currentIndex];

  const answeredCount = useMemo(() => {
    return recordings.filter((r) => r?.blob && r?.url).length;
  }, [recordings]);

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
        if (videoRef.current) videoRef.current.srcObject = stream;
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
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();

      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {}

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      recordings.forEach((r) => revokeUrlSafely(r?.url));
    };
  }, []);

  useEffect(() => {
    if (isRecording) stopRecording();
    setTranscript("답변 버튼을 눌러 녹음해주세요...");
    setListeningStatus("녹음 대기 중");
    if (currentQuestion) speakQuestion(currentQuestion);
  }, [currentIndex]);

  function speakQuestion(text) {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;

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

  function startRecording() {
    if (!streamRef.current) {
      alert("마이크 스트림이 없습니다. 권한을 확인해주세요.");
      return;
    }

    if (!isMicOn) {
      alert("마이크가 꺼져 있습니다. 마이크를 켜주세요.");
      return;
    }

    if (isRecording) return;

    setIsRecording(true);
    setListeningStatus("녹음 중...");
    setTranscript("녹음 중입니다...");
    audioChunksRef.current = [];

    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const mimeTypes = ["audio/webm;codecs=opus", "audio/webm"];
    const selectedMime = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t));

    try {
      const recorder = new MediaRecorder(
        audioStream,
        selectedMime ? { mimeType: selectedMime } : undefined
      );

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = selectedMime || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);

        setRecordings((prev) => {
          const next = [...prev];
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
        setListeningStatus("녹음 완료");
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

    if (!next && isRecording) stopRecording();
  }

  function endInterview() {
    if (timerRef.current) clearInterval(timerRef.current);

    window.speechSynthesis?.cancel();

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch {}

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    setModalOpen(true);
  }

  async function uploadRecordingsToServer() {
    const filesToUpload = recordings
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => r?.blob);

    if (filesToUpload.length === 0) {
      throw new Error("업로드할 녹음 파일이 없습니다.");
    }

    const fd = new FormData();

    filesToUpload.forEach(({ r, idx }) => {
      const ext = r.mimeType?.includes("webm") ? "webm" : "wav";
      const audioFile = new File([r.blob], `answer-${idx + 1}.${ext}`, {
        type: r.mimeType || "audio/webm",
      });

      fd.append("files", audioFile);
    });

    questions.forEach((q) => fd.append("questions", q));
    fd.append("durationSec", String(seconds));
    fd.append("questionCount", String(questions.length));

    if (selectedTargets.length > 0) {
      fd.append("targetsJson", JSON.stringify(selectedTargets));
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const res = await api.post("/api/interview/upload", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

  async function viewResults() {
    try {
      const data = await uploadRecordingsToServer();
      const sessionId = data?.sessionId;

      if (!sessionId) {
        navigate("/interview/result", { state: { uploadResult: data } });
        return;
      }

      navigate(`/interview/result/${sessionId}`, {
        state: { uploadResult: data },
      });
    } catch (err) {
      alert(err.message);
    }
  }

  function closeModal() {
    setModalOpen(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      <LightGradientOrbs />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-xl text-white">🎤</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold">
                    <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                      AI 모의 면접
                    </span>
                  </h1>
                  <div className="text-xs text-slate-500">실전 면접 시뮬레이션</div>
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200"></div>

              <div className="flex items-center gap-3">
                <div className="bg-white/70 backdrop-blur-xl border border-blue-200/70 px-4 py-2 rounded-xl shadow-sm">
                  <div className="text-xs text-blue-600 mb-0.5 font-semibold">진행 중</div>
                  <div className="text-lg font-bold text-slate-900">
                    <span className="text-blue-700">{currentIndex + 1}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span>{questions.length}</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-indigo-200/70 px-4 py-2 rounded-xl shadow-sm">
                  <div className="text-xs text-indigo-600 mb-0.5 font-semibold">답변 완료</div>
                  <div className="text-lg font-bold text-slate-900">
                    <span className="text-indigo-700">{answeredCount}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span>{questions.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-slate-200 px-5 py-2.5 rounded-xl shadow-sm">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-xl font-bold text-slate-900 tracking-wider">
                  {formatTime(seconds)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (confirm("정말 면접을 종료하시겠습니까?")) endInterview();
                }}
                className="group bg-white/70 backdrop-blur-xl border border-rose-200 hover:border-rose-300 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 text-rose-700"
              >
                <span>⏹</span>
                <span>면접 종료</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-6 pt-28 pb-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
            <div className={`group relative ${glassCard} overflow-hidden`}>
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />

                {isRecording && (
                  <div className="absolute top-6 left-6 bg-rose-600/90 backdrop-blur-sm px-5 py-2.5 rounded-full flex items-center gap-3 shadow-lg animate-pulse-subtle text-white">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    <span className="font-bold text-sm">REC</span>
                  </div>
                )}

                {!isCameraOn && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📷</div>
                      <div className="text-xl font-semibold text-white">카메라 꺼짐</div>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                  <button
                    onClick={toggleCamera}
                    className={`backdrop-blur-xl p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg border ${
                      isCameraOn
                        ? "bg-white/75 border-white/50"
                        : "bg-rose-600/85 border-rose-400/60 text-white"
                    }`}
                    title={isCameraOn ? "카메라 끄기" : "카메라 켜기"}
                  >
                    <span className="text-2xl">{isCameraOn ? "📷" : "📷❌"}</span>
                  </button>

                  <button
                    onClick={toggleMic}
                    className={`backdrop-blur-xl p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg border ${
                      isMicOn
                        ? "bg-white/75 border-white/50"
                        : "bg-rose-600/85 border-rose-400/60 text-white"
                    }`}
                    title={isMicOn ? "마이크 끄기" : "마이크 켜기"}
                  >
                    <span className="text-2xl">{isMicOn ? "🎤" : "🎤❌"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`${glassCard} p-8`}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-md transform transition-all duration-500 ${
                      aiSpeaking ? "scale-110 animate-pulse-slow" : ""
                    }`}
                  >
                    <span className="text-4xl text-white">🤖</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-5">
                    <h3 className="text-xl font-bold">
                      <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                        AI 면접관
                      </span>
                    </h3>

                    <div className="flex items-center gap-2 bg-white/70 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          aiSpeaking ? "bg-blue-500 animate-pulse" : "bg-emerald-500"
                        }`}
                      ></div>
                      <span className="text-xs font-medium text-slate-600">{aiStatus}</span>
                    </div>
                  </div>

                  <div className={`${glassInner} p-6`}>
                    <div className="flex items-center gap-2 text-sm text-blue-700 mb-4 font-semibold">
                      <span>💬</span>
                      <span>면접 질문</span>
                    </div>
                    <p className="text-2xl leading-relaxed font-semibold text-slate-900">
                      {currentQuestion}
                    </p>
                  </div>

                  {aiSpeaking && (
                    <div className="flex items-center gap-3 mt-5">
                      <span className="text-sm text-blue-700 font-semibold">음성 출력 중</span>
                      <div className="flex items-end gap-1">
                        {[4, 6, 5, 7, 4].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-blue-600 to-indigo-600 rounded-full animate-pulse"
                            style={{
                              height: `${h * 3}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${glassCard} p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <span>내 답변</span>
                </h3>

                <div className="flex items-center gap-3 bg-white/70 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isRecording ? "bg-rose-500 animate-pulse" : "bg-slate-300"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-slate-600">{listeningStatus}</span>
                </div>
              </div>

              <div className={`${glassInner} p-6 min-h-[120px] mb-6`}>
                <p className="text-lg leading-relaxed text-slate-700">{transcript}</p>
              </div>

              {currentRecording?.url && (
                <div className="bg-white/70 backdrop-blur-xl border border-emerald-200/70 rounded-2xl p-5 mb-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 mb-3 font-semibold">
                    <span>🎧</span>
                    <span>녹음 재생</span>
                  </div>
                  <audio controls src={currentRecording.url} className="w-full" />
                  <div className="text-xs text-slate-500 mt-2">형식: {currentRecording.mimeType}</div>
                </div>
              )}

              <div className="space-y-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-5 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">🎤</span>
                    <span>답변 시작</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 px-8 py-5 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-rose-500/20 flex items-center justify-center gap-3 animate-pulse-subtle"
                  >
                    <span className="text-3xl">⏹</span>
                    <span>답변 완료</span>
                  </button>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={rerecordCurrent}
                    className="bg-white/70 backdrop-blur-xl border border-amber-200 hover:border-amber-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-sm flex items-center justify-center gap-2 text-amber-700"
                  >
                    <span>🔁</span>
                    <span>다시 녹음</span>
                  </button>

                  <button
                    onClick={skipQuestion}
                    className="bg-white/70 backdrop-blur-xl border border-slate-200 hover:border-slate-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-sm text-slate-700"
                  >
                    건너뛰기
                  </button>

                  <button
                    onClick={goNextQuestion}
                    className="bg-white/70 backdrop-blur-xl border border-emerald-200 hover:border-emerald-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-sm flex items-center justify-center gap-2 text-emerald-700"
                  >
                    <span>다음</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${glassCard} p-6`}>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  면접 꿀팁
                </span>
              </h3>

              <div className="space-y-3">
                <div className={`${glassInner} p-4 hover:border-blue-200 transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📊</span>
                    <strong className="text-blue-700 text-sm">STAR 기법</strong>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    상황(S) → 과제(T) → 행동(A) → 결과(R) 순서로 구조화된 답변
                  </p>
                </div>

                <div className={`${glassInner} p-4 hover:border-indigo-200 transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <strong className="text-indigo-700 text-sm">구체적 사례</strong>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    추상적 설명보다 실제 경험을 수치와 함께 구체적으로
                  </p>
                </div>

                <div className={`${glassInner} p-4 hover:border-emerald-200 transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏱</span>
                    <strong className="text-emerald-700 text-sm">간결한 답변</strong>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    2-3분 내로 핵심을 명확하게 전달하는 것이 중요
                  </p>
                </div>
              </div>
            </div>

            <div className={`${glassCard} p-6`}>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <span>질문 진행상황</span>
              </h3>

              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {questions.map((q, idx) => {
                  const answered = !!recordings[idx]?.url;
                  const active = idx === currentIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => jumpTo(idx)}
                      className={`group w-full text-left p-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.01] border shadow-sm ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent"
                          : answered
                          ? "bg-white/75 border-emerald-200 text-emerald-800 hover:border-emerald-300"
                          : "bg-white/70 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-bold flex items-center gap-2 ${active ? "text-white" : ""}`}>
                          <span>Q{idx + 1}</span>
                          {answered && <span className="text-xs">✓</span>}
                        </div>
                        {active && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                      </div>
                      <div className={`text-xs opacity-90 line-clamp-2 ${active ? "text-white/90" : ""}`}>
                        {q}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`${glassCard} p-6`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  AI 분석 중
                </span>
              </h3>

              <div className="space-y-3 text-sm">
                <div className={`${glassInner} px-4 py-3 flex items-center gap-3`}>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-slate-700">답변 내용 분석</span>
                </div>
                <div className={`${glassInner} px-4 py-3 flex items-center gap-3`}>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                  <span className="text-slate-700">음성 톤 & 속도 분석</span>
                </div>
                <div className={`${glassInner} px-4 py-3 flex items-center gap-3`}>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  <span className="text-slate-700">표정 & 제스처 분석</span>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200">
                  <p className="text-sm font-semibold text-center bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    면접 종료 후 상세한 피드백을 제공합니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/75 backdrop-blur-xl border border-slate-200 rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_30px_90px_-50px_rgba(15,23,42,0.35)] transform animate-scale-in">
            <div className="text-7xl mb-6 animate-bounce-subtle">🎉</div>

            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              면접 완료!
            </h2>

            <p className="text-slate-700 mb-3">
              총 <span className="text-blue-700 font-bold text-xl">{answeredCount}</span>개의 질문에
            </p>
            <p className="text-slate-700 mb-8">답변을 완료하셨습니다</p>

            <div className="space-y-4 mb-6">
              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm">
                  {uploadError}
                </div>
              )}

              {isUploading && (
                <div className="bg-white/70 border border-slate-200 rounded-2xl p-5">
                  <div className="text-sm text-slate-700 mb-3 font-semibold">
                    업로드 중... {uploadProgress}%
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedSessionId && !isUploading && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 text-sm">
                  ✓ 업로드 완료! <br />
                  <span className="text-xs text-slate-500">sessionId: {uploadedSessionId}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={viewResults}
                disabled={isUploading}
                className={`flex-1 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isUploading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-md hover:shadow-blue-500/20"
                }`}
              >
                {isUploading ? "업로드 중..." : "결과 확인"}
              </button>

              <button
                onClick={closeModal}
                disabled={isUploading}
                className={`flex-1 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isUploading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white/80 border border-slate-200 hover:border-slate-300 text-slate-700 hover:scale-105 shadow-sm"
                }`}
              >
                닫기
              </button>
            </div>

            {uploadError && !isUploading && (
              <button
                onClick={viewResults}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.92; transform: scale(1.01); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.25s ease-out forwards; }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 1.6s ease-in-out infinite; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #2563eb, #4f46e5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #1d4ed8, #4338ca);
        }
      `}</style>
    </div>
  );
}