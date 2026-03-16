import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8080";

export default function ClAnalysis({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("HOME");

  const [jobRole, setJobRole] = useState("");
  const [jobDetail, setJobDetail] = useState("");

  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [viewStep, setViewStep] = useState("input");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!isOpen) resetAll();
  }, [isOpen]);

  const resetAll = () => {
    setMode("HOME");
    setJobRole("");
    setJobDetail("");
    setSelectedFile(null);
    setIsDragging(false);
    setTitle("");
    setContent("");
    setViewStep("input");
    setIsAnalyzing(false);
  };

  const handleClose = () => onClose?.();

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    if (!file) return false;

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      alert("PDF 파일만 업로드해 주세요.");
      return false;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("파일 용량 제한(50MB)을 초과했습니다.");
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const canAnalyzeHome = !!jobRole && !!selectedFile;
  const canAnalyzeForm =
    !!jobRole &&
    !!title.trim() &&
    !!content.trim() &&
    content.trim().length >= 30;

  const handleAnalyzeClick = () => {
    const ok = mode === "HOME" ? canAnalyzeHome : canAnalyzeForm;
    if (!ok) return;
    setViewStep("confirm");
  };

  const buildRequestPayload = () => {
    const targetJob = jobDetail?.trim() || jobRole;

    if (mode === "HOME") {
      return {
        title: selectedFile?.name?.replace(/\.pdf$/i, "") || "PDF 자기소개서",
        content: "",
        targetJob,
      };
    }

    return {
      title: title.trim(),
      content: content.trim(),
      targetJob,
    };
  };

  const handleConfirmAnalyze = async () => {
    try {
      setIsAnalyzing(true);

      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append(
        "request",
        new Blob(
          [
            JSON.stringify({
              title:
                mode === "HOME"
                  ? selectedFile?.name?.replace(/\.pdf$/i, "") ||
                    "PDF 자기소개서"
                  : title.trim(),
              content: mode === "HOME" ? "" : content.trim(),
              targetJob: jobDetail?.trim() || jobRole,
            }),
          ],
          { type: "application/json" },
        ),
      );

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch(`${API_BASE}/api/ci/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.code === "INSUFFICIENT_QUOTA") {
          alert(
            "분석 이용권이 부족합니다.\n분석 이용권 구매페이지로 이동합니다.",
          );
          navigate("/payment");
          return;
        }

        alert(data.message || "분석 중 오류가 발생했습니다.");
        return;
      }

      navigate(`/ci/result/${data.analysisId}`, {
        state: { result: data },
      });
    } catch (err) {
      console.error("분석 에러:", err);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const headerTitle =
    mode === "HOME" ? "자기소개서 분석(PDF)" : "자기소개서 입력폼";
  const headerDesc =
    mode === "HOME"
      ? "직군 정보 입력 후 PDF 파일을 업로드해 주세요."
      : "직군 정보 입력 후 자기소개서를 작성해 주세요.";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl h-[640px] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              AI 자기소개서 분석 진행 중
            </h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              업로드/입력된 내용을 기반으로 분석 중입니다.
              <br />
              잠시만 기다려 주세요.
            </p>
          </div>
        ) : viewStep === "confirm" ? (
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
                    입력하신 정보가 맞는지 확인해 주세요.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
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
              <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-1">
                <div className="flex flex-col">
                  <Row label="지원 직군" value={jobRole} />
                  {jobDetail?.trim() ? (
                    <>
                      <Divider />
                      <Row label="세부 직무" value={jobDetail} />
                    </>
                  ) : null}

                  <Divider />
                  <Row
                    label="분석 방식"
                    value={mode === "HOME" ? "PDF" : "입력폼"}
                  />

                  {mode === "HOME" ? (
                    <>
                      <Divider />
                      <Row
                        label="업로드 파일"
                        value={selectedFile?.name || ""}
                        sub={`용량: ${(
                          (selectedFile?.size || 0) /
                          (1024 * 1024)
                        ).toFixed(2)} MB`}
                      />
                    </>
                  ) : (
                    <>
                      <Divider />
                      <Row label="제목" value={title} />
                      <Divider />
                      <Row
                        label="내용(미리보기)"
                        value={content}
                        sub={`글자수: ${content.length.toLocaleString()}자`}
                        multiline
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setViewStep("input")}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                이전으로
              </button>
              <button
                onClick={handleConfirmAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-[0.99] text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "분석 중..." : "분석 시작"}
              </button>
            </div>
          </div>
        ) : (
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
                    {headerTitle}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{headerDesc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMode((prev) => (prev === "HOME" ? "FORM" : "HOME"));
                    setViewStep("input");
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {mode === "HOME" ? "입력폼 작성" : "PDF 업로드"}
                </button>

                <button
                  onClick={handleClose}
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
            </div>

            <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50/50 overflow-y-auto min-h-0">
              <div className="flex flex-col gap-6 shrink-0">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    지원 직군 <span className="text-red-500">(필수)</span>
                  </label>
                  <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
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
                    세부 직무{" "}
                    <span className="text-gray-400 font-normal">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={jobDetail}
                    onChange={(e) => setJobDetail(e.target.value)}
                    placeholder="예) 백엔드 개발자 / 신입"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-gray-400"
                  />
                </div>
              </div>

              {mode === "HOME" ? (
                <div className="flex flex-col flex-1 mt-2 min-h-[160px]">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    PDF 업로드 <span className="text-red-500">(필수)</span>
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
                      validateAndSetFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      id="fileInput"
                      className="hidden"
                      onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                      accept="application/pdf,.pdf"
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

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFile(null);
                            }}
                            className="mt-2 text-xs text-gray-500 underline hover:text-gray-700"
                          >
                            선택 해제
                          </button>
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
                            PDF(.pdf) 지원
                          </span>
                          <p className="text-xs text-gray-400 mt-2">
                            최대 50MB까지 업로드 가능합니다.
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      제목 <span className="text-red-500">(필수)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="예) 네이버 백엔드 지원"
                      className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-gray-400"
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-h-[220px]">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      자기소개서 내용{" "}
                      <span className="text-red-500">(필수)</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="자기소개서 내용을 입력하세요 (최소 30자 권장)"
                      className="w-full min-h-[220px] bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-gray-400 resize-none"
                    />
                    <div className="mt-2 text-xs text-gray-400">
                      글자수: {content.length.toLocaleString()}자
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end shrink-0">
              <button
                onClick={handleAnalyzeClick}
                disabled={mode === "HOME" ? !canAnalyzeHome : !canAnalyzeForm}
                className={`px-8 py-2.5 font-bold rounded-lg transition-all text-sm
                  ${
                    mode === "HOME"
                      ? !canAnalyzeHome
                        ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-[0.98]"
                      : !canAnalyzeForm
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

function Divider() {
  return <div className="h-px bg-gray-100 mx-4" />;
}

function Row({ label, value, sub, multiline }) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
      <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg shrink-0 mt-0.5">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <div className="overflow-hidden w-full">
        <span className="text-xs text-gray-400 font-bold block mb-0.5">
          {label}
        </span>

        {multiline ? (
          <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {value}
          </p>
        ) : (
          <span className="text-[15px] font-bold text-gray-900 break-all line-clamp-2">
            {value}
          </span>
        )}

        {sub ? (
          <span className="text-[11px] text-gray-400 block mt-0.5">{sub}</span>
        ) : null}
      </div>
    </div>
  );
}
