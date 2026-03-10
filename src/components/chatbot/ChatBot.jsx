import React, { useState, useEffect, useRef } from "react";
import "../../css/ChatBot.css";
import chatbotIcon from "../../img/chaticon2.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [messages, setMessages] = useState([
    { type: "bot", text: "안녕하세요. CarrerTalk 궁금한 점을 입력해주세요." },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatAreaRef = useRef(null);

  useEffect(() => {
    // 채팅 받을때마다 화면 이펙트
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    //화면스크롤시 챗봇 아이콘 이펙트
    let lastScrollY = window.scrollY;
    let ticking = false;
    let animationFrame;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const limited = Math.max(-12, Math.min(12, diff * 0.6));
          setScrollOffset(limited);
          ticking = false;
        });
        ticking = true;
      }

      clearTimeout(animationFrame);
      animationFrame = setTimeout(() => {
        setScrollOffset(0);
      }, 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(animationFrame);
    };
  }, []);

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

          <div className="chatbot-chat-area" ref={chatAreaRef}>
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
              <div className="chatbot-message chatbot-bot-message">...</div>
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
        style={{ transform: `translateY(${scrollOffset}px)` }}
      >
        <img src={chatbotIcon} alt="챗봇" className="chatbot-floating-icon" />
      </button>
    </>
  );
}
