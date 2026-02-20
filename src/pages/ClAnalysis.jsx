import React, { useRef, useState } from "react";

function CIAnalysis({ isOpen, onClose }) {
  const [mode, setMode] = useState("HOME"); // HOME(PDF) | FORM

  // ⭐ 2. isOpen이 false면 아무것도 화면에 그리지 않습니다. (모달 닫힘)
  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {mode === "HOME" ? "PDF 업로드" : "자소서 입력폼"}
          </h2>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={btnOutline}
              onClick={() =>
                setMode((prev) => (prev === "HOME" ? "FORM" : "HOME"))
              }
            >
              {mode === "HOME" ? "입력폼 작성" : "PDF 업로드"}
            </button>
            <button style={btnGhost} onClick={onClose}>
              닫기
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={modalInnerStyle}>
          {mode === "HOME" && <PdfDropzoneView />}
          {mode === "FORM" && <FormView />}
        </div>
      </div>
    </div>
  );
}
// HOME 화면: PDF 드래그&드롭 + 파일 선택
function PdfDropzoneView() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePickFile = () => inputRef.current?.click();
  const acceptPdf = (f) => f && f.type === "application/pdf";

  const handleFile = (f) => {
    if (!acceptPdf(f)) {
      alert("PDF 파일만 업로드할 수 있어요.");
      return;
    }
    setFile(f);
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <div
        style={{
          ...dropzoneStyle,
          ...(isDragging ? dropzoneActiveStyle : {}),
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handlePickFile}
        role="button"
        tabIndex={0}
      >
        <div style={dropzoneTitleStyle}>
          PDF를 드래그해서 놓거나 클릭해서 업로드
        </div>
        <div style={dropzoneDescStyle}>
          업로드 후 텍스트 추출 → 분석 점수 & 예상 질문 5개 생성
        </div>

        <div style={{ marginTop: 14 }}>
          <span style={chipStyle}>PDF</span>
          <span style={{ ...chipStyle, marginLeft: 8 }}>최대 10MB(예정)</span>
        </div>
      </div>

      {file && (
        <div style={fileCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: "#0b1b3a" }}>
                {file.name}
              </div>
              <div style={mutedTextStyle}>
                {(file.size / 1024).toFixed(1)} KB · PDF 선택됨
              </div>
            </div>

            <button style={btnGhost} onClick={() => setFile(null)}>
              제거
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              justifyContent: "flex-end",
            }}
          >
            <button
              style={btnOutline}
              onClick={() => alert("다음 단계: 텍스트 추출 API 연결")}
            >
              텍스트 추출(예정)
            </button>
            <button
              style={btnPrimary}
              onClick={() => alert("다음 단계: 추출→분석→저장 연결")}
            >
              분석 시작(예정)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormView() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    console.log("저장:", { title, content });
    alert("콘솔에 데이터 찍힘");
  };

  return (
    <div>
      <label style={labelStyle}>제목</label>
      <input
        style={inputStyle}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="예) 00회사 백엔드 지원"
      />

      <label style={labelStyle}>내용</label>
      <textarea
        style={textareaStyle}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="자소서 내용을 입력하세요"
      />

      <div style={mutedTextStyle}>글자수: {content.length}자</div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 14,
        }}
      >
        <button style={btnOutline} onClick={() => setContent("")}>
          내용 비우기
        </button>
        <button
          style={btnPrimary}
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}
        >
          분석 및 저장
        </button>
      </div>
    </div>
  );
}

/** ===== Styles (메인 페이지 톤 맞춤) ===== */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(10, 30, 80, 0.45)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  zIndex: 9999,
};

const modalStyle = {
  width: "min(760px, 100%)",
  background: "#fff",
  borderRadius: 22,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
  overflow: "hidden",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "16px 18px",
  borderBottom: "1px solid rgba(15, 60, 160, 0.08)",
  background:
    "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(255,255,255,1) 60%)",
};

const titleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
  color: "#0b1b3a",
};

const modalInnerStyle = {
  padding: 18,
};

const dropzoneStyle = {
  border: "2px dashed rgba(31,85,255,0.35)",
  borderRadius: 18,
  padding: 26,
  textAlign: "center",
  cursor: "pointer",
  background: "linear-gradient(180deg, #f4f8ff 0%, #ffffff 100%)",
  boxShadow: "0 10px 26px rgba(10, 30, 80, 0.06)",
  transition: "all 0.15s ease",
};

const dropzoneActiveStyle = {
  borderColor: "#1f55ff",
  boxShadow: "0 16px 36px rgba(31,85,255,0.18)",
  transform: "translateY(-1px)",
};

const dropzoneTitleStyle = {
  fontWeight: 900,
  color: "#0b1b3a",
  fontSize: 15,
};

const dropzoneDescStyle = {
  marginTop: 6,
  fontSize: 12,
  color: "rgba(11,27,58,0.65)",
};

const chipStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  color: "#1f55ff",
  border: "1px solid rgba(31,85,255,0.25)",
  background: "#fff",
};

const fileCardStyle = {
  marginTop: 14,
  border: "1px solid rgba(15, 60, 160, 0.12)",
  borderRadius: 18,
  padding: 14,
  background: "#fff",
};

const labelStyle = {
  display: "block",
  marginTop: 10,
  fontWeight: 800,
  color: "#0b1b3a",
  fontSize: 13,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 12px",
  marginTop: 6,
  borderRadius: 14,
  border: "1px solid rgba(15, 60, 160, 0.14)",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: 160,
  padding: "12px 12px",
  marginTop: 6,
  borderRadius: 14,
  border: "1px solid rgba(15, 60, 160, 0.14)",
  outline: "none",
  resize: "vertical",
};

const mutedTextStyle = {
  fontSize: 12,
  color: "rgba(11,27,58,0.65)",
  marginTop: 8,
};

const btnBase = {
  padding: "10px 14px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const btnPrimary = {
  ...btnBase,
  background: "#1f55ff",
  color: "#fff",
  border: "1px solid #1f55ff",
  boxShadow: "0 10px 22px rgba(31,85,255,0.25)",
};

const btnOutline = {
  ...btnBase,
  background: "#fff",
  color: "#1f55ff",
  border: "1px solid rgba(31,85,255,0.35)",
};

const btnGhost = {
  ...btnBase,
  background: "transparent",
  color: "#0b1b3a",
  border: "1px solid rgba(15, 60, 160, 0.15)",
};

export default CIAnalysis;
