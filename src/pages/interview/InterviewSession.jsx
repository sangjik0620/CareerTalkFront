// src/pages/InterviewSession.jsx
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

// 배경 그라데이션 오브 (다크 버전)
const DarkGradientOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl animate-orb-slow-1"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-3xl animate-orb-slow-2"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-600/15 to-transparent rounded-full blur-3xl animate-orb-slow-3"></div>
    </div>
  );
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRecording) stopRecording();
    setTranscript("답변 버튼을 눌러 녹음해주세요...");
    setListeningStatus("녹음 대기 중");
    speakQuestion(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

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
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
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
      const ext = r.mimeType?.includes("webm") ? "webm" : "ogg";
      const file = new File([r.blob], `q${idx + 1}.${ext}`, { type: r.mimeType });
      fd.append("files", file);
    });

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white relative">
      {/* 배경 효과 */}
      <DarkGradientOrbs />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Logo & Progress */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🎤</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    AI 모의 면접
                  </h1>
                  <div className="text-xs text-gray-400">실전 면접 시뮬레이션</div>
                </div>
              </div>

              <div className="h-10 w-px bg-gray-700"></div>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 px-4 py-2 rounded-xl">
                  <div className="text-xs text-blue-300 mb-0.5">진행 중</div>
                  <div className="text-lg font-bold text-white">
                    <span className="text-blue-400">{currentIndex + 1}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span>{questions.length}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-4 py-2 rounded-xl">
                  <div className="text-xs text-purple-300 mb-0.5">답변 완료</div>
                  <div className="text-lg font-bold text-white">
                    <span className="text-purple-400">{answeredCount}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span>{questions.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Timer & Exit */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-800/80 border border-gray-700/50 px-5 py-2.5 rounded-xl shadow-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-xl font-bold text-white tracking-wider">
                  {formatTime(seconds)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (confirm("정말 면접을 종료하시겠습니까?")) endInterview();
                }}
                className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
              >
                <span>⏹</span>
                <span>면접 종료</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-6 pt-28 pb-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Webcam Card */}
            <div className="group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-500">
              {/* Video */}
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />

                {/* Recording Badge */}
                {isRecording && (
                  <div className="absolute top-6 left-6 bg-red-600/95 backdrop-blur-sm px-5 py-2.5 rounded-full flex items-center gap-3 shadow-lg animate-pulse-subtle">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    <span className="font-bold text-sm">REC</span>
                  </div>
                )}

                {/* Camera Off Overlay */}
                {!isCameraOn && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📷</div>
                      <div className="text-xl font-semibold text-gray-400">카메라 꺼짐</div>
                    </div>
                  </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                  <button
                    onClick={toggleCamera}
                    className={`group/btn backdrop-blur-xl p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                      isCameraOn
                        ? "bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700"
                        : "bg-red-600/90 hover:bg-red-700/90 border border-red-500"
                    }`}
                    title={isCameraOn ? "카메라 끄기" : "카메라 켜기"}
                  >
                    <span className="text-2xl">{isCameraOn ? "📷" : "📷❌"}</span>
                  </button>

                  <button
                    onClick={toggleMic}
                    className={`group/btn backdrop-blur-xl p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                      isMicOn
                        ? "bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700"
                        : "bg-red-600/90 hover:bg-red-700/90 border border-red-500"
                    }`}
                    title={isMicOn ? "마이크 끄기" : "마이크 켜기"}
                  >
                    <span className="text-2xl">{isMicOn ? "🎤" : "🎤❌"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Question Card */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50">
              <div className="flex items-start gap-6">
                {/* AI Avatar */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-500 ${
                      aiSpeaking ? "scale-110 animate-pulse-slow" : ""
                    }`}
                  >
                    <span className="text-4xl">🤖</span>
                  </div>
                </div>

                <div className="flex-1">
                  {/* AI Status */}
                  <div className="flex items-center gap-4 mb-5">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      AI 면접관
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-800/80 px-4 py-1.5 rounded-full border border-gray-700/50">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          aiSpeaking ? "bg-blue-500 animate-pulse" : "bg-green-500"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-medium ${
                          aiSpeaking ? "text-blue-400" : "text-gray-400"
                        }`}
                      >
                        {aiStatus}
                      </span>
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-2xl p-6 shadow-inner">
                    <div className="flex items-center gap-2 text-sm text-blue-400 mb-4 font-semibold">
                      <span>💬</span>
                      <span>면접 질문</span>
                    </div>
                    <p className="text-2xl leading-relaxed font-medium text-white">
                      {currentQuestion}
                    </p>
                  </div>

                  {/* AI Speaking Indicator */}
                  {aiSpeaking && (
                    <div className="flex items-center gap-3 mt-5">
                      <span className="text-sm text-blue-400 font-semibold">음성 출력 중</span>
                      <div className="flex items-end gap-1">
                        {[4, 6, 5, 7, 4].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full animate-pulse"
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

            {/* Answer Card */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <span>내 답변</span>
                </h3>
                <div className="flex items-center gap-3 bg-gray-900/60 px-4 py-2 rounded-xl border border-gray-700/50">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isRecording ? "bg-red-500 animate-pulse" : "bg-gray-600"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-300">{listeningStatus}</span>
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 min-h-[120px] mb-6 shadow-inner">
                <p className="text-lg leading-relaxed text-gray-300">{transcript}</p>
              </div>

              {/* Audio Player */}
              {currentRecording?.url && (
                <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-700/30 rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-400 mb-3 font-semibold">
                    <span>🎧</span>
                    <span>녹음 재생</span>
                  </div>
                  <audio controls src={currentRecording.url} className="w-full" />
                  <div className="text-xs text-gray-500 mt-2">
                    형식: {currentRecording.mimeType}
                  </div>
                </div>
              )}

              {/* Recording Controls */}
              <div className="space-y-3">
                {/* Primary Button */}
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="group w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-blue-500/50 flex items-center justify-center gap-3"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      🎤
                    </span>
                    <span>답변 시작</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-red-500/50 flex items-center justify-center gap-3 animate-pulse-subtle"
                  >
                    <span className="text-3xl">⏹</span>
                    <span>답변 완료</span>
                  </button>
                )}

                {/* Secondary Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={rerecordCurrent}
                    className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 hover:from-orange-600/30 hover:to-orange-700/30 border border-orange-600/50 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>🔁</span>
                    <span>다시 녹음</span>
                  </button>

                  <button
                    onClick={skipQuestion}
                    className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 border border-gray-600/50 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    건너뛰기
                  </button>

                  <button
                    onClick={goNextQuestion}
                    className="bg-gradient-to-br from-green-600/20 to-teal-600/20 hover:from-green-600/30 hover:to-teal-600/30 border border-green-600/50 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>다음</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Interview Tips */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  면접 꿀팁
                </span>
              </h3>

              <div className="space-y-3">
                <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📊</span>
                    <strong className="text-blue-400 text-sm">STAR 기법</strong>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    상황(S) → 과제(T) → 행동(A) → 결과(R) 순서로 구조화된 답변
                  </p>
                </div>

                <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <strong className="text-purple-400 text-sm">구체적 사례</strong>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    추상적 설명보다 실제 경험을 수치와 함께 구체적으로
                  </p>
                </div>

                <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏱</span>
                    <strong className="text-green-400 text-sm">간결한 답변</strong>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    2-3분 내로 핵심을 명확하게 전달하는 것이 중요
                  </p>
                </div>
              </div>
            </div>

            {/* Question Progress */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <span>질문 진행상황</span>
              </h3>

              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {questions.map((q, idx) => {
                  const answered = !!recordings[idx]?.url;
                  const active = idx === currentIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => jumpTo(idx)}
                      className={`group w-full text-left p-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.02] border ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg"
                          : answered
                          ? "bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-700/50 text-green-200 hover:border-green-600/70"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold flex items-center gap-2">
                          <span>Q{idx + 1}</span>
                          {answered && <span className="text-xs">✓</span>}
                        </div>
                        {active && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-xs opacity-80 line-clamp-2">{q}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Analysis Info */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI 분석 중
                </span>
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 bg-gray-900/40 px-4 py-3 rounded-xl border border-gray-700/50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">답변 내용 분석</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900/40 px-4 py-3 rounded-xl border border-gray-700/50">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">음성 톤 & 속도 분석</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900/40 px-4 py-3 rounded-xl border border-gray-700/50">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">표정 & 제스처 분석</span>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-700/50">
                  <p className="text-sm font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    면접 종료 후 상세한 피드백을 제공합니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700/50 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl transform animate-scale-in">
            <div className="text-7xl mb-6 animate-bounce-subtle">🎉</div>
            
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              면접 완료!
            </h2>
            
            <p className="text-gray-300 mb-3">
              총 <span className="text-blue-400 font-bold text-xl">{answeredCount}</span>개의 질문에
            </p>
            <p className="text-gray-300 mb-8">답변을 완료하셨습니다</p>

            {/* Upload UI */}
            <div className="space-y-4 mb-6">
              {uploadError && (
                <div className="bg-red-900/40 border-2 border-red-700 text-red-200 rounded-2xl p-4 text-sm">
                  {uploadError}
                </div>
              )}

              {isUploading && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-2xl p-5">
                  <div className="text-sm text-gray-200 mb-3 font-semibold">
                    업로드 중... {uploadProgress}%
                  </div>
                  <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedSessionId && !isUploading && (
                <div className="bg-green-900/30 border-2 border-green-700 text-green-200 rounded-2xl p-4 text-sm">
                  ✓ 업로드 완료! <br />
                  <span className="text-xs text-gray-400">sessionId: {uploadedSessionId}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={viewResults}
                disabled={isUploading}
                className={`flex-1 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isUploading
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                }`}
              >
                {isUploading ? "업로드 중..." : "결과 확인"}
              </button>

              <button
                onClick={closeModal}
                disabled={isUploading}
                className={`flex-1 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isUploading
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gray-700 hover:bg-gray-600 hover:scale-105 shadow-lg"
                }`}
              >
                닫기
              </button>
            </div>

            {uploadError && !isUploading && (
              <button
                onClick={viewResults}
                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* 배경 오브 애니메이션 */
        @keyframes orb-slow-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 30px) scale(1.1); }
        }
        @keyframes orb-slow-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -40px) scale(1.15); }
        }
        @keyframes orb-slow-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.1); }
        }
        .animate-orb-slow-1 { animation: orb-slow-1 20s ease-in-out infinite; }
        .animate-orb-slow-2 { animation: orb-slow-2 25s ease-in-out infinite; }
        .animate-orb-slow-3 { animation: orb-slow-3 30s ease-in-out infinite; }

        /* 펄스 애니메이션 */
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        /* 스케일 인 애니메이션 */
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }

        /* 커스텀 스크롤바 */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
}
