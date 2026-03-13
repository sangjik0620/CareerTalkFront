import React from "react";
import "../../../css/evaluation/EvaluationLoading.css";

const statusText = {
  PENDING: "분석 대기 중",
  PROCESSING: "AI 분석 진행 중",
  DONE: "분석 완료!",
  FAILED: "분석 실패",
};

function EvaluationLoading({ analysisStatus = "PENDING" }) {
  const title = statusText[analysisStatus] ?? "분석 진행 중";
  const isDone = analysisStatus === "DONE";

  const desc = isDone
    ? "분석이 완료되었습니다. 잠시 후 결과를 표시합니다."
    : "업로드된 답변을 기반으로 면접 결과를 생성하고 있습니다.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900/50">
      <div className="w-[92%] max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          
          {/* DONE이면 체크, 아니면 spinner */}
          {isDone ? (
            <div className="mb-6 text-5xl leading-none">✅</div>
          ) : (
            <svg
              className="mb-6 h-14 w-14 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="loading"
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
          )}

          <h3 className="text-xl font-bold text-gray-900">{title}</h3>

          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            {desc}
          </p>

          <div className="mt-6 w-full rounded-xl bg-gray-50 p-4 text-xs text-gray-500 text-center">
            브라우저를 닫지 말고 잠시만 기다려 주세요.
          </div>

        </div>
      </div>
    </div>
  );
}

export default EvaluationLoading;