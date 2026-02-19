// src/pages/InterviewScreen.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function InterviewScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 직접 URL로 들어오면 state가 없을 수 있음 → 선택 페이지로 보내기
  if (!state) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="mb-4">선택 정보가 없어요.</p>
          <button
            className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold"
            onClick={() => navigate("/interview/select")}
          >
            문서 선택으로 이동
          </button>
        </div>
      </div>
    );
  }

  const { selectedTypes, files } = state;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-2xl font-extrabold">AI 면접 화면</h1>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="font-bold">선택된 문서</div>
        <ul className="mt-3 list-disc pl-6 text-slate-300">
          {selectedTypes.map((t) => (
            <li key={t}>
              {t} {files?.[t] ? `- ${files[t].name}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
