import React, { useState } from "react";

const PortfolioUploadModal = ({ isOpen, onClose, onAnalyzeSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 드래그 중인지 시각적 효과를 주기 위한 상태

  if (!isOpen) return null;

  // ⭐ 핵심 로직: 파일 용량 검사 및 세팅을 하나의 함수로 분리
  const validateAndSetFile = (file) => {
    // F12(개발자 도구)를 누르면 실제 바이트 크기를 볼 수 있습니다!
    console.log("선택된 파일 크기(Byte):", file.size);

    const maxSize = 50 * 1024 * 1024; // 50MB (52,428,800 Bytes)

    if (file.size > maxSize) {
      alert(
        `파일 용량 제한(50MB)을 초과했습니다!\n현재 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\n소스코드 원본 대신 요약된 문서를 올려주세요.`,
      );
      return false; // 실패
    }

    setSelectedFile(file);
    return true; // 성공
  };

  // 1. 클릭해서 파일을 선택했을 때
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const isValid = validateAndSetFile(e.target.files[0]);
      if (!isValid) e.target.value = ""; // 용량 초과 시 input 초기화
    }
  };

  // 2. 마우스로 드래그해서 올려놨을 때 (Drag Over)
  const handleDragOver = (e) => {
    e.preventDefault(); // 브라우저가 파일을 열어버리는 기본 동작 방지
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 3. 마우스 버튼을 놓았을 때 (Drop)
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      setSelectedFile(null);
      onClose();
      onAnalyzeSuccess();
    }, 4000);
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

        <div className="mb-5">
          <span className="inline-block bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
            ✨ 텍스트 + 이미지(구조도/UI) 통합 분석 지원
          </span>
        </div>

        {/* ⭐ 파일 업로드 영역 (드래그 앤 드롭 이벤트 추가) */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors 
            ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.hwp,.docx,.pptx"
            disabled={isAnalyzing}
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
          >
            <span className="text-4xl mb-3">📄</span>
            {selectedFile ? (
              <span className="text-sm font-semibold text-indigo-600 break-all">
                {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                여기를 클릭하거나 파일을 끌어다 놓으세요
                <br />
                <span className="text-xs text-gray-400 mt-1 block">
                  아키텍처, 캡처 화면 포함 가능 (최대 50MB)
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
