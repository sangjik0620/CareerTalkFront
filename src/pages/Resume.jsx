import { useMemo, useState } from "react";

const Icons = {
  Briefcase: ({ className = "" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  FileText: ({ className = "" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Upload: ({ className = "" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Download: ({ className = "" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  X: ({ className = "" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Spinner: ({ className = "" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
};

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const isDocx = (file) => {
  if (!file) return false;
  const nameOk = /\.docx$/i.test(file.name || "");
  const mimeOk =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "" ||
    file.type == null;
  return nameOk && mimeOk;
};

const prettySize = (bytes) => {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)}${units[i]}`;
};

export default function ResumeAnalyze() {
  const jobOptions = useMemo(
    () => ["IT/개발", "데이터/AI", "디자인", "마케팅", "영업", "기획/PM", "인사/총무", "재무/회계", "공공/행정", "기타"],
    []
  );

  const [targetJob, setTargetJob] = useState("");
  const [experience, setExperience] = useState("");
  const [file, setFile] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  const templateUrl = "/templates/resume_template.docx"; // ✅ 실제 경로로 변경

  const validate = () => {
    const next = {};
    if (!targetJob) next.targetJob = "원하는 직군을 선택해 주세요.";
    if (!experience.trim()) next.experience = "현재 경력을 입력해 주세요. (예: 신입, 2년, 인턴 등)";
    if (!file) next.file = "DOCX 파일을 업로드해 주세요.";
    else if (!isDocx(file)) next.file = "DOCX(.docx) 형식만 업로드할 수 있어요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleOpenAnalyze = () => {
    if (!validate()) return;
    setAgree(false);
    setOpenModal(true);
  };

  const handleConfirmAnalyze = async () => {
    if (!agree) {
      setErrors((prev) => ({ ...prev, agree: "분석 진행에 동의해 주세요." }));
      return;
    }
    setErrors((prev) => {
      const { agree: _agree, ...rest } = prev;
      return rest;
    });

    setSubmitting(true);
    try {
      // ✅ API 연동 위치
      // const formData = new FormData();
      // formData.append("targetJob", targetJob);
      // formData.append("experience", experience);
      // formData.append("file", file);
      // await fetch("/api/resume/analyze", { method: "POST", body: formData });

      await new Promise((r) => setTimeout(r, 900));
      setOpenModal(false);
      alert("분석 요청이 접수되었습니다! (데모)");
    } catch (e) {
      console.error(e);
      alert("분석 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ 헤더 제거: 바로 본문 */}
      <main className="pt-10 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Icons.Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">이력서 분석</h2>
                  <p className="text-gray-600 text-sm mt-0.5">직군/경력 입력 후 DOCX 파일을 업로드해 주세요.</p>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-8 space-y-10">
              {/* Top Inputs */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    원하는 직군 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 bg-white text-gray-900",
                      "focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition",
                      errors.targetJob ? "border-red-300" : "border-gray-200"
                    )}
                  >
                    <option value="">직군을 선택해 주세요</option>
                    {jobOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.targetJob && <p className="mt-2 text-sm text-red-600">{errors.targetJob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    현재 경력 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="예) 신입 / 경력 2년 / 인턴 6개월"
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 bg-white text-gray-900",
                      "focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition",
                      errors.experience ? "border-red-300" : "border-gray-200"
                    )}
                  />
                  {errors.experience && <p className="mt-2 text-sm text-red-600">{errors.experience}</p>}
                </div>
              </div>

              {/* Upload + Download */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upload */}
                <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600">
                      <Icons.Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">DOCX 업로드</h3>
                      <p className="text-sm text-gray-600">이력서 파일(.docx)만 업로드 가능</p>
                    </div>
                  </div>

                  <label className="block">
                    <input
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setFile(f);
                        setErrors((prev) => ({ ...prev, file: undefined }));
                      }}
                      className="hidden"
                    />
                    <div
                      className={cn(
                        "cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center",
                        "hover:bg-white transition",
                        errors.file ? "border-red-300 bg-red-50/40" : "border-gray-300 bg-white/60"
                      )}
                    >
                      <div className="text-gray-900 font-semibold">파일 선택하기</div>
                      <div className="text-sm text-gray-600 mt-1">DOCX(.docx)만 지원</div>
                    </div>
                  </label>

                  <div className="mt-4">
                    {file ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{prettySize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
                        >
                          제거
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">아직 업로드된 파일이 없습니다.</p>
                    )}
                    {errors.file && <p className="mt-2 text-sm text-red-600">{errors.file}</p>}
                  </div>
                </div>

                {/* Download Template */}
                <div className="rounded-2xl border border-gray-200 p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Icons.Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">이력서 양식 다운로드</h3>
                      <p className="text-sm text-gray-600">권장 템플릿으로 작성하면 분석 정확도가 올라갑니다</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <p className="text-sm text-gray-700">템플릿에 맞춰 작성 후 DOCX로 저장하여 업로드해 주세요.</p>
                    <ul className="mt-3 text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>불필요한 이미지/도형은 최소화</li>
                      <li>표/리스트는 단순하게</li>
                      <li>파일명에 특수문자 과다 사용 지양</li>
                    </ul>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <a
                      href={templateUrl}
                      download
                      className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition font-semibold"
                    >
                      <Icons.FileText className="w-5 h-5" />
                      양식 다운로드
                    </a>
                    <button
                      type="button"
                      onClick={() => alert("templateUrl을 실제 docx 파일 경로로 연결해 주세요!")}
                      className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-50 transition font-semibold"
                    >
                      템플릿 사용 팁
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    * templateUrl을 실제 docx 정적 파일 경로로 변경하세요. (예: public/templates/...)
                  </p>
                </div>
              </div>

              {/* Analyze Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-blue-800 to-blue-500 p-6">
                <div className="text-white">
                  <p className="text-sm text-blue-100">모든 입력이 완료되면</p>
                  <h3 className="text-xl font-bold mt-1">AI 이력서 분석을 시작할까요?</h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAnalyze}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                  disabled={submitting}
                >
                  이력서 분석하기
                </button>
              </div>

              <p className="text-xs text-gray-500">
                * 업로드 파일과 입력 정보는 분석 목적으로만 사용되며, 정책에 따라 안전하게 처리됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="이력서 분석 확인"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenModal(false);
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
            <div className="px-6 sm:px-7 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">분석을 시작할 준비가 되었어요</h3>
                <p className="text-sm text-gray-600 mt-1">입력 정보가 맞는지 확인해 주세요.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="p-2 rounded-full hover:bg-gray-50 transition text-gray-700"
                aria-label="닫기"
              >
                <Icons.X />
              </button>
            </div>

            <div className="px-6 sm:px-7 py-6 space-y-5">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">원하는 직군</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{targetJob}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">현재 경력</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{experience}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-500">업로드 파일</p>
                    <p className="font-semibold text-gray-900 mt-0.5 break-all">
                      {file?.name} <span className="text-gray-500 font-normal">({prettySize(file?.size)})</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-sm text-gray-700">
                  분석 결과에는 <span className="font-semibold">구성/표현/키워드/직군 적합도</span> 등의 피드백이 포함될 수 있어요.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  * 민감정보(주민번호 등)는 업로드 전 삭제를 권장합니다.
                </p>
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                />
                <span className="text-sm text-gray-700">업로드한 파일을 AI 분석에 사용하는 것에 동의합니다.</span>
              </label>
              {errors.agree && <p className="text-sm text-red-600">{errors.agree}</p>}
            </div>

            <div className="px-6 sm:px-7 py-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="px-6 py-3 rounded-full border-2 border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
                disabled={submitting}
              >
                돌아가기
              </button>
              <button
                type="button"
                onClick={handleConfirmAnalyze}
                className="px-6 py-3 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Icons.Spinner className="w-5 h-5 animate-spin" />
                    분석 요청 중...
                  </>
                ) : (
                  <>분석 시작</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}