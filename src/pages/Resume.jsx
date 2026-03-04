import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const JOB_CATEGORIES = [
  "기획∙전략",
  "마케팅∙홍보∙조사",
  "회계∙세무∙재무",
  "인사∙노무∙HRD",
  "총무∙법무∙사무",
  "IT개발∙데이터",
  "디자인",
  "영업∙판매∙무역",
  "고객상담∙TM",
  "구매∙자재∙물류",
  "상품기획∙MD",
  "운전∙운송∙배송",
  "서비스",
  "생산",
  "건설∙건축",
  "의료",
  "연구∙R&D",
  "교육",
  "미디어∙문화∙스포츠",
  "금융∙보험",
  "공공∙복지",
];

export default function Resume({ isOpen, onClose, onAnalyzeSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [jobCategory, setJobCategory] = useState("");
  const [detailedPosition, setDetailedPosition] = useState("");

  const [viewStep, setViewStep] = useState("input"); // input | confirm | analyzing
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setJobCategory("");
      setDetailedPosition("");
      setIsDragging(false);
      setIsAnalyzing(false);
      setViewStep("input");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    if (!file) return false;

    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.docx$/i.test(file.name);

    if (!isDocx) {
      alert("DOCX(.docx) 파일만 업로드해 주세요.");
      return false;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      alert("파일 용량 제한(20MB)을 초과했습니다.");
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const canAnalyze = Boolean(jobCategory && detailedPosition && selectedFile);

  const handleAnalyzeClick = () => {
    if (!canAnalyze) return;
    setViewStep("confirm");
  };

  const handleConfirmAnalyze = async () => {
    setViewStep("analyzing");
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("jobCategory", jobCategory);
    formData.append("detailedPosition", detailedPosition);

    try {
      const response = await api.post("/api/resumes/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data;

      setIsAnalyzing(false);
      onClose?.();
      onAnalyzeSuccess?.(result);

      if (result?.analysisId) {
        navigate(`/resume/result/${result.analysisId}`, {
          state: { analysisData: result },
        });
      } else {
        navigate(`/resume/result`, { state: { analysisData: result } });
      }
    } catch (error) {
      console.error("분석 실패:", error);
      alert("분석 중 에러가 발생했습니다.");
      setIsAnalyzing(false);
      setViewStep("input");
    }
  };

  // Spring Boot static resource로 서빙 (/src/main/resources/static/templates/)
  const handleTemplateDownload = () => {
    const link = document.createElement("a");
    link.href = "/templates/resume-template.docx";
    link.download = "이력서_서식.docx";
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl h-[640px] overflow-hidden flex flex-col relative">
        {/* ======================= [3] 로딩 화면 ======================= */}
        {viewStep === "analyzing" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
            <svg
              className="animate-spin h-14 w-14 text-blue-600 mb-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              AI 이력서 분석 진행 중
            </h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              업로드된 데이터를 기반으로 직무 역량을 평가하고 있습니다.
              <br />
              약 1~2분 정도 소요될 수 있습니다.
            </p>
          </div>
        ) : viewStep === "confirm" ? (
          /* ======================= [2] 확인 화면 ======================= */
          <div className="flex flex-col h-full animate-fade-in">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    분석 요청 확인
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    입력하신 정보가 맞는지 마지막으로 확인해 주세요.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-8 flex-1 bg-gray-50/50 flex flex-col items-center justify-center overflow-y-auto min-h-0">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  분석 준비 완료!
                </h3>
                <p className="text-sm text-gray-500">
                  아래 정보로 AI 분석을 시작합니다.
                </p>
              </div>

              <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-bold block mb-0.5">
                        지원 직군
                      </span>
                      <span className="text-[15px] font-bold text-gray-900">
                        {jobCategory}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 mx-4" />

                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-bold block mb-0.5">
                        상세 포지션
                      </span>
                      <span className="text-[15px] font-bold text-gray-900">
                        {detailedPosition}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 mx-4" />

                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-400 font-bold block mb-0.5">
                        업로드 파일
                      </span>
                      <span
                        className="text-[15px] font-bold text-gray-900 break-all line-clamp-2"
                        title={selectedFile?.name}
                      >
                        {selectedFile?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed">
                분석을 시작하면 잠시 후 결과 페이지로 이동합니다.
                <br />
                계속 진행하시겠습니까?
              </p>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setViewStep("input")}
                className="px-5 py-2.5 text-sm font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={handleConfirmAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-2.5 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                분석 시작하기
              </button>
            </div>
          </div>
        ) : (
          /* ======================= [1] 기본 입력 화면 ======================= */
          <div className="flex flex-col h-full animate-fade-in">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    이력서 분석
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    반드시 이력서 양식을 다운로드 후 양식에 맞춰 Docx 파일로 업로드
                    해주세요.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50/50 overflow-y-auto min-h-0">
              <div className="flex flex-col gap-6 shrink-0">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    지원 직군 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jobCategory}
                    onChange={(e) => setJobCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="" disabled>
                      직군을 선택해 주세요
                    </option>
                    {JOB_CATEGORIES.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    상세 포지션 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={detailedPosition}
                    onChange={(e) => setDetailedPosition(e.target.value)}
                    placeholder="예) 프론트엔드 개발자 / 3년차"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1 mt-2 min-h-[160px]">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  파일 업로드 <span className="text-red-500">*</span>
                </label>

                <div
                  className={`relative border-2 border-dashed rounded-2xl flex flex-col justify-center items-center p-8 transition-all duration-200 bg-blue-50/70 flex-1 h-full
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-100"
                        : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    validateAndSetFile(e.dataTransfer.files[0]);
                  }}
                >
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={(e) => validateAndSetFile(e.target.files[0])}
                    accept=".docx"
                  />
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer flex flex-col items-center w-full h-full justify-center"
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="w-12 h-12 text-blue-500 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span
                          className="text-lg font-bold text-gray-900 break-all line-clamp-2 max-w-xs text-center px-2"
                          title={selectedFile.name}
                        >
                          {selectedFile.name}
                        </span>
                        <span className="text-sm text-blue-600 font-bold mt-1 bg-white border border-blue-200 px-4 py-1.5 rounded-full shadow-sm hover:bg-blue-50 transition-colors">
                          파일 다시 선택하기
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center animate-fade-in">
                        <svg
                          className="w-10 h-10 text-blue-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-lg font-bold text-gray-800">
                          파일 선택하기
                        </span>
                        <span className="text-sm text-gray-500">
                          DOCX(.docx) 지원
                        </span>
                        <p className="text-xs text-gray-400 mt-2">
                          최대 20MB까지 업로드 가능합니다.
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleTemplateDownload}
                className="px-4 py-2.5 text-sm font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                이력서 양식 다운로드
              </button>

              <button
                onClick={handleAnalyzeClick}
                disabled={!canAnalyze}
                className={`px-8 py-2.5 font-bold rounded-lg transition-all text-sm
                  ${
                    !canAnalyze
                      ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-[0.98]"
                  }`}
              >
                분석하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}