import { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLocation, useNavigate } from "react-router-dom";
import PortfolioUploadModal from "../components/portfolio/PortfolioUploadModal";
import CIAnalysis from "./ClAnalysis";
import logo from "../img/logo.png";
import Resume from "./Resume";
import ChatBot from "../components/chatbot/ChatBot";

// ===== Icons (SVG) =====
const Icons = {
  Menu: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  X: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  FileText: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  FileCheck: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <polyline points="9 15 11 17 15 13"></polyline>
    </svg>
  ),
  Briefcase: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Video: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  ),
  MessageSquare: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Users: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  TrendingUp: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  CheckCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  Award: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  ),
  ChevronDown: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Mail: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Phone: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  ),
  MapPin: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
};

// ===== 타이핑 효과 컴포넌트 =====
const TypingEffect = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimeout);
    }

    if (!isDeleting && displayText === currentText) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setDisplayText((prev) =>
          isDeleting
            ? currentText.substring(0, prev.length - 1)
            : currentText.substring(0, prev.length + 1),
        );
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    displayText,
    currentIndex,
    isDeleting,
    isPaused,
    texts,
    speed,
    deleteSpeed,
    pauseTime,
  ]);

  return (
    <span className="relative">
      {displayText}
      <span className="animate-blink ml-1">|</span>
    </span>
  );
};

// ===== 동적 배경 컴포넌트 =====
const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 입자 클래스
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 입자 생성
    const initParticles = () => {
      particles = [];
      const numberOfParticles = Math.floor(
        (canvas.width * canvas.height) / 15000,
      );
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    initParticles();

    // 입자 연결선 그리기
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // 애니메이션 루프
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
};

// ===== 그라데이션 웨이브 배경 =====
const WaveBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="wave wave1"></div>
    <div className="wave wave2"></div>
    <div className="wave wave3"></div>
  </div>
);

// ===== Navigation (개선된 헤더) =====
const Navigation = ({ onStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 로그인 상태 관리
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('user'); 
    localStorage.clear();
    setUser(null); // 상태 초기화
    window.location.href = "/";
  };

  const handleStart = () => {
    onStart?.();
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex justify-between items-center h-32">
            <img
              src={logo}
              alt="CareerTalk Logo"
              className="h-44 w-auto object-contain"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              주요 기능
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              사용 방법
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              후기
            </a>
            <a
              href="#faq"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              FAQ
            </a>

            {/* ⭐ 마이페이지 버튼: 로그인 상태(user)일 때만 FAQ 우측에 표시 */}
            {user && (
              <a
                href="/mypage"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                마이페이지
              </a>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <span className={`font-semibold ${scrolled ? "text-primary-600" : "text-blue-600"}`}>
                  {user.nickname}님
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <a 
                href="/login" 
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                로그인
              </a>
            )}

            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg transition transform hover:scale-105 font-medium"
            >
              시작하기
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700"
            >
              {isOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md"
            >
              주요 기능
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md"
            >
              사용 방법
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md"
            >
              후기
            </a>
            <a
              href="#faq"
              className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md"
            >
              FAQ
            </a>

            {user && (
            <a
              href="/mypage"
              className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md"
            >
              마이페이지
            </a>
            )}

            {user ? (
              <>
                {/* <div className="px-3 py-2 text-primary-600 font-bold border-b border-gray-100">
                  {user.nickname}님 환영합니다
                </div> */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <a href="/login" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">
                로그인
              </a>
            )}

            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition"
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// ===== 새로운 배경 디자인: 흐르는 그라데이션 오브 =====
const FlowingGradientOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 큰 그라데이션 오브들 */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-transparent rounded-full blur-3xl animate-orb-1"></div>
      <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-indigo-400/30 via-purple-400/20 to-transparent rounded-full blur-3xl animate-orb-2"></div>
      <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-purple-400/30 via-blue-400/20 to-transparent rounded-full blur-3xl animate-orb-3"></div>
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/20 via-blue-400/15 to-transparent rounded-full blur-3xl animate-orb-4"></div>

      {/* 작은 액센트 오브들 */}
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-500/40 rounded-full blur-2xl animate-float-slow-1"></div>
      <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-indigo-500/40 rounded-full blur-2xl animate-float-slow-2"></div>
      <div className="absolute top-2/3 right-1/4 w-36 h-36 bg-purple-500/40 rounded-full blur-2xl animate-float-slow-3"></div>
    </div>
  );
};

// ===== 개선된 Hero 섹션 =====
const Hero = ({ onStart }) => {
  const typingTexts = ["완벽한 면접", "성공적인 취업", "꿈의 직장 합격"];

  return (
    <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 min-h-screen flex items-center pt-20 overflow-hidden">
      {/* 흐르는 그라데이션 오브 배경 */}
      <FlowingGradientOrbs />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6 px-5 py-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border-2 border-blue-300 animate-slide-in-down shadow-md">
              <span className="text-blue-700 text-sm font-bold flex items-center gap-2">
                <span className="animate-bounce-subtle">🚀</span>
                AI 기반 취업 준비 플랫폼
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block animate-slide-in-up text-gray-900 drop-shadow-sm">
                AI와 함께하는
              </span>
              <span className="block text-blue-600 min-h-[1.4em] inline-block drop-shadow-md font-extrabold">
                <TypingEffect
                  texts={typingTexts}
                  speed={180}
                  deleteSpeed={120}
                  pauseTime={4000}
                />
              </span>
            </h2>

            <p className="text-xl mb-10 text-gray-700 animate-slide-in-up animation-delay-300 leading-relaxed drop-shadow-sm font-medium">
              이력서, 자기소개서, 포트폴리오를 AI가 분석하고,
              <br />
              <span className="text-blue-600 font-bold">
                실전 같은 모의 면접
              </span>
              으로 취업 성공률을 높이세요
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-up animation-delay-600">
              <button
                onClick={onStart}
                className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-10 py-4 rounded-full font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  무료로 시작하기
                  <span className="transform group-hover:translate-x-2 transition-transform duration-300">
                    →
                  </span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              <button className="border-3 border-blue-600 text-blue-700 px-10 py-4 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 hover:shadow-xl transform hover:scale-105 bg-white/80 backdrop-blur-sm">
                자세히 보기
              </button>
            </div>
          </div>

          <div className="relative animate-slide-in-left animation-delay-300">
            <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-blue-200 hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                <div className="text-blue-600 relative z-10 transform group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                  <Icons.Video />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/40 via-transparent to-purple-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* 재생 버튼 효과 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl animate-pulse-slow">
                    <svg
                      className="w-10 h-10 text-blue-600 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  실시간 AI 면접 연습
                </h3>
                <p className="text-gray-700 font-medium">
                  웹캠을 통한 실전 같은 면접 경험
                </p>
              </div>
            </div>

            {/* 장식 요소 */}
            <div className="absolute top-1/2 -right-8 w-24 h-24 border-4 border-blue-400/70 rounded-full animate-spin-slow shadow-lg"></div>
            <div className="absolute -bottom-8 left-1/2 w-16 h-16 border-4 border-indigo-400/70 rounded-full animate-spin-reverse shadow-lg"></div>
            <div className="absolute top-10 -left-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full opacity-60 animate-float-gentle shadow-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ===== Features (밝은 톤) =====
const Features = ({
  onGoInterview,
  onOpenPortfolioModal,
  onOpenCoverLetterModal,
  onOpenResumeModal,
}) => {
  const features = [
    {
      icon: <Icons.FileCheck />,
      title: "이력서 AI 분석",
      description:
        "경력, 학력, 스킬을 AI가 분석하여 경쟁력 있는 이력서로 개선합니다",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      clickable: true,
      action: onOpenResumeModal,
    },
    {
      icon: <Icons.FileText />,
      title: "자기소개서 AI 분석",
      description:
        "AI가 당신의 자기소개서를 깊이 분석하여 강점과 개선점을 제시합니다",
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      clickable: true,
      action: onOpenCoverLetterModal,
    },
    {
      icon: <Icons.Briefcase />,
      title: "포트폴리오 분석",
      description:
        "업계 전문가 수준의 포트폴리오 피드백을 AI가 즉시 제공합니다",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      clickable: true,
      action: onOpenPortfolioModal,
    },
    {
      icon: <Icons.Video />,
      title: "AI 모의 면접",
      description:
        "웹캠 기능으로 실전처럼 면접을 진행하고 실시간 피드백을 받으세요",
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      clickable: true,
      action: onGoInterview,
    },
    {
      icon: <Icons.MessageSquare />,
      title: "맞춤형 피드백",
      description:
        "개인별 맞춤 분석으로 면접 스킬을 체계적으로 향상시킬 수 있습니다",
      gradient: "from-violet-500 to-violet-600",
      bgGradient: "from-violet-50 to-violet-100",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-white to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI 기반
            </span>{" "}
            주요 기능
          </h2>
          <p className="text-xl text-gray-600">
            취업 성공을 위한 모든 기능을 한 곳에서
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((f, idx) => {
            const handleClick = f.clickable ? f.action : undefined;

            return (
              <div
                key={idx}
                role={f.clickable ? "button" : undefined}
                tabIndex={f.clickable ? 0 : undefined}
                onClick={handleClick}
                onKeyDown={
                  f.clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") handleClick();
                      }
                    : undefined
                }
                className={[
                  `group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100`,
                  f.clickable ? "cursor-pointer hover:border-transparent" : "",
                ].join(" ")}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${f.bgGradient} mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className="text-gray-800 group-hover:text-gray-900 transition-colors">
                    {f.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{f.description}</p>

                {f.clickable && (
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:gap-3 transition-all">
                    바로 시작하기 <span aria-hidden>→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ===== HowItWorks (밝은 톤) =====
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "자료 등록",
      description: "이력서/자기소개서/포트폴리오를 업로드하세요",
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      number: "02",
      title: "AI 분석",
      description: "AI가 자료를 분석하고 상세한 피드백을 제공합니다",
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
    },
    {
      number: "03",
      title: "모의 면접",
      description: "웹캠을 켜고 AI와 실전 면접을 진행합니다",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      number: "04",
      title: "개선 & 성장",
      description: "피드백을 바탕으로 계속 발전해 나가세요",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            간단한{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              4단계
            </span>{" "}
            프로세스
          </h2>
          <p className="text-xl text-gray-600">
            누구나 쉽게 시작할 수 있는 체계적인 면접 준비
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative group"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${s.bgGradient} mb-6 relative group-hover:scale-110 transition-all duration-300 shadow-lg`}
                >
                  <span
                    className={`text-3xl font-bold bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent`}
                  >
                    {s.number}
                  </span>
                  <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                  ></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {s.title}
                </h3>
                <p className="text-gray-600">{s.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-transparent -translate-x-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== TestimonialsInner (후기 '내용만') =====
const TestimonialsInner = () => {
  const testimonials = [
    {
      name: "김민준",
      role: "소프트웨어 엔지니어",
      company: "네이버 합격",
      content:
        "CareerTalk 덕분에 면접 준비를 체계적으로 할 수 있었어요. AI 피드백이 정말 도움이 되었습니다!",
      rating: 5,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      name: "이서연",
      role: "마케팅 전문가",
      company: "카카오 합격",
      content:
        "자기소개서 분석 기능이 정말 유용했어요. 제가 놓친 부분을 정확히 짚어주더라고요.",
      rating: 5,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      name: "박지훈",
      role: "데이터 분석가",
      company: "쿠팡 합격",
      content:
        "실전 같은 모의 면접으로 긴장감도 줄이고 답변도 다듬을 수 있었습니다. 강력 추천!",
      rating: 5,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "정수아",
      role: "UX 디자이너",
      company: "토스 합격",
      content:
        "포트폴리오 피드백을 받고 개선했더니 면접관들의 반응이 확실히 달랐어요!",
      rating: 5,
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          성공한{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            사용자 후기
          </span>
        </h2>
        <p className="text-xl text-gray-600">
          CareerTalk와 함께 꿈의 직장에 합격한 분들의 이야기
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="flex mb-4">
              {[...Array(t.rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-gray-600 mb-6 italic leading-relaxed">
              "{t.content}"
            </p>

            <div className="border-t pt-4 border-gray-100">
              <div className="font-bold text-gray-900">{t.name}</div>
              <div className="text-sm text-gray-600 mt-1">{t.role}</div>
              <div
                className={`text-sm font-bold mt-1 bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent`}
              >
                {t.company}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== Statistics (껍데기: 그라데이션 배경 유지 + 내용은 후기) =====
const Statistics = () => {
  return (
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"
    >
      {/* 배경 장식 그대로 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* ✅ 내용만 후기 */}
      <div className="relative z-10">
        <TestimonialsInner />
      </div>
    </section>
  );
};

// ===== Testimonials (껍데기: 흰 배경 유지 + 내용은 통계) =====
const Testimonials = () => {
  return (
    <section className="py-24 bg-white">
      {/* ✅ 내용만 통계 */}
      <StatisticsInner />
    </section>
  );
};

// ===== FAQ (밝은 톤) =====
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "CareerTalk는 어떻게 사용하나요?",
      answer:
        "간단합니다! 자기소개서와 포트폴리오를 업로드하면 AI가 분석하고, 그 결과를 바탕으로 맞춤형 모의 면접을 진행할 수 있습니다.",
    },
    {
      question: "AI 면접은 어떻게 진행되나요?",
      answer:
        "웹캠을 통해 실전과 같은 환경에서 AI와 면접을 진행합니다. 질문에 답변하면 AI가 실시간으로 평가하고 피드백을 제공합니다.",
    },
    {
      question: "가격은 어떻게 되나요?",
      answer:
        "기본 기능은 무료로 제공됩니다. 고급 분석과 무제한 면접 연습을 원하시면 프리미엄 플랜을 이용하실 수 있습니다.",
    },
    {
      question: "제 정보는 안전하게 보호되나요?",
      answer:
        "네, 모든 개인정보와 업로드된 자료는 암호화되어 안전하게 보관됩니다. 귀하의 동의 없이 제3자와 공유되지 않습니다.",
    },
    {
      question: "어떤 직무에 사용할 수 있나요?",
      answer:
        "IT, 마케팅, 디자인, 영업, 기획 등 모든 직무에 활용 가능합니다. AI가 직무별 특성을 고려하여 맞춤 피드백을 제공합니다.",
    },
    {
      question: "모바일에서도 사용할 수 있나요?",
      answer:
        "네, 모바일 브라우저에서도 모든 기능을 사용할 수 있습니다. 다만 면접 연습은 PC 환경을 권장합니다.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            자주 묻는{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              질문
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            궁금한 점이 있으신가요? 여기서 답을 찾아보세요
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-blue-50/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-gray-900 text-lg">
                  {faq.question}
                </span>
                <span
                  className={`transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <Icons.ChevronDown />
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== CTA (밝은 톤) =====
const CTA = ({ onStart }) => (
  <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-smooth"></div>
    </div>

    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      data-aos="zoom-in"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
        지금 바로 면접 준비를 시작하세요
      </h2>
      <p className="text-xl text-blue-100 mb-10">
        수천 명의 취업 성공 스토리에 당신도 함께하세요
      </p>
      <button
        onClick={onStart}
        className="group bg-white text-blue-600 px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
      >
        무료로 시작하기
        <span className="transform group-hover:translate-x-2 transition-transform text-xl">
          →
        </span>
      </button>
      <p className="mt-6 text-blue-100">
        ✓ 신용카드 등록 없이 무료로 체험 가능합니다
      </p>
    </div>
  </section>
);

// ===== Footer (밝은 톤) =====
const Footer = () => (
  <footer className="bg-gray-50 text-gray-700 py-12 border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8 items-start">
        <div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CareerTalk
          </h3>
          <p className="text-gray-600">AI 기반 취업 면접 준비의 새로운 기준</p>
        </div>

        <div className="md:text-right">
          <p className="text-gray-900 font-bold whitespace-nowrap">
            해당 홈페이지는 교육용으로 만들어진 홈페이지입니다.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-600 text-sm">
          © 2026 CareerTalk. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

// ===== Home Page =====
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ 1. 자물쇠 역할을 할 Ref 생성 (리렌더링 되어도 값이 유지됨)
  const isProcessed = useRef(false);

  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 100 });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isLoginSuccess = params.get('loginSuccess');

    if (isLoginSuccess === 'true' && !isProcessed.current) {
      isProcessed.current = true;

      const token = params.get('token');
      const loginId = params.get('loginId');
      
      if (token) {
        localStorage.setItem('token', token);
      }

      const userData = {
        loginId: loginId,
        email: params.get('email'),
        nickname: params.get('nickname'),
        targetJob: params.get('targetJob'),
      };

      localStorage.setItem('user', JSON.stringify(userData));

      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = '/'; 
    }
  }, [location]);

  const goInterview = () => navigate("/interview/select");

  return (
    <>
      <div>
        <ChatBot />
      </div>
      <Navigation onStart={goInterview} />
      <Hero onStart={goInterview} />

      <Features
        onGoInterview={goInterview}
        onOpenPortfolioModal={() => setIsPortfolioModalOpen(true)}
        onOpenCoverLetterModal={() => setIsCoverLetterModalOpen(true)}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
      />
      <HowItWorks />
      <Statistics />
      <FAQ />
      <CTA onStart={goInterview} />
      <Footer />

      <PortfolioUploadModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        onAnalyzeSuccess={() => {
          setIsPortfolioModalOpen(false);
          navigate("/portfolio/result");
        }}
      />

      <CIAnalysis
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
        onAnalyzeSuccess={() => {
          setIsCoverLetterModalOpen(false);
          navigate("/cover-letter/result");
        }}
      />

      <Resume
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onAnalyzeSuccess={() => {
          setIsResumeModalOpen(false);
        }}
      />

      <style>{`
  /* 흐르는 그라데이션 오브 애니메이션 */
  @keyframes orb-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(100px, 50px) scale(1.1); }
    66% { transform: translate(-50px, -30px) scale(0.9); }
  }
  @keyframes orb-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-80px, 60px) scale(1.15); }
    66% { transform: translate(40px, -40px) scale(0.95); }
  }
  @keyframes orb-3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(60px, -50px) scale(1.2); }
  }
  @keyframes orb-4 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    33% { transform: translate(-45%, -55%) scale(1.1); }
    66% { transform: translate(-55%, -45%) scale(0.9); }
  }

  .animate-orb-1 { animation: orb-1 25s ease-in-out infinite; }
  .animate-orb-2 { animation: orb-2 30s ease-in-out infinite; }
  .animate-orb-3 { animation: orb-3 28s ease-in-out infinite; }
  .animate-orb-4 { animation: orb-4 35s ease-in-out infinite; }

  /* 작은 오브 플로팅 */
  @keyframes float-slow-1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
  @keyframes float-slow-2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,30px)} }
  @keyframes float-slow-3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,35px)} }
  .animate-float-slow-1 { animation: float-slow-1 15s ease-in-out infinite; }
  .animate-float-slow-2 { animation: float-slow-2 18s ease-in-out infinite; }
  .animate-float-slow-3 { animation: float-slow-3 20s ease-in-out infinite; }

  /* 부드러운 펄스 */
  @keyframes pulse-slow { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:.9} }
  .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

  /* 부드러운 플로팅 */
  @keyframes float-gentle {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-20px) rotate(3deg); }
    66% { transform: translateY(-10px) rotate(-3deg); }
  }
  .animate-float-gentle { animation: float-gentle 12s ease-in-out infinite; }

  /* 부드러운 바운스 */
  @keyframes bounce-subtle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }

  /* 타이핑 커서 깜빡임 */
  @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  .animate-blink { animation: blink 0.8s infinite; color:#2563eb; font-weight:bold; }

  /* 슬라이드 인 애니메이션 */
  @keyframes slideInDown { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  .animate-slide-in-down { animation: slideInDown 1s ease-out forwards; }
  .animate-slide-in-up { animation: slideInUp 1s ease-out forwards; }
  .animate-slide-in-left { animation: slideInLeft 1s ease-out forwards; }

  /* 애니메이션 딜레이 */
  .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
  .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
  .animation-delay-900 { animation-delay: 0.9s; opacity: 0; }

  /* 회전 애니메이션 */
  @keyframes spin-slow {
    from { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    to { transform: rotate(360deg) scale(1); }
  }
  @keyframes spin-reverse {
    from { transform: rotate(360deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    to { transform: rotate(0deg) scale(1); }
  }
  .animate-spin-slow { animation: spin-slow 20s ease-in-out infinite; }
  .animate-spin-reverse { animation: spin-reverse 18s ease-in-out infinite; }

  /* 그라데이션 배경 애니메이션 */
  .bg-size-200 { background-size: 200% auto; }
  .bg-pos-0 { background-position: 0% center; }
  .bg-pos-100 { background-position: 100% center; }

  /* 그림자 효과 */
  .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }

  /* 카운터 애니메이션 */
  @keyframes counter-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .counter-animation { animation: counter-up 1s ease-out; }
`}</style>
    </>
  );
}
