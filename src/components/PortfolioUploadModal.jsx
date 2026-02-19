import React, { useState } from "react";

const PortfolioUploadModal = ({ isOpen, onClose, onAnalyzeSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    // 🚀 나중에 백엔드 API 연동할 부분
    setTimeout(() => {
      setIsAnalyzing(false);
      setSelectedFile(null);
      onClose();
      onAnalyzeSuccess();
    }, 4000); // 텍스트+이미지 분석이니까 시간(4초)을 살짝 더 줘서 묵직한 느낌을 줍니다.
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 transform transition-all">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">
            📂 포트폴리오 정밀 분석
          </h2>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* ⭐ 기능 강조 배지 추가! */}
        <div className="mb-5">
          <span className="inline-block bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
            ✨ 텍스트 + 이미지(구조도/UI) 통합 분석 지원
          </span>
        </div>

        {/* 파일 업로드 영역 */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-indigo-50 transition-colors">
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.zip,.hwp,.docx"
            disabled={isAnalyzing}
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-4xl mb-3">📄</span>
            {selectedFile ? (
              <span className="text-sm font-semibold text-indigo-600 break-all">
                {selectedFile.name}
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                여기를 클릭하여 파일을 선택하세요
                <br />
                <span className="text-xs text-gray-400 mt-1 block">
                  아키텍처 다이어그램, 캡처 화면도 분석 가능합니다.
                </span>
              </span>
            )}
          </label>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
          >
            취소
          </button>

          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing || !selectedFile}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isAnalyzing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                {/* 텍스트 변경: 좀 더 꼼꼼히 분석하는 느낌 */}
                이미지 문맥 파악 중...
              </>
            ) : (
              "정밀 분석 시작"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioUploadModal;
