import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PortfolioUploadModal from "../../components/portfolio/PortfolioUploadModal";
import ClAnalysis from "../ClAnalysis";
import Resume from "../Resume";
import logo from "../../img/logo.png";
import DeviceTestModal from "../interview/DeviceTestModal";

import { api } from "../../lib/api";

// ─────────────────────────────────────────────
const FILE_META = {
  resume: {
    label: "이력서",
    desc: "경력 및 학력 기반 질문",
    icon: "📄",
    gradient: "from-blue-500 to-indigo-500",
    lightBg: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    ringColor: "ring-blue-400",
    badgeColor: "bg-blue-100 text-blue-600 border-blue-200",
    emptyIcon: "📋",
    emptyMsg: "아직 분석된 이력서가 없어요",
    emptyHint: "이력서를 업로드하고 AI 분석을 받아보세요",
    analyzeLabel: "이력서 분석하기",
    emptyColor: "blue",
    dotColor: "bg-blue-400",
    emptyBorder: "border-blue-200",
    emptyBg: "bg-blue-50/60",
    emptyText: "text-blue-600",
    emptyIconBg: "bg-blue-100",
    emptyBtnBg: "bg-blue-500 hover:bg-blue-600",
  },
  coverLetter: {
    label: "자기소개서",
    desc: "동기 및 역량 기반 질문",
    icon: "✍️",
    gradient: "from-violet-500 to-purple-500",
    lightBg: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
    ringColor: "ring-violet-400",
    badgeColor: "bg-violet-100 text-violet-600 border-violet-200",
    emptyIcon: "📝",
    emptyMsg: "아직 분석된 자기소개서가 없어요",
    emptyHint: "자기소개서를 업로드하고 AI 분석을 받아보세요",
    analyzeLabel: "자기소개서 분석하기",
    emptyColor: "purple",
    dotColor: "bg-violet-400",
    emptyBorder: "border-violet-200",
    emptyBg: "bg-violet-50/60",
    emptyText: "text-violet-600",
    emptyIconBg: "bg-violet-100",
    emptyBtnBg: "bg-violet-500 hover:bg-violet-600",
  },
  portfolio: {
    label: "포트폴리오",
    desc: "프로젝트 경험 기반 질문",
    icon: "💼",
    gradient: "from-emerald-500 to-teal-500",
    lightBg: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    ringColor: "ring-emerald-400",
    badgeColor: "bg-emerald-100 text-emerald-600 border-emerald-200",
    emptyIcon: "🗂️",
    emptyMsg: "아직 분석된 포트폴리오가 없어요",
    emptyHint: "포트폴리오를 업로드하고 AI 분석을 받아보세요",
    analyzeLabel: "포트폴리오 분석하기",
    emptyColor: "teal",
    dotColor: "bg-emerald-400",
    emptyBorder: "border-emerald-200",
    emptyBg: "bg-emerald-50/60",
    emptyText: "text-emerald-600",
    emptyIconBg: "bg-emerald-100",
    emptyBtnBg: "bg-emerald-500 hover:bg-emerald-600",
  },
};

// ─────────────────────────────────────────────
const fetchUserAnalyses = async () => {
  const res = await api.get("/api/analysis/my");
  return res.data;
};

// ─────────────────────────────────────────────
// 배경 그라디언트
// ─────────────────────────────────────────────
const BackgroundMesh = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#dbeafe_0%,_transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#ede9fe_0%,_transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_#d1fae5_0%,_transparent_60%)]" />
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
    <span
      className={`shrink-0 inline-flex items-center justify-center text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}
    >
      {score}점
    </span>
  );
};

// ─────────────────────────────────────────────
// 빈 상태 (카드 내부)
// ─────────────────────────────────────────────
function CardEmptyState({ meta, onClickAnalyze }) {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed ${meta.emptyBorder} ${meta.emptyBg} p-6 text-center h-full flex flex-col items-center justify-center`}
    >
      <div className="relative inline-flex items-center justify-center mb-3">
        <div
          className={`w-14 h-14 ${meta.emptyIconBg} rounded-2xl flex items-center justify-center animate-empty-float`}
        >
          <span className="text-2xl">{meta.emptyIcon}</span>
        </div>
        <span
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${meta.dotColor} rounded-full animate-ping opacity-75`}
        />
        <span
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${meta.dotColor} rounded-full`}
        />
      </div>
      <p className={`font-bold text-sm mb-1 ${meta.emptyText}`}>{meta.emptyMsg}</p>
      <p className="text-gray-400 text-xs mb-4 leading-relaxed">{meta.emptyHint}</p>
      <button
        type="button"
        onClick={onClickAnalyze}
        className={`inline-flex items-center gap-1.5 ${meta.emptyBtnBg} text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95`}
      >
        ✨ {meta.analyzeLabel} →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 전체 빈 상태 배너
// ─────────────────────────────────────────────
function GlobalEmptyBanner() {
  const steps = [
    { icon: "📤", label: "문서 업로드", desc: "이력서·자소서·포폴" },
    { icon: "🤖", label: "AI 분석", desc: "강점·약점 파악" },
    { icon: "🎤", label: "면접 시작", desc: "맞춤형 질문 생성" },
  ];

  return (
    <div className="mb-10 relative overflow-hidden rounded-3xl border-2 border-dashed border-blue-200 bg-white/60 backdrop-blur-sm p-10 text-center shadow-xl">
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-blue-100 animate-empty-float">
          <span className="text-4xl">🗃️</span>
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md animate-bounce-subtle">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">아직 분석된 자료가 없어요</h3>
      <p className="text-gray-500 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
        면접을 시작하려면 먼저 문서를 분석해야 해요. AI가 분석 후 이 화면에서 선택할 수 있습니다.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 mb-1">
                <span className="text-xl">{s.icon}</span>
              </div>
              <span className="text-xs font-bold text-gray-700">{s.label}</span>
              <span className="text-[10px] text-gray-400">{s.desc}</span>
            </div>
            {i < steps.length - 1 && <span className="text-gray-300 text-lg mb-4">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 분석 아이템 카드
// ─────────────────────────────────────────────
function AnalysisItemCard({ item, isSelected, onSelect, meta }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        isSelected
          ? `border-transparent bg-gradient-to-br ${meta.gradient} shadow-lg ring-2 ring-offset-2 ${meta.ringColor}`
          : "border-gray-200 bg-white hover:border-gray-300",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`font-bold text-sm leading-tight ${isSelected ? "text-white" : "text-gray-900"}`}>
          {item.title}
        </span>
        <ScoreBadge score={item.score} />
      </div>

      <p className={`text-xs truncate mb-2 ${isSelected ? "text-white/75" : "text-gray-400"}`}>
        📎 {item.fileName}
      </p>

      {/* <div className="flex flex-wrap gap-1 mb-2">
        {(item.keywords || []).map((kw) => (
          <span
            key={kw}
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isSelected ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {kw}
          </span>
        ))}
      </div> */}

      <p className={`text-xs ${isSelected ? "text-white/65" : "text-gray-400"}`}>
        🕐 분석일: {item.analyzedAt}
      </p>

      {isSelected && (
        <div className="mt-2 flex items-center gap-1 text-white text-xs font-bold">
          <span className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[10px]">
            ✓
          </span>
          선택됨
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// 카테고리 카드
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
    <div className="animate-fade-in-up" style={{ animationDelay: `${index * 0.12}s`, opacity: 0 }}>
      <div
        className={[
          "group relative bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border transition-all duration-500",
          "hover:-translate-y-1.5 hover:shadow-2xl hover:bg-white/95",
          "h-[270px] flex flex-col",
          selectedId
            ? `border-transparent ring-2 ring-offset-2 ${meta.ringColor}`
            : hasItems
            ? "border-gray-200/80 hover:border-gray-300"
            : "border-gray-100",
        ].join(" ")}
      >
        {selectedId && (
          <div
            className={`absolute top-4 right-4 w-7 h-7 bg-gradient-to-br ${meta.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs`}
          >
            ✓
          </div>
        )}

        <div className="flex items-center gap-3 mb-5">
          <div
            className={[
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
              "group-hover:scale-110 group-hover:rotate-3",
              selectedId
                ? `bg-gradient-to-br ${meta.gradient} shadow-md`
                : hasItems
                ? `bg-gradient-to-br ${meta.lightBg}`
                : "bg-gray-100",
            ].join(" ")}
          >
            <span className={`text-2xl ${!hasItems && !isLoading ? "grayscale opacity-40" : ""}`}>
              {meta.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-lg font-bold ${hasItems ? "text-gray-900" : "text-gray-400"}`}>
                {meta.label}
              </h3>
              {!isLoading && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    hasItems ? meta.badgeColor : "bg-gray-100 text-gray-400 border-gray-200"
                  }`}
                >
                  {hasItems ? `${items.length}개` : "없음"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{meta.desc}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 mb-4" />

        {isLoading ? (
          <div className="space-y-3 flex-1">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-100/80 animate-pulse" />
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
                meta={meta}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 예상 소요 시간 카드
// ─────────────────────────────────────────────
function EstimatedTimeCard({ questionCount }) {
  const count = parseInt(questionCount, 10);
  const minutes = count * 2;
  const segments = [
    { label: "답변 시간", min: Math.round(minutes * 1.0), color: "bg-indigo-400", icon: "🎤" },
    { label: "피드백 분석", min: Math.round(minutes * 0.3), color: "bg-violet-400", icon: "📊" },
  ];
  const total = segments.reduce((s, x) => s + x.min, 0);

  return (
    <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-sm shadow-sm">
          ⏱️
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">예상 소요 시간</p>
          <p className="text-xs text-gray-400">총 약 {total}분</p>
        </div>
      </div>

      <div className="flex rounded-full overflow-hidden h-3 mb-4 gap-0.5">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-500`}
            style={{ width: `${(seg.min / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{seg.icon}</span>
              <span className="text-xs text-gray-600">{seg.label}</span>
            </div>
            <span className="text-xs font-bold text-gray-700">약 {seg.min}분</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 시작 전 체크리스트 카드
// ─────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { id: "mic", icon: "🎙️", text: "마이크 상태를 확인했어요" },
  { id: "quiet", icon: "🔇", text: "조용한 환경이 준비됐어요" },
];

function PreChecklistCard() {
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const doneCount = Object.values(checked).filter(Boolean).length;
  const allDone = doneCount === CHECKLIST_ITEMS.length;

  return (
    <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-sm shadow-sm">
            ✅
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">시작 전 체크리스트</p>
            <p className="text-xs text-gray-400">
              {doneCount}/{CHECKLIST_ITEMS.length} 완료
            </p>
          </div>
        </div>
        {allDone && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 animate-bounce-subtle">
            준비 완료! 🎉
          </span>
        )}
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / CHECKLIST_ITEMS.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className={[
              "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200",
              "hover:scale-[1.01] active:scale-[0.99] text-left",
              checked[item.id]
                ? "bg-emerald-50 border-emerald-200"
                : "bg-gray-50/80 border-gray-200/60 hover:border-gray-300",
            ].join(" ")}
          >
            <span
              className={[
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                checked[item.id]
                  ? "bg-emerald-500 border-emerald-500 text-white text-[10px]"
                  : "border-gray-300 bg-white",
              ].join(" ")}
            >
              {checked[item.id] && "✓"}
            </span>
            <span className="text-sm">{item.icon}</span>
            <span
              className={`text-xs font-medium flex-1 ${
                checked[item.id] ? "text-emerald-700 line-through" : "text-gray-600"
              }`}
            >
              {item.text}
            </span>
          </button>
        ))}
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

  const [analyses, setAnalyses] = useState({
    resume: [],
    coverLetter: [],
    portfolio: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedIds, setSelectedIds] = useState({
    resume: null,
    coverLetter: null,
    portfolio: null,
  });
  const [settings, setSettings] = useState({ questionCount: "5" });
  const [isDeviceTestOpen, setIsDeviceTestOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchUserAnalyses()
      .then((data) => {
        setAnalyses({
          resume: Array.isArray(data?.resume) ? data.resume : [],
          coverLetter: Array.isArray(data?.coverLetter) ? data.coverLetter : [],
          portfolio: Array.isArray(data?.portfolio) ? data.portfolio : [],
        });
        setFetchError(null);
      })
      .catch(() => setFetchError("분석 결과를 불러오는 데 실패했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const isAllEmpty = useMemo(
    () => !isLoading && Object.values(analyses).every((l) => l.length === 0),
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

  const handleSelect = (key, id) => {
    setSelectedIds((p) => ({ ...p, [key]: id }));
  };

  const buildFinalQuestions = (expectedQuestions, questionCount) => {
  const count = Number(questionCount || 5);

  const introQuestion = "자기소개를 간단히 해주시겠습니까?";
  const motivationQuestion = "우리 회사에 지원한 동기는 무엇인가요?";
  const finalQuestion = "3년 후 자신의 모습을 어떻게 그리고 계신가요?";

  const fallbackQuestions = [
    "자신의 강점과 약점을 말씀해주세요.",
    "가장 기억에 남는 프로젝트 경험을 설명해주세요.",
    "팀에서 갈등이 발생했을 때 어떻게 해결하셨나요?",
    "실패했던 경험과 그로부터 배운 점을 말씀해주세요.",
    "이 직무에서 가장 중요하다고 생각하는 역량은 무엇인가요?",
    "최근에 배운 새로운 기술이나 지식이 있나요?",
    "마지막으로 하고 싶은 말씀이 있으신가요?",
  ];

  const fixedFront = count === 10
    ? [introQuestion, motivationQuestion]
    : [introQuestion];

  const cleanedExpected = (expectedQuestions || [])
    .map((q) => String(q || "").trim())
    .filter(Boolean)
    .filter(
      (q) =>
        q !== introQuestion &&
        q !== motivationQuestion &&
        q !== finalQuestion
    );

  const result = [...fixedFront];

  for (const q of cleanedExpected) {
    if (result.length >= count - 1) break; // 마지막 1칸은 finalQuestion 용
    if (!result.includes(q)) result.push(q);
  }

  for (const q of fallbackQuestions) {
    if (result.length >= count - 1) break;
    if (!result.includes(q)) result.push(q);
  }

  // 마지막 질문 고정
  if (!result.includes(finalQuestion)) {
    result.push(finalQuestion);
  }

  return result.slice(0, count);
};

  const buildSelectedTargetsAndQuestions = () => {
    const config = [
      { key: "resume", targetType: "RESUME" },
      { key: "coverLetter", targetType: "ESSAY" },
      { key: "portfolio", targetType: "PORTFOLIO" },
    ];

    const targets = [];
    const questionSet = new Set();

    config.forEach(({ key, targetType }) => {
      const selectedAnalysisId = selectedIds[key];
      if (!selectedAnalysisId) return;

      const selectedItem = analyses[key]?.find((item) => item.id === selectedAnalysisId);
      if (!selectedItem) return;

      targets.push({
        targetType,
        targetId: selectedItem.targetId,
        analysisId: selectedItem.analysisId,
      });

      (selectedItem.expectedQuestions || []).forEach((q) => {
        const trimmed = String(q || "").trim();
        if (trimmed) questionSet.add(trimmed);
      });
    });

    return {
      targets,
      questions: Array.from(questionSet),
    };
  };

  const startInterview = () => {
  const { targets, questions } = buildSelectedTargetsAndQuestions();

  const finalQuestions = buildFinalQuestions(
    questions,
    Number(settings.questionCount || 5)
  );

  localStorage.setItem(
    "interviewData",
    JSON.stringify({
      selectedAnalyses: selectedIds,
      selectedTargets: targets,
      settings,
      questions: finalQuestions,
    })
  );

  setIsDeviceTestOpen(true);
};

  const handleDeviceTestConfirm = () => {
    setIsDeviceTestOpen(false);
    navigate("/interview/session");
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundMesh />

      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <img src={logo} alt="CareerTalk" className="h-36 w-auto object-contain" />
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-blue-50"
            >
              ← 메인으로 돌아가기
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm animate-slide-in-down">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-700 text-sm font-semibold">AI 모의 면접 준비</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight animate-slide-in-up">
            분석된 자료를{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                선택
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 rounded-full opacity-30" />
            </span>
            해주세요
          </h1>

          <p className="text-lg text-gray-500 animate-slide-in-up animation-delay-300">
            이전에 분석한 자료 중 최소 1개를 선택하면 AI가 맞춤형 질문을 생성합니다
          </p>
        </div>

        {fetchError && (
          <div className="mb-8 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            <span>⚠️</span> {fetchError}
          </div>
        )}

        {isAllEmpty && <GlobalEmptyBanner />}

        <div className="grid md:grid-cols-3 gap-5 mb-8">
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

        {selectedSummary.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200/80 rounded-3xl p-6 mb-8 shadow-lg animate-slide-in-up">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full text-white text-xs">
                ✓
              </span>
              선택된 분석 자료
            </h4>
            <div className="flex gap-4 flex-wrap">
              {selectedSummary.map((item) => (
                <div
                  key={`${item.key}-${item.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex-1 min-w-[160px]"
                >
                  <span className="text-2xl">{FILE_META[item.key].icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                    <ScoreBadge score={item.score} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-7 shadow-lg border border-gray-200/80 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white text-base shadow-sm">
              ⚙️
            </span>
            면접 설정
          </h3>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-5 border border-blue-100/80">
              <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-blue-500">📊</span> 질문 개수
              </p>
              <div className="flex gap-3">
                {[
                  { value: "5", label: "5개", sub: "약 10분", icon: "⚡" },
                  { value: "10", label: "10개", sub: "약 20분", icon: "🎯" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSettings((p) => ({ ...p, questionCount: opt.value }))}
                    className={[
                      "flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl border-2 font-bold transition-all duration-300",
                      "hover:scale-105 hover:shadow-md active:scale-95",
                      settings.questionCount === opt.value
                        ? "border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg"
                        : "border-gray-200 bg-white/90 text-gray-700 hover:border-blue-200",
                    ].join(" ")}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-lg font-extrabold">{opt.label}</span>
                    <span
                      className={`text-xs ${
                        settings.questionCount === opt.value ? "text-white/75" : "text-gray-400"
                      }`}
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                선택한 개수만큼 AI가 맞춤형 질문을 생성합니다
              </p>
            </div>

            <EstimatedTimeCard questionCount={settings.questionCount} />
            <PreChecklistCard />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!hasSelection ? (
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-500 px-5 py-2.5 rounded-full text-sm font-semibold">
              <span>⚠️</span> 최소 1개 이상의 분석 자료를 선택해주세요
            </div>
          ) : (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              준비 완료! 면접을 시작할 수 있습니다
            </p>
          )}

          <button
            onClick={startInterview}
            disabled={!hasSelection}
            className={[
              "group relative px-14 py-4 rounded-full font-bold text-base shadow-xl transition-all duration-500",
              "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white",
              "hover:shadow-2xl hover:scale-105 active:scale-100",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
              "overflow-hidden",
            ].join(" ")}
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="text-xl">🎤</span>
              면접 시작하기
              <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-lg">
                →
              </span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </button>

          <p className="text-xs text-gray-400">면접 결과는 자동으로 저장됩니다</p>
        </div>
      </div>

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

      <DeviceTestModal
        isOpen={isDeviceTestOpen}
        onClose={() => setIsDeviceTestOpen(false)}
        onConfirm={handleDeviceTestConfirm}
      />

      <style>{`
        @keyframes bounce-subtle {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes empty-float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-7px) rotate(-2deg); }
          70% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes slideInDown {
          from { opacity:0; transform:translateY(-24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(16px); }
          to { opacity:1; transform:translateY(0); }
        }

        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-empty-float { animation: empty-float 3.5s ease-in-out infinite; }
        .animate-slide-in-down { animation: slideInDown 0.8s ease-out forwards; }
        .animate-slide-in-up { animation: slideInUp 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }

        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}