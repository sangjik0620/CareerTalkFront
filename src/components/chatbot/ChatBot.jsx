import React, { useState } from "react";
import "../../css/ChatBot.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "안녕하세요. Carrer궁금한 점을 입력해주세요." },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { type: "user", text: trimmed }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error("서버 요청 실패");
      }

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: data.reply || "응답이 없습니다." },
        ]);
      } else {
        setError(data.errorMessage || "오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("서버와 통신 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>CarrerTalk</span>
            <button
              className="chatbot-close-button"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-chat-area">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${
                  msg.type === "user"
                    ? "chatbot-user-message"
                    : "chatbot-bot-message"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message chatbot-bot-message">
                답변 생성 중...
              </div>
            )}
          </div>

          {error && <div className="chatbot-error-text">{error}</div>}

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="질문을 입력하세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="chatbot-input"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="chatbot-send-button"
            >
              전송
            </button>
          </div>
        </div>
      )}

      <button
        className="chatbot-floating-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        챗
      </button>
    </>
  );
}
