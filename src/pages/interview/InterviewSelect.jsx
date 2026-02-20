// src/pages/InterviewSelect.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const FILE_META = {
  resume: {
    label: "이력서",
    desc: "경력 및 학력 기반 질문",
    accepts: [".pdf", ".doc", ".docx"],
    color: "blue",
  },
  coverLetter: {
    label: "자기소개서",
    desc: "동기 및 역량 기반 질문",
    accepts: [".pdf", ".doc", ".docx", ".txt"],
    color: "purple",
  },
  portfolio: {
    label: "포트폴리오",
    desc: "프로젝트 경험 기반 질문",
    accepts: [".pdf", ".ppt", ".pptx"],
    color: "green",
  },
};

export default function InterviewSelect() {
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState({
    resume: null,
    coverLetter: null,
    portfolio: null,
  });

  const [dragOverKey, setDragOverKey] = useState(null);

  const [settings, setSettings] = useState({
    questionCount: "10",
    difficulty: "medium",
    jobPosition: "developer",
  });

  const hasFiles = useMemo(
    () => Object.values(selectedFiles).some((f) => f !== null),
    [selectedFiles]
  );

  const selectedList = useMemo(() => {
    return Object.entries(selectedFiles)
      .filter(([, file]) => file)
      .map(([key, file]) => ({ key, label: FILE_META[key].label, name: file.name }));
  }, [selectedFiles]);

  const handlePick = (key, file) => {
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleDrop = (e, key) => {
    e.preventDefault();
    setDragOverKey(null);
    const file = e.dataTransfer.files?.[0];
    handlePick(key, file);
  };

  const startInterview = () => {
    if (!hasFiles) return;

    const interviewData = {
      files: {
        resume: selectedFiles.resume ? selectedFiles.resume.name : null,
        coverLetter: selectedFiles.coverLetter ? selectedFiles.coverLetter.name : null,
        portfolio: selectedFiles.portfolio ? selectedFiles.portfolio.name : null,
      },
      settings: { ...settings },
    };

    localStorage.setItem("interviewData", JSON.stringify(interviewData));
    navigate("/interview/session");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-gradient-to-br from-blue-800 to-blue-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-2xl font-extrabold text-white">CareerTalk</h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-white hover:text-blue-200 transition"
            >
              ← 메인으로 돌아가기
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            🎤 AI 모의 면접 시작하기
          </h2>
          <p className="text-xl text-gray-600">면접에 사용할 자료를 선택해주세요 (최소 1개 이상)</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.keys(FILE_META).map((key) => (
            <FileCard
              key={key}
              fileKey={key}
              meta={FILE_META[key]}
              file={selectedFiles[key]}
              isDragOver={dragOverKey === key}
              onDragOver={() => setDragOverKey(key)}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={(e) => handleDrop(e, key)}
              onPick={(file) => handlePick(key, file)}
            />
          ))}
        </div>

        {/* Selected summary */}
        {selectedList.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5">
                ✓
              </span>
              선택된 자료
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {selectedList.map((it) => (
                <li key={it.key}>• {it.label}: {it.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">면접 설정</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">질문 개수</label>
              <select
                value={settings.questionCount}
                onChange={(e) => setSettings((p) => ({ ...p, questionCount: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5개 (약 10분)</option>
                <option value="10">10개 (약 20분)</option>
                <option value="15">15개 (약 30분)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">면접 난이도</label>
              <select
                value={settings.difficulty}
                onChange={(e) => setSettings((p) => ({ ...p, difficulty: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">초급 (기본 질문)</option>
                <option value="medium">중급 (일반적인 면접)</option>
                <option value="hard">고급 (심화 질문)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지원 직무</label>
              <select
                value={settings.jobPosition}
                onChange={(e) => setSettings((p) => ({ ...p, jobPosition: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="developer">소프트웨어 개발자</option>
                <option value="designer">디자이너</option>
                <option value="marketer">마케터</option>
                <option value="pm">프로덕트 매니저</option>
                <option value="data">데이터 분석가</option>
                <option value="general">일반 직무</option>
              </select>
            </div>
          </div>
        </div>

        {/* Start */}
        <div className="text-center">
          <button
            onClick={startInterview}
            disabled={!hasFiles}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            면접 시작하기 →
          </button>

          {!hasFiles && (
            <p className="mt-4 text-red-600 text-sm">
              최소 1개 이상의 자료를 업로드해주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FileCard({
  fileKey,
  meta,
  file,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onPick,
}) {
  const selected = Boolean(file);

  const colorMap = {
    blue: { ring: "ring-blue-500", bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-600" },
    purple: { ring: "ring-purple-500", bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-600" },
    green: { ring: "ring-green-500", bg: "bg-green-100", text: "text-green-600", border: "border-green-600" },
  };

  const c = colorMap[meta.color];

  return (
    <div
      className={[
        "bg-white rounded-2xl p-8 shadow-lg border-2 transition",
        "hover:-translate-y-1 hover:shadow-2xl",
        selected ? `${c.border} bg-blue-50/40` : "border-transparent",
      ].join(" ")}
    >
      <div className="text-center">
        <div className={`w-20 h-20 ${c.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className={`text-3xl ${c.text}`}>📄</span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{meta.label}</h3>
        <p className="text-gray-600 text-sm mb-4">{meta.desc}</p>

        <div
          className={[
            "rounded-lg p-6 text-center border-2 border-dashed transition",
            isDragOver ? `bg-blue-50 ${c.border}` : "border-slate-300 hover:bg-slate-50",
          ].join(" ")}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver();
          }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            type="file"
            className="hidden"
            accept={meta.accepts.join(",")}
            id={`file-input-${fileKey}`}
            onChange={(e) => onPick(e.target.files?.[0])}
          />

          <p className="text-sm text-gray-500">
            <button
              type="button"
              className={`${c.text} font-semibold hover:underline`}
              onClick={() => document.getElementById(`file-input-${fileKey}`)?.click()}
            >
              파일 선택
            </button>{" "}
            또는 드래그
          </p>

          <p className="text-xs text-gray-400 mt-2">{meta.accepts.join(", ").toUpperCase()}</p>
        </div>

        {file && (
          <div className="mt-3 text-sm text-green-600 font-medium">
            ✓ {file.name}
          </div>
        )}
      </div>
    </div>
  );
}