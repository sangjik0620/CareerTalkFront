import React, { useState, useEffect } from "react";

// ==========================================
// [설정 영역]
// ==========================================
// Select 박스에 보여줄 직무군 카테고리 목록입니다.
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

const PortfolioUploadModal = ({ isOpen, onClose, onAnalyzeSuccess }) => {
  // ==========================================
  // [상태 관리 (State)]
  // ==========================================
  const [selectedFile, setSelectedFile] = useState(null); // 사용자가 선택한 파일
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태 감지
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 로딩 화면 전환용 상태

  const [jobCategory, setJobCategory] = useState(""); // 지원 직무군 (필수)
  const [detailedPosition, setDetailedPosition] = useState(""); // 상세 포지션 (선택)

  // ==========================================
  // [이벤트 핸들러: 모달 닫기 (ESC 키)]
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 모달이 열려있고, ESC 키를 눌렀으며, 로딩 중이 아닐 때만 닫기
      if (isOpen && e.key === "Escape" && !isAnalyzing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isAnalyzing, onClose]);

  if (!isOpen) return null;

  // ==========================================
  // [비즈니스 로직: 파일 검증 및 업로드]
  // ==========================================
  const validateAndSetFile = (file) => {
    // ⭐ 1. 확장자(파일 형식) 방어 로직 추가!
    // 파일 이름이 .pdf 또는 .pptx 로 끝나는지 대소문자 구분 없이(i) 검사합니다.
    const allowedExtensions = /(\.pdf|\.pptx)$/i;

    if (!allowedExtensions.test(file.name)) {
      alert(
        "지원하지 않는 파일 형식입니다.\nPDF 또는 PPTX 파일만 업로드해 주세요.",
      );
      return false; // 파일 세팅 거부!
    }

    // 2. 기존 용량 검사 로직 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(
        `파일 용량 제한(50MB)을 초과했습니다!\n현재 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
      return false;
    }

    // 3. 확장자, 용량 모두 통과하면 파일 저장
    setSelectedFile(file);
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const isValid = validateAndSetFile(e.target.files[0]);
      if (!isValid) e.target.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // ==========================================
  // [이벤트 핸들러: 분석 시작 버튼 클릭]
  // ==========================================
  const handleAnalyzeClick = () => {
    if (!selectedFile || !jobCategory) return;

    // 분석 상태를 true로 변경 -> UI가 로딩 화면으로 바뀜
    setIsAnalyzing(true);

    const targetJobData = detailedPosition
      ? `${jobCategory} (${detailedPosition})`
      : jobCategory;

    console.log("전송할 직무:", targetJobData);
    console.log("전송할 파일:", selectedFile.name);

    // 가짜 딜레이 시간 (3초 뒤 결과창으로 이동)
    // 실제 API 연동 시 이 부분을 비동기(fetch/axios) 처리로 변경하세요.
    setTimeout(() => {
      setIsAnalyzing(false);
      setSelectedFile(null);
      setJobCategory("");
      setDetailedPosition("");
      onClose();
      onAnalyzeSuccess();
    }, 3000);
  };

  // ==========================================
  // [UI 렌더링 영역]
  // ==========================================
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
      // 로딩 중이 아닐 때만 어두운 배경 클릭 시 닫기
      onClick={!isAnalyzing ? onClose : undefined}
    >
      <div
        // 로딩 중일 때는 모달 높이를 고정해서 흔들림 방지
        className={`bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 transform transition-all ${
          isAnalyzing ? "min-h-[300px] flex flex-col justify-center" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ⭐ 조건부 렌더링: 로딩 중이면 스피너 표시, 아니면 기존 폼 표시 */}
        {isAnalyzing ? (
          // ================= [클래식 로딩 화면 UI] =================
          <div className="flex flex-col items-center justify-center py-10">
            {/* 심플한 빙글빙글 스피너 */}
            <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              포트폴리오 분석 중
            </h3>
            <p className="text-gray-500 text-sm">잠시만 기다려 주세요...</p>
          </div>
        ) : (
          // ========================================================

          // ================= [기존 입력 폼 UI] =================
          <>
            {/* 헤더 영역 */}
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

            {/* 입력 폼 영역 (직무군 & 상세 포지션) */}
            <div className="space-y-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  지원 직무군 <span className="text-red-500">*</span>
                </label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">직무군을 선택해주세요</option>
                  {JOB_CATEGORIES.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  상세 포지션{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (선택)
                  </span>
                </label>
                <input
                  type="text"
                  value={detailedPosition}
                  onChange={(e) => setDetailedPosition(e.target.value)}
                  placeholder="예) 프론트엔드, UX/UI, 퍼포먼스 마케터 등"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* 파일 드래그 & 드롭 영역 */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors 
                ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.pptx"
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
                      PDF, PPTX 형식 지원 (최대 50MB)
                    </span>
                  </span>
                )}
              </label>
            </div>

            {/* 하단 제어 버튼 (취소 / 시작) */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                취소
              </button>

              <button
                onClick={handleAnalyzeClick}
                disabled={!selectedFile || !jobCategory}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                정밀 분석 시작
              </button>
            </div>
          </>
          // ========================================================
        )}
      </div>
    </div>
  );
};

export default PortfolioUploadModal;
