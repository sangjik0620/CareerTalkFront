// src/pages/InterviewSelect.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const FILE_META = {
  resume: {
    label: "이력서",
    desc: "경력 및 학력 기반 질문",
    accepts: [".pdf", ".doc", ".docx"],
    color: "blue",
    icon: "📄",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
  },
  coverLetter: {
    label: "자기소개서",
    desc: "동기 및 역량 기반 질문",
    accepts: [".pdf", ".doc", ".docx", ".txt"],
    color: "purple",
    icon: "✍️",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
  portfolio: {
    label: "포트폴리오",
    desc: "프로젝트 경험 기반 질문",
    accepts: [".pdf", ".ppt", ".pptx"],
    color: "green",
    icon: "💼",
    gradient: "from-green-500 to-teal-500",
    bgGradient: "from-green-50 to-teal-50",
  },
};

// 흐르는 그라데이션 오브 배경 (홈 화면과 동일)
const FlowingGradientOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-transparent rounded-full blur-3xl animate-orb-1"></div>
      <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-indigo-400/20 via-purple-400/10 to-transparent rounded-full blur-3xl animate-orb-2"></div>
      <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-purple-400/20 via-blue-400/10 to-transparent rounded-full blur-3xl animate-orb-3"></div>
    </div>
  );
};

export default function InterviewSelect() {
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState({
    resume: null,
    coverLetter: null,
    portfolio: null,
  });

  const [dragOverKey, setDragOverKey] = useState(null);

  const [settings, setSettings] = useState({
    questionCount: "10",
    difficulty: "medium",
    jobPosition: "developer",
  });

  const hasFiles = useMemo(
    () => Object.values(selectedFiles).some((f) => f !== null),
    [selectedFiles]
  );

  const selectedList = useMemo(() => {
    return Object.entries(selectedFiles)
      .filter(([, file]) => file)
      .map(([key, file]) => ({ key, label: FILE_META[key].label, name: file.name }));
  }, [selectedFiles]);

  const handlePick = (key, file) => {
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleDrop = (e, key) => {
    e.preventDefault();
    setDragOverKey(null);
    const file = e.dataTransfer.files?.[0];
    handlePick(key, file);
  };

  const startInterview = () => {
    if (!hasFiles) return;

    const interviewData = {
      files: {
        resume: selectedFiles.resume ? selectedFiles.resume.name : null,
        coverLetter: selectedFiles.coverLetter ? selectedFiles.coverLetter.name : null,
        portfolio: selectedFiles.portfolio ? selectedFiles.portfolio.name : null,
      },
      settings: { ...settings },
    };

    localStorage.setItem("interviewData", JSON.stringify(interviewData));
    navigate("/interview/session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 relative">
      {/* 배경 효과 */}
      <FlowingGradientOrbs />

      {/* Header */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareerTalk
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-gray-700 hover:text-blue-600 transition font-medium flex items-center gap-2"
            >
              <span>←</span> 메인으로 돌아가기
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Title Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-5 py-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border-2 border-blue-300 shadow-md animate-slide-in-down">
            <span className="text-blue-700 text-sm font-bold flex items-center gap-2">
              <span className="animate-bounce-subtle">🎤</span>
              AI 모의 면접 준비
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-in-up">
            면접 자료를{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              업로드
            </span>
            해주세요
          </h2>
          
          <p className="text-xl text-gray-600 animate-slide-in-up animation-delay-300">
            최소 1개 이상의 자료를 선택하면 AI가 맞춤형 질문을 생성합니다
          </p>
        </div>

        {/* File Upload Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Object.keys(FILE_META).map((key, idx) => (
            <FileCard
              key={key}
              fileKey={key}
              meta={FILE_META[key]}
              file={selectedFiles[key]}
              isDragOver={dragOverKey === key}
              onDragOver={() => setDragOverKey(key)}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={(e) => handleDrop(e, key)}
              onPick={(file) => handlePick(key, file)}
              index={idx}
            />
          ))}
        </div>

        {/* Selected Files Summary */}
        {selectedList.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-12 shadow-lg animate-slide-in-up">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full text-white text-sm">
                ✓
              </span>
              선택된 자료
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {selectedList.map((it) => (
                <div key={it.key} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{FILE_META[it.key].icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm mb-1">{it.label}</div>
                      <div className="text-xs text-gray-600 truncate" title={it.name}>{it.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-blue-100 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
              ⚙️
            </span>
            면접 설정
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 질문 개수 */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-blue-600">📊</span>
                질문 개수
              </label>
              <select
                value={settings.questionCount}
                onChange={(e) => setSettings((p) => ({ ...p, questionCount: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-blue-300 font-medium"
              >
                <option value="5">5개 (약 10분)</option>
                <option value="10">10개 (약 20분)</option>
                <option value="15">15개 (약 30분)</option>
              </select>
            </div>

            {/* 면접 난이도 */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-purple-600">🎯</span>
                면접 난이도
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => setSettings((p) => ({ ...p, difficulty: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white hover:border-purple-300 font-medium"
              >
                <option value="easy">초급 (기본 질문)</option>
                <option value="medium">중급 (일반적인 면접)</option>
                <option value="hard">고급 (심화 질문)</option>
              </select>
            </div>

            {/* 지원 직무 */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-green-600">💼</span>
                지원 직무
              </label>
              <select
                value={settings.jobPosition}
                onChange={(e) => setSettings((p) => ({ ...p, jobPosition: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white hover:border-green-300 font-medium"
              >
                <option value="developer">소프트웨어 개발자</option>
                <option value="designer">디자이너</option>
                <option value="marketer">마케터</option>
                <option value="pm">프로덕트 매니저</option>
                <option value="data">데이터 분석가</option>
                <option value="general">일반 직무</option>
              </select>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={startInterview}
            disabled={!hasFiles}
            className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-16 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-2xl overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">🎤</span>
              면접 시작하기
              <span className="transform group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>

          {!hasFiles && (
            <div className="mt-6 inline-flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-3 rounded-full text-sm font-semibold animate-pulse">
              <span>⚠️</span>
              최소 1개 이상의 자료를 업로드해주세요
            </div>
          )}

          {hasFiles && (
            <p className="mt-6 text-gray-600 text-sm flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span>
              준비 완료! 면접을 시작할 수 있습니다
            </p>
          )}
        </div>
      </div>

      <style>{`
        /* 홈 화면과 동일한 애니메이션 */
        @keyframes orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, 50px) scale(1.1); }
          66% { transform: translate(-50px, -30px) scale(0.9); }
        }
        @keyframes orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-80px, 60px) scale(1.15); }
          66% { transform: translate(40px, -40px) scale(0.95); }
        }
        @keyframes orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -50px) scale(1.2); }
        }
        .animate-orb-1 { animation: orb-1 25s ease-in-out infinite; }
        .animate-orb-2 { animation: orb-2 30s ease-in-out infinite; }
        .animate-orb-3 { animation: orb-3 28s ease-in-out infinite; }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }

        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-down { animation: slideInDown 1s ease-out forwards; }
        .animate-slide-in-up { animation: slideInUp 1s ease-out forwards; }
        .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }

        .bg-size-200 { background-size: 200% auto; }
        .bg-pos-0 { background-position: 0% center; }
        .bg-pos-100 { background-position: 100% center; }
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

function FileCard({
  fileKey,
  meta,
  file,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onPick,
  index,
}) {
  const selected = Boolean(file);

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
    >
      <div
        className={[
          "group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 transition-all duration-500",
          "hover:-translate-y-2 hover:shadow-2xl",
          selected
            ? `border-transparent bg-gradient-to-br ${meta.bgGradient}`
            : "border-gray-200 hover:border-blue-300",
        ].join(" ")}
      >
        {/* 선택 체크 표시 */}
        {selected && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-scale-in">
            ✓
          </div>
        )}

        <div className="text-center">
          {/* 아이콘 */}
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
              selected
                ? `bg-gradient-to-br ${meta.gradient} shadow-xl`
                : `bg-gradient-to-br ${meta.bgGradient}`
            }`}
          >
            <span className={`text-5xl ${selected ? 'transform scale-110' : ''} transition-transform duration-300`}>
              {meta.icon}
            </span>
          </div>

          {/* 제목 */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{meta.label}</h3>
          <p className="text-gray-600 mb-6">{meta.desc}</p>

          {/* 드롭존 */}
          <div
            className={[
              "rounded-2xl p-8 text-center border-2 border-dashed transition-all duration-300",
              isDragOver
                ? `bg-blue-50 border-blue-400 scale-105`
                : selected
                ? "border-gray-300 bg-white/80"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50",
            ].join(" ")}
            onDragOver={(e) => {
              e.preventDefault();
              onDragOver();
            }}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input
              type="file"
              className="hidden"
              accept={meta.accepts.join(",")}
              id={`file-input-${fileKey}`}
              onChange={(e) => onPick(e.target.files?.[0])}
            />

            {!file ? (
              <>
                <div className="text-4xl mb-4 opacity-40">📁</div>
                <p className="text-sm text-gray-600 mb-2">
                  <button
                    type="button"
                    className={`bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent font-bold hover:underline`}
                    onClick={() => document.getElementById(`file-input-${fileKey}`)?.click()}
                  >
                    파일 선택
                  </button>{" "}
                  또는 드래그 & 드롭
                </p>
                <p className="text-xs text-gray-400 mt-3 font-medium">
                  {meta.accepts.join(", ").toUpperCase().replace(/\./g, "")}
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl mb-2">✅</div>
                <div className="font-semibold text-gray-900 text-sm">{file.name}</div>
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-input-${fileKey}`)?.click()}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  다른 파일 선택
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}