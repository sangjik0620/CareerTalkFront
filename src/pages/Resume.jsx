import { useMemo, useState, useEffect } from "react";

const Icons = {
  Upload: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Download: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  X: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Check: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
};

const JOB_GROUPS = [
  {
    label: "IT·개발",
    items: [
      "백엔드 개발자",
      "프론트엔드 개발자",
      "풀스택 개발자",
      "모바일 앱 개발자",
      "데이터 엔지니어",
      "데이터 분석가",
      "AI/ML 엔지니어",
      "DevOps/인프라",
      "보안/정보보호",
      "QA/테스터",
      "게임 개발자",
      "PM/PO(IT)",
    ],
  },
  {
    label: "디자인",
    items: ["UI/UX 디자이너", "그래픽 디자이너", "BX/브랜딩", "영상/모션", "3D/모델링"],
  },
  {
    label: "경영·사무",
    items: ["인사(HR)", "총무", "재무/회계", "전략기획", "법무", "구매/자재"],
  },
  {
    label: "마케팅·영업",
    items: ["마케팅", "퍼포먼스 마케팅", "콘텐츠 마케팅", "영업", "해외영업", "CS/고객지원"],
  },
  {
    label: "기타",
    items: ["연구원", "생산/품질", "물류/SCM", "교육/강사", "의료/보건", "서비스"],
  },
];

export default function Resume({ isOpen, onClose, onAnalyzeSuccess  }) {
  const [jobType, setJobType] = useState("");
  const [expYears, setExpYears] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const groupedOptions = useMemo(() => JOB_GROUPS, []);

  // ✅ ESC로 닫기(ClAnalysis 방식)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 파일 선택 공통
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // docx 체크
    const isDocx =
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      selectedFile.name.toLowerCase().endsWith(".docx");

    if (!isDocx) {
      alert("docx 파일만 업로드 가능합니다.");
      return;
    }

    // 10MB 제한 예시 (원래 너 코드에 맞춰 조절 가능)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert("파일 크기는 10MB 이하로 업로드해주세요.");
      return;
    }

    setFile(selectedFile);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dropped = e.dataTransfer?.files?.[0];
    handleFile(dropped);
  };

  const onFileChange = (e) => {
    const picked = e.target.files?.[0];
    handleFile(picked);
  };

  const removeFile = () => setFile(null);

  const handleTemplateDownload = () => {
    // TODO: 서버 다운로드 연결 (예: window.location.href="/api/resume/template")
    alert("서버 템플릿 다운로드 API로 연결하세요.");
  };

  const handleAnalyze = () => {
    // 간단 검증 예시 (원래 너 로직에 맞춰 조절 가능)
    if (!jobType) {
      alert("지원 직군을 선택해주세요.");
      return;
    }
    if (!expYears) {
      alert("경력을 입력해주세요.");
      return;
    }
    if (!file) {
      alert("docx 파일을 업로드해주세요.");
      return;
    }

    // 여기서 실제 분석 요청 로직으로 연결하면 됨
    // 우선 확인 모달 오픈
    setOpenModal(true);
  };

  // ✅ 모달 닫혀있으면 렌더링 자체 안함
  if (!isOpen) return null;

  return (
    // ✅ (핵심) 화면 전체 오버레이 + 바깥 클릭 시 닫기
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center px-4 bg-black/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="이력서 분석"
      onMouseDown={() => onClose?.()}
    >
      {/* ✅ 모달 박스: 여기 클릭은 닫히면 안됨 */}
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-50 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ✅ 상단 헤더 + 닫기 */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">이력서 분석</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="닫기"
          >
            <Icons.X />
          </button>
        </div>

        {/* ===== 기존 화면 내용 ===== */}
        <main className="pt-10 pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                AI 이력서 분석
              </h1>
              <p className="mt-3 text-gray-600">
                직군/경력을 입력하고 <span className="font-semibold">docx</span> 이력서를 업로드하면
                분석 결과와 면접 예상 질문을 제공합니다.
              </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8">
                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      지원 직군
                    </label>
                    <div className="relative">
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      >
                        <option value="">직군을 선택하세요</option>
                        {groupedOptions.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.items.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icons.ChevronDown />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      현재 경력(년)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={expYears}
                      onChange={(e) => setExpYears(e.target.value)}
                      placeholder="예: 2"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                {/* Upload Area */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    이력서 업로드 (docx)
                  </label>

                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={[
                      "relative rounded-2xl border-2 border-dashed p-6 sm:p-8 transition",
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100/60",
                    ].join(" ")}
                  >
                    <input
                      type="file"
                      accept=".docx"
                      onChange={onFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="docx 업로드"
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-gray-200 text-gray-700">
                        <Icons.Upload />
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-gray-900 font-semibold">
                          드래그&드롭 또는 클릭해서 파일을 선택하세요
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          지원 형식: .docx / 최대 10MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleTemplateDownload}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-gray-800 font-semibold hover:bg-gray-50 transition shadow-sm"
                      >
                        <Icons.Download />
                        이력서 양식 다운로드
                      </button>
                    </div>

                    {/* Selected file */}
                    {file && (
                      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
                          aria-label="파일 제거"
                        >
                          <Icons.X />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analyze button */}
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white font-black tracking-tight shadow-lg hover:opacity-95 active:opacity-90 transition"
                  >
                    이력서 분석하기
                  </button>

                  <p className="mt-3 text-center text-sm text-gray-500">
                    업로드한 문서는 분석 목적 외 저장되지 않도록 처리하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ===== 확인 모달(openModal) ===== */}
        {openModal && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center px-4"
            onMouseDown={() => setOpenModal(false)} // 바깥 클릭 닫기
            role="dialog"
            aria-modal="true"
            aria-label="분석 요청 확인"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

            <div
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
              onMouseDown={(e) => e.stopPropagation()} // ✅ 내부 클릭은 닫히면 안됨
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">분석 요청 확인</h3>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  aria-label="닫기"
                >
                  <Icons.X />
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-700">
                      <Icons.Check />
                    </span>
                    <span>
                      지원 직군: <b className="text-gray-900">{jobType}</b>
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-700">
                      <Icons.Check />
                    </span>
                    <span>
                      경력: <b className="text-gray-900">{expYears}년</b>
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-700">
                      <Icons.Check />
                    </span>
                    <span className="min-w-0">
                      파일:{" "}
                      <b className="text-gray-900 break-all">
                        {file ? file.name : "-"}
                      </b>
                    </span>
                  </p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="flex-1 rounded-xl bg-white border border-gray-200 px-4 py-3 font-bold text-gray-800 hover:bg-gray-50 transition"
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenModal(false);
                      // ✅ 여기서 실제 API 호출(문서 파싱 -> LLM 분석 요청)로 연결
                      alert("여기에 분석 API 호출 로직을 연결하세요.");
                    }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-black text-white hover:opacity-95 transition"
                  >
                    분석 요청
                  </button>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  확인을 누르면 문서 파싱 후 분석이 진행됩니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}