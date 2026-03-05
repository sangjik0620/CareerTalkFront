// src/pages/interview/InterviewSelect.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PortfolioUploadModal from "../../components/portfolio/PortfolioUploadModal";
import ClAnalysis from "../ClAnalysis";
import Resume from "../Resume";

const FILE_META = {
  resume: {
    label: "이력서",
    desc: "경력 및 학력 기반 질문",
    color: "blue",
    icon: "📄",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    emptyIcon: "📋",
    emptyMsg: "아직 분석된 이력서가 없어요",
    emptyHint: "이력서를 업로드하고 AI 분석을 받아보세요",
    analyzeLabel: "이력서 분석하기",
    emptyColor: "blue",
  },
  coverLetter: {
    label: "자기소개서",
    desc: "동기 및 역량 기반 질문",
    color: "purple",
    icon: "✍️",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    emptyIcon: "📝",
    emptyMsg: "아직 분석된 자기소개서가 없어요",
    emptyHint: "자기소개서를 업로드하고 AI 분석을 받아보세요",
    analyzeLabel: "자기소개서 분석하기",
    emptyColor: "purple",
  },
  portfolio: {
    label: "포트폴리오",
    desc: "프로젝트 경험 기반 질문",
    color: "green",
    icon: "💼",
    gradient: "from-green-500 to-teal-500",
    bgGradient: "from-green-50 to-teal-50",
    emptyIcon: "🗂️",
    emptyMsg: "아직 분석된 포트폴리오가 없어요",
    emptyHint: "포트폴리오를 업로드하고 AI 분석을 받아보세요",
    analyzeLabel: "포트폴리오 분석하기",
    emptyColor: "teal",
  },
};

const EMPTY_COLOR_MAP = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    text: "text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700",
    dot: "bg-blue-300",
    badge: "bg-blue-100 text-blue-600 border-blue-200",
    ring: "ring-blue-300",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    text: "text-purple-700",
    btn: "bg-purple-600 hover:bg-purple-700",
    dot: "bg-purple-300",
    badge: "bg-purple-100 text-purple-600 border-purple-200",
    ring: "ring-purple-300",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    iconBg: "bg-teal-100",
    text: "text-teal-700",
    btn: "bg-teal-600 hover:bg-teal-700",
    dot: "bg-teal-300",
    badge: "bg-teal-100 text-teal-600 border-teal-200",
    ring: "ring-teal-300",
  },
};

// ─────────────────────────────────────────────
// DB fetch 함수 (실제 API로 교체)
// ─────────────────────────────────────────────
const fetchUserAnalyses = async () => {
  // TODO: 실제 API로 교체
  return {
    // resume: [
    //   {
    //     id: "r1",
    //     title: "2024 상반기 이력서",
    //     fileName: "resume_2024_1H.pdf",
    //     analyzedAt: "2024-03-15",
    //     score: 88,
    //     keywords: ["React", "TypeScript", "3년 경력"],
    //   },
    //   {
    //     id: "r2",
    //     title: "스타트업 지원용 이력서",
    //     fileName: "resume_startup.pdf",
    //     analyzedAt: "2024-05-02",
    //     score: 92,
    //     keywords: ["Node.js", "AWS", "풀스택"],
    //   },
    //   {
    //     id: "r2",
    //     title: "스타트업 지원용 이력서",
    //     fileName: "resume_startup.pdf",
    //     analyzedAt: "2024-05-02",
    //     score: 92,
    //     keywords: ["Node.js", "AWS", "풀스택"],
    //   },
    // ],
    // coverLetter: [],
    // portfolio: [],
  };
};

// ─────────────────────────────────────────────
// 배경 오브 애니메이션
// ─────────────────────────────────────────────
const FlowingGradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-transparent rounded-full blur-3xl animate-orb-1" />
    <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-indigo-400/20 via-purple-400/10 to-transparent rounded-full blur-3xl animate-orb-2" />
    <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-purple-400/20 via-blue-400/10 to-transparent rounded-full blur-3xl animate-orb-3" />
  </div>
);

// ─────────────────────────────────────────────
// 점수 뱃지
// ─────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  const color =
    score >= 90
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : score >= 75
      ? "bg-blue-100 text-blue-700 border-blue-300"
      : "bg-amber-100 text-amber-700 border-amber-300";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {score}점
    </span>
  );
};

// ─────────────────────────────────────────────
// 카드 내부 빈 상태 UI
// ─────────────────────────────────────────────
function CardEmptyState({ meta, onClickAnalyze }) {
  const c = EMPTY_COLOR_MAP[meta.emptyColor];

  return (
    <div className={`rounded-2xl border-2 border-dashed ${c.border} ${c.bg} p-6 text-center`}>
      <div className="relative inline-flex items-center justify-center mb-4">
        <div
          className={`w-16 h-16 ${c.iconBg} rounded-2xl flex items-center justify-center
                      animate-empty-float shadow-inner`}
        >
          <span className="text-3xl">{meta.emptyIcon}</span>
        </div>

        <span
          className={`absolute -top-1 -right-1 w-3 h-3 ${c.dot} rounded-full
                       animate-ping opacity-75`}
        />
        <span className={`absolute -top-1 -right-1 w-3 h-3 ${c.dot} rounded-full`} />
      </div>

      <p className={`font-bold text-sm mb-1 ${c.text}`}>{meta.emptyMsg}</p>
      <p className="text-gray-400 text-xs mb-5 leading-relaxed">{meta.emptyHint}</p>

      <button
        type="button"
        onClick={onClickAnalyze}
        className={`inline-flex items-center gap-2 ${c.btn} text-white
                    text-xs font-bold px-4 py-2 rounded-full
                    transition-all duration-300 hover:scale-105 hover:shadow-lg
                    active:scale-95`}
      >
        <span>✨</span>
        {meta.analyzeLabel}
        <span className="text-[10px] opacity-80">→</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 전체 빈 상태 배너
// ─────────────────────────────────────────────
function GlobalEmptyBanner({ onNavigate }) {
  const steps = [
    { icon: "📤", label: "문서 업로드", desc: "이력서·자소서·포폴" },
    { icon: "🤖", label: "AI 분석", desc: "강점·약점 파악" },
    { icon: "🎤", label: "면접 시작", desc: "맞춤형 질문 생성" },
  ];

  return (
    <div className="mb-12 relative overflow-hidden rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-10 text-center animate-slide-in-up shadow-lg">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl border-2 border-blue-100 animate-empty-float">
          <span className="text-5xl">🗃️</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md animate-bounce-subtle">
          <span className="text-white text-sm font-bold">!</span>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">아직 분석된 자료가 없어요</h3>
      <p className="text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
        면접을 시작하려면 먼저 문서를 분석해야 해요.
        <br />
        AI가 자료를 분석한 후, 이 화면에서 선택하면 됩니다.
      </p>

      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 mb-1">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <span className="text-xs font-bold text-gray-700">{step.label}</span>
              <span className="text-[10px] text-gray-400">{step.desc}</span>
            </div>
            {i < steps.length - 1 && (
              <span className="text-gray-300 text-xl font-light mb-4 mx-1">→</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        분석 후 이 페이지로 돌아오면 자료를 선택할 수 있어요
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 개별 분석 결과 선택 카드
// ─────────────────────────────────────────────
function AnalysisItemCard({ item, isSelected, onSelect, gradient }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300",
        "hover:shadow-md hover:-translate-y-0.5",
        isSelected
          ? `border-transparent bg-gradient-to-br ${gradient} shadow-lg ring-2 ring-offset-2 ring-blue-400`
          : "border-gray-200 bg-white hover:border-blue-300",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`font-bold text-sm leading-tight ${isSelected ? "text-white" : "text-gray-900"}`}>
          {item.title}
        </span>
        <ScoreBadge score={item.score} />
      </div>

      <p className={`text-xs truncate mb-2 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
        📎 {item.fileName}
      </p>

      <div className="flex flex-wrap gap-1 mb-2">
        {item.keywords.map((kw) => (
          <span
            key={kw}
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isSelected ? "bg-white/30 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {kw}
          </span>
        ))}
      </div>

      <p className={`text-xs ${isSelected ? "text-white/70" : "text-gray-400"}`}>
        🕐 분석일: {item.analyzedAt}
      </p>

      {isSelected && (
        <div className="mt-2 flex items-center gap-1 text-white text-xs font-bold">
          <span className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">✓</span>
          선택됨
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// 카테고리별 분석 카드
// ─────────────────────────────────────────────
function AnalysisCategoryCard({
  fileKey,
  meta,
  items,
  selectedId,
  onSelect,
  isLoading,
  index,
  onOpenAnalyze,
}) {
  const hasItems = items && items.length > 0;

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}>
      <div
        className={[
          "group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 transition-all duration-500",
          "hover:-translate-y-1 hover:shadow-2xl",
          selectedId
            ? "border-transparent ring-2 ring-offset-2 ring-blue-300"
            : hasItems
            ? "border-gray-200 hover:border-blue-200"
            : "border-gray-100",
        ].join(" ")}
      >
        {selectedId && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm">
            ✓
          </div>
        )}

        <div className="flex items-center gap-4 mb-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
              selectedId
                ? `bg-gradient-to-br ${meta.gradient} shadow-lg`
                : hasItems
                ? `bg-gradient-to-br ${meta.bgGradient}`
                : "bg-gray-100"
            }`}
          >
            <span className={`text-3xl transition-all duration-300 ${!hasItems && !isLoading ? "grayscale opacity-50" : ""}`}>
              {meta.icon}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-bold ${hasItems ? "text-gray-900" : "text-gray-400"}`}>
                {meta.label}
              </h3>

              {!isLoading && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    hasItems
                      ? "bg-blue-100 text-blue-600 border-blue-200"
                      : "bg-gray-100 text-gray-400 border-gray-200"
                  }`}
                >
                  {hasItems ? `${items.length}개` : "없음"}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{meta.desc}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 mb-4" />

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : !hasItems ? (
          <CardEmptyState meta={meta} onClickAnalyze={() => onOpenAnalyze(fileKey)} />
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scroll">
            {items.map((item) => (
              <AnalysisItemCard
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onSelect={() => onSelect(selectedId === item.id ? null : item.id)}
                gradient={meta.gradient}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function InterviewSelect() {
  const navigate = useNavigate();

  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const openAnalyzeModal = (fileKey) => {
    if (fileKey === "resume") setIsResumeModalOpen(true);
    if (fileKey === "coverLetter") setIsCoverLetterModalOpen(true);
    if (fileKey === "portfolio") setIsPortfolioModalOpen(true);
  };

  const [analyses, setAnalyses] = useState({ resume: [], coverLetter: [], portfolio: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedIds, setSelectedIds] = useState({
    resume: null,
    coverLetter: null,
    portfolio: null,
  });

  const [settings, setSettings] = useState({
    questionCount: "10",
    difficulty: "medium",
    jobPosition: "it-data",
  });

  useEffect(() => {
    setIsLoading(true);
    fetchUserAnalyses()
      .then((data) => {
        setAnalyses(data);
        setFetchError(null);
      })
      .catch(() => setFetchError("분석 결과를 불러오는 데 실패했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const isAllEmpty = useMemo(
    () => !isLoading && Object.values(analyses).every((list) => list.length === 0),
    [analyses, isLoading]
  );

  const hasSelection = useMemo(
    () => Object.values(selectedIds).some((id) => id !== null),
    [selectedIds]
  );

  const selectedSummary = useMemo(() => {
    return Object.entries(selectedIds)
      .filter(([, id]) => id !== null)
      .map(([key, id]) => {
        const item = analyses[key]?.find((a) => a.id === id);
        return item ? { key, label: FILE_META[key].label, ...item } : null;
      })
      .filter(Boolean);
  }, [selectedIds, analyses]);

  const handleSelect = (key, id) => setSelectedIds((prev) => ({ ...prev, [key]: id }));

  const startInterview = () => {
    if (!hasSelection) return;
    localStorage.setItem(
      "interviewData",
      JSON.stringify({ selectedAnalyses: selectedIds, settings })
    );
    navigate("/interview/session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 relative">
      <FlowingGradientOrbs />

      {/* Header */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CareerTalk
            </h1>
            <button
              onClick={() => navigate("/")}
              className="text-gray-700 hover:text-blue-600 transition font-medium flex items-center gap-2"
            >
              ← 메인으로 돌아가기
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-5 py-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border-2 border-blue-300 shadow-md animate-slide-in-down">
            <span className="text-blue-700 text-sm font-bold flex items-center gap-2">
              <span className="animate-bounce-subtle">🎤</span>
              AI 모의 면접 준비
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-in-up">
            분석된 자료를{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              선택
            </span>
            해주세요
          </h2>

          <p className="text-xl text-gray-600 animate-slide-in-up animation-delay-300">
            이전에 분석한 자료 중 최소 1개를 선택하면 AI가 맞춤형 질문을 생성합니다
          </p>
        </div>

        {/* Fetch Error */}
        {fetchError && (
          <div className="mb-8 flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl font-semibold">
            <span className="text-2xl">⚠️</span>
            {fetchError}
          </div>
        )}

        {/* ✅ 전체 빈 상태 배너 */}
        {isAllEmpty && <GlobalEmptyBanner onNavigate={() => openAnalyzeModal("resume")} />}

        {/* Category Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Object.keys(FILE_META).map((key, idx) => (
            <AnalysisCategoryCard
              key={key}
              fileKey={key}
              meta={FILE_META[key]}
              items={analyses[key]}
              selectedId={selectedIds[key]}
              onSelect={(id) => handleSelect(key, id)}
              isLoading={isLoading}
              index={idx}
              onOpenAnalyze={openAnalyzeModal}
            />
          ))}
        </div>

        {/* Selected Summary */}
        {selectedSummary.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-12 shadow-lg animate-slide-in-up">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full text-white text-sm">
                ✓
              </span>
              선택된 분석 자료
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {selectedSummary.map((item) => (
                <div key={item.key} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{FILE_META[item.key].icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm mb-0.5">
                        {item.label}
                      </div>
                      <div
                        className="text-xs text-gray-600 truncate font-medium"
                        title={item.title}
                      >
                        {item.title}
                      </div>
                      <div className="mt-1">
                        <ScoreBadge score={item.score} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-blue-100 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
              ⚙️
            </span>
            면접 설정
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-blue-600">📊</span> 질문 개수
              </label>
              <select
                value={settings.questionCount}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, questionCount: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-blue-300 font-medium"
              >
                <option value="5">5개 (약 10분)</option>
                <option value="10">10개 (약 20분)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-purple-600">🎯</span> 면접 난이도
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, difficulty: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white hover:border-purple-300 font-medium"
              >
                <option value="easy">초급 (기본 질문)</option>
                <option value="medium">중급 (일반적인 면접)</option>
                <option value="hard">고급 (심화 질문)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-green-600">💼</span> 지원 직군
              </label>
              <select
                value={settings.jobPosition}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, jobPosition: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white hover:border-green-300 font-medium">
                <option value="strategy">기획∙전략</option>
                <option value="marketing">마케팅∙홍보∙조사</option>
                <option value="finance-accounting">회계∙세무∙재무</option>
                <option value="hr">인사∙노무∙HRD</option>
                <option value="admin-legal">총무∙법무∙사무</option>
                <option value="it-data">IT개발∙데이터</option>
                <option value="design">디자인</option>
                <option value="sales-trade">영업∙판매∙무역</option>
                <option value="cs-tm">고객상담∙TM</option>
                <option value="logistics">구매∙자재∙물류</option>
                <option value="md">상품기획∙MD</option>
                <option value="transport">운전∙운송∙배송</option>
                <option value="service">서비스</option>
                <option value="production">생산</option>
                <option value="construction">건설∙건축</option>
                <option value="medical">의료</option>
                <option value="rnd">연구∙R&D</option>
                <option value="education">교육</option>
                <option value="media-culture-sports">미디어∙문화∙스포츠</option>
                <option value="banking-insurance">금융∙보험</option>
                <option value="public-welfare">공공∙복지</option>
              </select>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center justify-center gap-4">
          {!hasSelection ? (
            <div className="inline-flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-3 rounded-full text-sm font-semibold animate-pulse">
              <span>⚠️</span>
              최소 1개 이상의 분석 자료를 선택해주세요
            </div>
          ) : (
            <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span>
              준비 완료! 면접을 시작할 수 있습니다
            </p>
          )}

          <button
            onClick={startInterview}
            disabled={!hasSelection}
            className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                       bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-16 py-5 rounded-full
                       font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-500
                       transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:transform-none overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">🎤</span>
              면접 시작하기
              <span className="transform group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </div>

      {/* ✅ 모달 렌더링 (Home처럼) */}
      <Resume
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onAnalyzeSuccess={() => setIsResumeModalOpen(false)}
      />

      <ClAnalysis
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
      />

      <PortfolioUploadModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
      />

      <style>{`
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

        @keyframes empty-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(-8px) rotate(-2deg); }
          70% { transform: translateY(-4px) rotate(2deg); }
        }
        .animate-empty-float { animation: empty-float 3.5s ease-in-out infinite; }

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

        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}