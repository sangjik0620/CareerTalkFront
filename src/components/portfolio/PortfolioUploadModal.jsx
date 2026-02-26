import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ⭐ 페이지 이동을 위해 추가

const JOB_CATEGORIES = [
  "IT/소프트웨어",
  "데이터/AI",
  "디자인/UI·UX",
  "기획/PM/PO",
  "마케팅/PR",
  "영업/고객지원",
  "인사/총무",
  "경영/전략",
  "미디어/콘텐츠",
  "건축/엔지니어링",
  "기타",
];

const PortfolioUploadModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobCategory, setJobCategory] = useState("");
  const [detailedPosition, setDetailedPosition] = useState("");

  const navigate = useNavigate(); // ⭐ navigate 함수 선언

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Escape" && !isAnalyzing) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isAnalyzing, onClose]);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    const allowedExtensions = /(\.pdf|\.pptx)$/i;
    if (!allowedExtensions.test(file.name)) {
      alert("PDF 또는 PPTX 파일만 업로드해 주세요.");
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

  const handleAnalyzeClick = async () => {
    if (!selectedFile || !jobCategory) return;

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    // ⭐ 1. DB 저장용 대분류 (필수)
    formData.append("jobCategory", jobCategory);

    // ⭐ 2. AI 분석용 상세 포지션 (입력했을 때만 추가)
    if (detailedPosition) {
      formData.append("detailedPosition", detailedPosition);
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/portfolios/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setIsAnalyzing(false);
      onClose();

      // ⭐ 핵심: 결과 페이지로 이동하면서 state에 데이터를 담아 보냅니다.

      navigate("/portfolio/result", { state: { analysisData: response.data } });
    } catch (error) {
      console.error("분석 실패:", error);
      alert("분석 중 에러가 발생했습니다.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={!isAnalyzing ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 ${isAnalyzing ? "min-h-[300px] flex flex-col justify-center" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              포트폴리오 분석 중
            </h3>
            <p className="text-gray-500 text-sm">잠시만 기다려 주세요...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                📂 포트폴리오 분석 설정
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 mb-5 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  지원 직무군 *
                </label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                >
                  <option value="">직무군 선택</option>
                  {JOB_CATEGORIES.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  상세 포지션 (선택)
                </label>
                <input
                  type="text"
                  value={detailedPosition}
                  onChange={(e) => setDetailedPosition(e.target.value)}
                  placeholder="예: 프론트엔드 개발자"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
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
                accept=".pdf,.pptx"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <span className="text-4xl mb-3 block">📄</span>
                {selectedFile ? (
                  <span className="text-sm font-semibold text-indigo-600">
                    {selectedFile.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    파일을 업로드하세요
                  </span>
                )}
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleAnalyzeClick}
                disabled={!selectedFile || !jobCategory}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
              >
                정밀 분석 시작
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PortfolioUploadModal;
