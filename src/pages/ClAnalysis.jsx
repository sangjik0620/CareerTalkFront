import React, { useRef, useState } from "react";

function CIAnalysis() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("HOME"); // HOME(PDF) | FORM

  const closeModal = () => {
    setIsOpen(false);
    setMode("HOME");
  };

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => setIsOpen(true)}>모달 열기</button>

      {isOpen && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={headerStyle}>
              <h2 style={{ margin: 0 }}>
                {mode === "HOME" ? "PDF 업로드" : "자소서 입력폼"}
              </h2>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() =>
                    setMode((prev) => (prev === "HOME" ? "FORM" : "HOME"))
                  }
                >
                  {mode === "HOME" ? "입력폼 작성" : "PDF 업로드"}
                </button>
                <button onClick={closeModal}>닫기</button>
              </div>
            </div>

            {mode === "HOME" && <PdfDropzoneView />}
            {mode === "FORM" && <FormView />}
          </div>
        </div>
      )}
    </div>
  );
}

//드래그엔 드롭 뷰
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
    <div style={{ marginTop: "12px" }}>
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
        <div style={{ fontWeight: 800, marginBottom: 6 }}>
          PDF를 드래그해서 놓거나 클릭해서 업로드
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          (텍스트 추출/분석은 다음 단계에서 붙이면 됨)
        </div>
      </div>

      {file && (
        <div style={fileBoxStyle}>
          <div style={{ fontWeight: 700 }}>선택된 파일</div>
          <div style={{ fontSize: 13 }}>{file.name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {(file.size / 1024).toFixed(1)} KB
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              style={btnStyle}
              onClick={() => alert("다음 단계: 텍스트 추출 API 연결")}
            >
              텍스트 추출(예정)
            </button>
            <button style={btnStyle} onClick={() => setFile(null)}>
              파일 제거
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
    <div style={{ marginTop: "12px" }}>
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

      <div style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
        글자수: {content.length}자
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginTop: "14px",
        }}
      >
        <button
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}
        >
          분석 및 저장
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "520px",
  border: "2px solid black",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
};

const dropzoneStyle = {
  border: "2px dashed #999",
  borderRadius: 12,
  padding: 24,
  textAlign: "center",
  cursor: "pointer",
  background: "#fafafa",
};

const dropzoneActiveStyle = {
  borderColor: "#000",
  background: "#fff",
};

const fileBoxStyle = {
  marginTop: 12,
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};

const labelStyle = { display: "block", marginTop: "10px", fontWeight: 700 };
const inputStyle = { width: "96%", padding: "10px", marginTop: "6px" };
const textareaStyle = {
  width: "96%",
  height: "140px",
  padding: "10px",
  marginTop: "6px",
};
const btnStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
};

export default CIAnalysis;
