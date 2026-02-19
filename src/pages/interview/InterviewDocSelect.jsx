// src/pages/InterviewDocSelect.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CARD_DEFS = [
  {
    type: "essay",
    title: "자기소개서",
    icon: "📝",
    desc: "작성하신 자기소개서를 업로드하면 내용을 기반으로 질문을 생성합니다",
    accept: ".pdf,.doc,.docx,.txt",
  },
  {
    type: "portfolio",
    title: "포트폴리오",
    icon: "💼",
    desc: "프로젝트 경험과 성과를 담은 포트폴리오로 실무 역량을 검증합니다",
    accept: ".pdf,.ppt,.pptx",
  },
  {
    type: "resume",
    title: "이력서",
    icon: "📄",
    desc: "경력과 학력 정보를 바탕으로 전문적인 면접 질문을 준비합니다",
    accept: ".pdf,.doc,.docx",
  },
];

export default function InterviewDocSelect() {
  const navigate = useNavigate();

  // selectedTypes: Set 대신 배열/객체로 관리 (React 렌더 친화)
  const [selected, setSelected] = useState(() => ({
    essay: false,
    portfolio: false,
    resume: false,
  }));

  // File 객체는 로컬스토리지 저장 불가 → state로 유지
  const [files, setFiles] = useState(() => ({
    essay: null,
    portfolio: null,
    resume: null,
  }));

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  const toggleCard = (type) => {
    setSelected((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleFile = (type, file) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [type]: file }));
    setSelected((prev) => ({ ...prev, [type]: true })); // 파일 선택 시 자동 선택
  };

  const onStart = () => {
    const selectedTypes = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);

    navigate("/interview", {
      state: {
        selectedTypes,
        files, // File 객체는 navigate state로는 전달 가능
        timestamp: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 to-purple-700 px-5 py-10">
      {/* Header */}
      <div className="mx-auto mb-14 max-w-4xl text-center text-white">
        <h1 className="text-3xl font-extrabold sm:text-4xl">🎯 AI 모의 면접</h1>
        <p className="mt-3 text-base opacity-90">
          면접에 필요한 문서를 선택하고 업로드해주세요
        </p>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Cards */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {CARD_DEFS.map((c) => {
            const isSelected = selected[c.type];
            const pickedFile = files[c.type];

            return (
              <div
                key={c.type}
                className={[
                  "relative cursor-pointer overflow-hidden rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition",
                  "hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
                  isSelected
                    ? "border-4 border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100"
                    : "border-4 border-transparent",
                ].join(" ")}
                onClick={(e) => {
                  // 파일 input/버튼 클릭이면 토글 막기
                  if (
                    e.target.closest("input[type='file']") ||
                    e.target.closest("[data-upload-btn]")
                  )
                    return;
                  toggleCard(c.type);
                }}
              >
                {/* Checkmark */}
                <div
                  className={[
                    "absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-white",
                    isSelected ? "bg-emerald-500" : "hidden",
                  ].join(" ")}
                >
                  ✓
                </div>

                {/* Icon */}
                <div
                  className={[
                    "mb-6 flex h-[70px] w-[70px] items-center justify-center rounded-2xl text-3xl",
                    isSelected
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                      : "bg-gradient-to-br from-indigo-500 to-purple-700",
                  ].join(" ")}
                >
                  {c.icon}
                </div>

                <h3 className="text-xl font-extrabold text-slate-800">
                  {c.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">{c.desc}</p>

                {/* Upload area */}
                {isSelected && (
                  <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <label
                      data-upload-btn
                      className="inline-block cursor-pointer rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                    >
                      파일 선택
                      <input
                        type="file"
                        className="hidden"
                        accept={c.accept}
                        onChange={(e) => handleFile(c.type, e.target.files?.[0])}
                      />
                    </label>

                    <div className="mt-3 text-xs font-semibold text-emerald-600">
                      {pickedFile ? `✓ ${pickedFile.name}` : ""}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start button */}
        <button
          className={[
            "mx-auto mt-10 block rounded-full bg-white px-12 py-4 text-lg font-extrabold text-indigo-600 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition",
            selectedCount === 0
              ? "cursor-not-allowed opacity-50"
              : "hover:scale-105 hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]",
          ].join(" ")}
          disabled={selectedCount === 0}
          onClick={onStart}
        >
          면접 시작하기
        </button>
      </div>
    </div>
  );
}
