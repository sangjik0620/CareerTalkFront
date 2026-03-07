// src/components/interview/DeviceTestModal.jsx
import { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const BAR_COUNT = 28; // 마이크 레벨 바 개수

// ─────────────────────────────────────────────
// 헬퍼: 오디오 레벨 → 바 배열 생성
// ─────────────────────────────────────────────
function buildBars(level) {
  // level: 0~100
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const threshold = (i / BAR_COUNT) * 100;
    return threshold <= level;
  });
}

// ─────────────────────────────────────────────
// 상태 뱃지
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    idle:    { label: "대기 중",     cls: "bg-gray-100 text-gray-500 border-gray-200",          dot: "bg-gray-400"    },
    testing: { label: "테스트 중…",  cls: "bg-blue-100 text-blue-600 border-blue-200",           dot: "bg-blue-500"    },
    ok:      { label: "정상 작동",   cls: "bg-emerald-100 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500" },
    error:   { label: "오류 발생",   cls: "bg-red-100 text-red-600 border-red-200",              dot: "bg-red-500"     },
    denied:  { label: "권한 거부됨", cls: "bg-amber-100 text-amber-700 border-amber-200",        dot: "bg-amber-500"   },
  };
  const s = map[status] ?? map.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${s.cls}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot} ${status === "testing" ? "animate-ping" : ""}`} />
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// 마이크 레벨 비주얼라이저
// ─────────────────────────────────────────────
function MicVisualizer({ level, isActive }) {
  const bars = buildBars(level);
  return (
    <div className="flex items-end justify-center gap-[3px] h-10 px-2">
      {bars.map((active, i) => {
        const heightPct = 20 + ((i / BAR_COUNT) * 80);
        const isLit = isActive && active;
        const color = isLit
          ? level > 80 ? "bg-red-400"
          : level > 55 ? "bg-amber-400"
          : "bg-emerald-400"
          : "bg-gray-200";
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-75 ${color}`}
            style={{
              width: 5,
              height: `${isLit ? heightPct : 20}%`,
              opacity: isLit ? 1 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// 섹션 래퍼
// ─────────────────────────────────────────────
function Section({ icon, gradient, title, badge, children }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white text-base shadow-sm`}>
            {icon}
          </div>
          <span className="font-bold text-gray-800 text-sm">{title}</span>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 디바이스 선택 드롭다운
// ─────────────────────────────────────────────
function DeviceSelect({ devices, value, onChange, placeholder }) {
  if (!devices || devices.length <= 1) return null;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
    >
      {devices.map((d) => (
        <option key={d.deviceId} value={d.deviceId}>
          {d.label || placeholder}
        </option>
      ))}
    </select>
  );
}

// ─────────────────────────────────────────────
// 메인 모달
// ─────────────────────────────────────────────
export default function DeviceTestModal({ isOpen, onClose, onConfirm }) {
  /* ── 카메라 ── */
  const videoRef             = useRef(null);
  const cameraStreamRef      = useRef(null);
  const [camStatus,  setCamStatus]  = useState("idle");   // idle | testing | ok | error | denied
  const [camDevices, setCamDevices] = useState([]);
  const [camDeviceId, setCamDeviceId] = useState("");
  const [isCamMirrored, setIsCamMirrored] = useState(true);

  /* ── 마이크 ── */
  const audioCtxRef          = useRef(null);
  const analyserRef          = useRef(null);
  const micStreamRef         = useRef(null);
  const rafRef               = useRef(null);
  const [micStatus,  setMicStatus]  = useState("idle");
  const [micLevel,   setMicLevel]   = useState(0);
  const [micDevices, setMicDevices] = useState([]);
  const [micDeviceId, setMicDeviceId] = useState("");
  const [isMicTesting, setIsMicTesting] = useState(false);

  /* ── 체크리스트 ── */
  const camOk = camStatus === "ok";
  const micOk = micStatus === "ok";
  const allReady = camOk && micOk;

  // ── 모달 열릴 때 디바이스 목록 조회 ──
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.enumerateDevices().then((list) => {
      setCamDevices(list.filter((d) => d.kind === "videoinput"));
      setMicDevices(list.filter((d) => d.kind === "audioinput"));
    });
  }, [isOpen]);

  // ── 모달 닫힐 때 스트림 정리 ──
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      stopMic();
      setCamStatus("idle");
      setMicStatus("idle");
      setMicLevel(0);
      setIsMicTesting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── ESC 닫기 ──
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // ────────────────────────────────────────────
  // 카메라
  // ────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCamStatus("testing");
    try {
      const constraints = {
        video: camDeviceId ? { deviceId: { exact: camDeviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // 디바이스 라벨 재조회 (권한 취득 후)
      const list = await navigator.mediaDevices.enumerateDevices();
      setCamDevices(list.filter((d) => d.kind === "videoinput"));
      setMicDevices(list.filter((d) => d.kind === "audioinput"));
      setCamStatus("ok");
    } catch (err) {
      setCamStatus(err.name === "NotAllowedError" ? "denied" : "error");
    }
  }, [camDeviceId, stopCamera]);

  // 디바이스 변경 시 재시작
  useEffect(() => {
    if (camStatus === "ok" || camStatus === "testing") startCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camDeviceId]);

  // ────────────────────────────────────────────
  // 마이크
  // ────────────────────────────────────────────
  const stopMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    setMicLevel(0);
    setIsMicTesting(false);
  }, []);

  const startMic = useCallback(async () => {
    stopMic();
    setMicStatus("testing");
    setIsMicTesting(true);
    try {
      const constraints = {
        audio: micDeviceId ? { deviceId: { exact: micDeviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;

      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setMicLevel(Math.min(100, avg * 2.2)); // 0~100 스케일
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const list = await navigator.mediaDevices.enumerateDevices();
      setMicDevices(list.filter((d) => d.kind === "audioinput"));
      setMicStatus("ok");
    } catch (err) {
      setMicStatus(err.name === "NotAllowedError" ? "denied" : "error");
      setIsMicTesting(false);
    }
  }, [micDeviceId, stopMic]);

  const toggleMic = () => {
    if (isMicTesting) {
      stopMic();
      setMicStatus("idle");
    } else {
      startMic();
    }
  };

  // 디바이스 변경 시 재시작
  useEffect(() => {
    if (micStatus === "ok" || micStatus === "testing") startMic();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micDeviceId]);

  // ────────────────────────────────────────────
  // 면접 시작 확정
  // ────────────────────────────────────────────
  const handleConfirm = () => {
    stopCamera();
    stopMic();
    onConfirm();
  };

  // ────────────────────────────────────────────
  if (!isOpen) return null;
  // ────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* 딤 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 패널 */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/80 animate-modal-in custom-scroll">

        {/* ── 헤더 ── */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              🎙️
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">기기 테스트</h2>
              <p className="text-xs text-gray-400">면접 전 마이크·카메라를 확인해주세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="px-7 py-6 space-y-5">

          {/* ── 진행 상태 인디케이터 ── */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl px-5 py-3">
            {[
              { label: "카메라", ok: camOk, icon: "📷" },
              { label: "마이크", ok: micOk, icon: "🎤" },
              { label: "면접 시작", ok: allReady, icon: "🚀" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-3 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                    step.ok
                      ? "bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-md"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  ].join(" ")}>
                    {step.ok ? "✓" : step.icon}
                  </div>
                  <span className={`text-[10px] font-semibold ${step.ok ? "text-emerald-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step.ok ? "bg-emerald-300" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── 카메라 섹션 ── */}
          <Section
            icon="📷"
            gradient="from-blue-500 to-indigo-500"
            title="카메라 테스트"
            badge={<StatusBadge status={camStatus} />}
          >
            {/* 비디오 프리뷰 */}
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-4 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transition-transform duration-300 ${isCamMirrored ? "-scale-x-100" : ""}`}
              />
              {/* 오버레이: 대기 중 */}
              {camStatus !== "ok" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/80">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${camStatus === "testing" ? "animate-pulse bg-blue-500/20" : "bg-gray-700"}`}>
                    {camStatus === "denied" ? "🚫" : camStatus === "error" ? "⚠️" : "📷"}
                  </div>
                  <p className="text-white/80 text-sm font-semibold">
                    {camStatus === "denied"  ? "카메라 권한이 필요합니다"
                     : camStatus === "error"  ? "카메라를 불러올 수 없습니다"
                     : camStatus === "testing"? "카메라 연결 중…"
                     : "카메라를 시작해주세요"}
                  </p>
                </div>
              )}
              {/* 거울모드 토글 */}
              {camStatus === "ok" && (
                <button
                  onClick={() => setIsCamMirrored((p) => !p)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-200 font-medium"
                >
                  🔄 {isCamMirrored ? "거울 해제" : "거울 모드"}
                </button>
              )}
              {/* 녹화 표시점 */}
              {camStatus === "ok" && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-semibold">LIVE</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <button
                onClick={camStatus === "ok" ? stopCamera : startCamera}
                className={[
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                  "hover:scale-105 active:scale-95 shadow-sm",
                  camStatus === "ok"
                    ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md",
                ].join(" ")}
              >
                {camStatus === "testing" ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 연결 중…</>
                ) : camStatus === "ok" ? (
                  <><span>⏹</span> 카메라 끄기</>
                ) : (
                  <><span>▶</span> 카메라 켜기</>
                )}
              </button>
              <DeviceSelect
                devices={camDevices}
                value={camDeviceId}
                onChange={(id) => { setCamDeviceId(id); }}
                placeholder="카메라 선택"
              />
            </div>

            {(camStatus === "denied" || camStatus === "error") && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 leading-relaxed">
                {camStatus === "denied"
                  ? "⚠️ 브라우저 주소창 왼쪽의 🔒 아이콘을 클릭해 카메라 권한을 허용해주세요."
                  : "⚠️ 다른 앱이 카메라를 사용 중이거나 카메라가 연결되지 않았습니다."}
              </p>
            )}
          </Section>

          {/* ── 마이크 섹션 ── */}
          <Section
            icon="🎤"
            gradient="from-violet-500 to-purple-500"
            title="마이크 테스트"
            badge={<StatusBadge status={micStatus} />}
          >
            {/* 비주얼라이저 영역 */}
            <div className="bg-gray-900 rounded-2xl px-6 py-5 mb-4 shadow-inner">
              <MicVisualizer level={micLevel} isActive={isMicTesting} />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-gray-400 text-xs">
                  {isMicTesting ? "말씀해보세요 🎤" : "테스트 시작 버튼을 눌러주세요"}
                </span>
                {/* 레벨 수치 */}
                <span className={`text-xs font-bold ${
                  micLevel > 80 ? "text-red-400"
                  : micLevel > 55 ? "text-amber-400"
                  : micLevel > 5  ? "text-emerald-400"
                  : "text-gray-500"
                }`}>
                  {isMicTesting ? `${Math.round(micLevel)}%` : "--"}
                </span>
              </div>
              {/* 레벨 게이지 바 */}
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    micLevel > 80 ? "bg-red-400"
                    : micLevel > 55 ? "bg-amber-400"
                    : "bg-emerald-400"
                  }`}
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <button
                onClick={toggleMic}
                className={[
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                  "hover:scale-105 active:scale-95 shadow-sm",
                  isMicTesting
                    ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    : "bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:shadow-md",
                ].join(" ")}
              >
                {micStatus === "testing" && !isMicTesting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 연결 중…</>
                ) : isMicTesting ? (
                  <><span>⏹</span> 테스트 중지</>
                ) : (
                  <><span>▶</span> 마이크 테스트</>
                )}
              </button>
              <DeviceSelect
                devices={micDevices}
                value={micDeviceId}
                onChange={(id) => { setMicDeviceId(id); }}
                placeholder="마이크 선택"
              />
            </div>

            {(micStatus === "denied" || micStatus === "error") && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 leading-relaxed">
                {micStatus === "denied"
                  ? "⚠️ 브라우저 주소창 왼쪽의 🔒 아이콘을 클릭해 마이크 권한을 허용해주세요."
                  : "⚠️ 마이크를 감지하지 못했습니다. 마이크가 연결되어 있는지 확인해주세요."}
              </p>
            )}

            {/* 마이크 감도 힌트 */}
            {micOk && (
              <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <span className="text-base leading-none mt-0.5">💡</span>
                <span>말할 때 초록색 바가 올라오면 정상입니다. 바가 너무 낮으면 마이크 볼륨을 높여주세요.</span>
              </div>
            )}
          </Section>

          {/* ── 준비 완료 배너 ── */}
          {allReady && (
            <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-5 py-4 animate-slide-in-up">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center text-white text-xl shadow-md animate-bounce-subtle shrink-0">
                🎉
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">기기 테스트 완료!</p>
                <p className="text-xs text-emerald-600">카메라와 마이크가 정상 작동합니다. 면접을 시작할 수 있어요.</p>
              </div>
            </div>
          )}

        </div>{/* /px-7 py-6 */}

        {/* ── 푸터 버튼 ── */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-7 py-5 flex flex-col sm:flex-row items-center gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            취소
          </button>

          <button
            onClick={handleConfirm}
            disabled={!allReady}
            className={[
              "group relative w-full sm:flex-1 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg",
              "transition-all duration-500 overflow-hidden",
              "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white",
              "hover:shadow-xl hover:scale-[1.02] active:scale-100",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
            ].join(" ")}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {allReady ? (
                <><span className="text-base">🚀</span> 테스트 완료 — 면접 시작하기 <span className="group-hover:translate-x-1 transition-transform duration-300">→</span></>
              ) : (
                <><span className="text-base">⏳</span> 카메라·마이크 테스트를 완료해주세요</>
              )}
            </span>
            {/* hover shimmer */}
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </button>
        </div>

        {/* ── 애니메이션 스타일 ── */}
        <style>{`
          @keyframes modalIn {
            from { opacity:0; transform:scale(0.93) translateY(20px); }
            to   { opacity:1; transform:scale(1)    translateY(0); }
          }
          .animate-modal-in { animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        `}</style>
      </div>
    </div>
  );
}
