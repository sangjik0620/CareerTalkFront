import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function InterviewSession() {
  const navigate = useNavigate();

  // ===== DOM/Media refs =====
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // ===== Data from InterviewSelect (localStorage) =====
  const interviewData = useMemo(() => {
    try {
      const raw = localStorage.getItem("interviewData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // 질문 개수 설정 반영 (기본 10)
  const totalCount = Number(interviewData?.settings?.questionCount ?? 10);

  // 질문 리스트는 기본 질문에서 questionCount만큼만 사용 (5/10/15 같은 형태)
  // 15처럼 더 많으면 기본 질문을 반복/확장하는 방식으로 처리
  const questions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalCount; i++) {
      arr.push(DEFAULT_QUESTIONS[i % DEFAULT_QUESTIONS.length]);
    }
    return arr;
  }, [totalCount]);

  // ===== State =====
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(""));
  const [isRecording, setIsRecording] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const [seconds, setSeconds] = useState(0);

  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiStatus, setAiStatus] = useState("대기 중"); // "질문 읽는 중..." / "답변 대기 중"
  const [listeningStatus, setListeningStatus] = useState("음성 인식 대기 중");

  const [transcript, setTranscript] = useState("답변 버튼을 눌러 말씀해주세요...");
  const [finalTranscript, setFinalTranscript] = useState(""); // 최종 누적

  const [modalOpen, setModalOpen] = useState(false);

  const currentQuestion = questions[currentIndex];

  // ===== Init: webcam + speech recognition + timer =====
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

    function initSpeechRecognition() {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        // 지원 안 하는 브라우저
        console.warn("SpeechRecognition not supported");
        return;
      }

      const recog = new SpeechRecognition();
      recog.lang = "ko-KR";
      recog.continuous = true;
      recog.interimResults = true;

      recog.onresult = (event) => {
        let interim = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += t + " ";
          else interim += t;
        }

        // final은 누적, interim은 실시간
        setFinalTranscript((prev) => {
          const merged = (prev + finalText).trim();
          const display = (merged + " " + interim).trim();
          setTranscript(display || "답변 버튼을 눌러 말씀해주세요...");
          return merged ? merged + " " : merged; // 유지용
        });

        // 위 setFinalTranscript 내부에서 transcript를 갱신했지만,
        // 혹시 finalText만 있을 때도 표시되도록 fallback
        if (!finalText && interim) {
          setTranscript((p) => p);
        }
      };

      recog.onerror = (event) => {
        console.error("음성 인식 오류:", event.error);
        if (event.error === "no-speech") {
          setListeningStatus("음성이 감지되지 않습니다");
        }
      };

      recog.onend = () => {
        // 녹음 중이면 계속 재시작
        if (isRecording) {
          try {
            recog.start();
          } catch (e) {
            // start() 중복 호출 방지
          }
        }
      };

      recognitionRef.current = recog;
    }

    function startTimer() {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    initWebcam();
    initSpeechRecognition();
    startTimer();

    return () => {
      mounted = false;
      // timer stop
      if (timerRef.current) clearInterval(timerRef.current);

      // stop recognition
      try {
        recognitionRef.current?.stop();
      } catch {}

      // stop TTS
      window.speechSynthesis?.cancel();

      // stop webcam stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // ===== 질문 바뀔 때: transcript 초기화 + TTS 질문 읽기 =====
  useEffect(() => {
    // 질문 변경 시 녹음 중이면 멈추기
    if (isRecording) {
      stopRecording();
    }

    setTranscript("답변 버튼을 눌러 말씀해주세요...");
    setFinalTranscript("");
    setListeningStatus("음성 인식 대기 중");

    // TTS
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

  // ===== Recording controls (STT) =====
  function startRecording() {
    const recog = recognitionRef.current;
    if (!recog) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
      return;
    }

    setIsRecording(true);
    setListeningStatus("음성 인식 중...");
    setTranscript("");
    setFinalTranscript("");

    try {
      recog.start();
    } catch (e) {
      // 이미 start된 경우
    }
  }

  function stopRecording() {
    const recog = recognitionRef.current;
    setIsRecording(false);
    setListeningStatus("음성 인식 대기 중");

    try {
      recog?.stop();
    } catch {}

    // 답변 저장: transcript(최종+중간 포함) 저장
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = transcript?.trim() || "";
      return next;
    });
  }

  // ===== Navigation buttons =====
  function goNextQuestion() {
    if (isRecording) {
      alert("먼저 답변을 완료해주세요.");
      return;
    }
    // 현재 답변 저장
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = transcript?.trim() || "";
      return next;
    });

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
  }

  // ===== End interview =====
  function endInterview() {
    // stop timer
    if (timerRef.current) clearInterval(timerRef.current);

    // stop recognition
    try {
      recognitionRef.current?.stop();
    } catch {}

    // stop TTS
    window.speechSynthesis?.cancel();

    // stop webcam stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    setModalOpen(true);
  }

  const answeredCount = useMemo(() => {
    return answers.filter((a) => a && a.trim() && a !== "답변 버튼을 눌러 말씀해주세요...").length;
  }, [answers]);

  function viewResults() {
    // 여기서 결과 페이지로 라우팅/저장하면 됨
    // 예: localStorage.setItem("interviewAnswers", JSON.stringify(answers));
    alert("면접 분석 결과 페이지로 이동합니다!");
    console.log("면접 답변:", answers);
    // navigate("/interview/results");
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
                      <span className={aiSpeaking ? "text-blue-400 animate-pulse" : "text-gray-400"}>
                        {aiStatus}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-3">💬 면접 질문</div>
                    <p className="text-xl leading-relaxed">{currentQuestion}</p>
                  </div>

                  {/* Audio wave */}
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

            {/* Transcript */}
            <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">📝 내 답변</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{listeningStatus}</span>
                </div>
              </div>

              <div className="bg-gray-700 rounded-xl p-6 min-h-[200px] max-h-[400px] overflow-y-auto">
                <p className="text-lg leading-relaxed text-gray-300">{transcript}</p>
              </div>

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
                  <p className="text-gray-300 mt-1">추상적 답변보다 실제 경험을 구체적으로</p>
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
                  const answered = answers[idx] && answers[idx].trim();
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
              총 <span className="text-blue-400 font-semibold">{answeredCount}</span>개의 질문에 답변하셨습니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={viewResults}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
              >
                결과 확인
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-semibold transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}