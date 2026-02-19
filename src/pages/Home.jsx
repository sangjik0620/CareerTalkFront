import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";


// ===== Icons (SVG) =====
const Icons = {
   Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  FileCheck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <polyline points="9 15 11 17 15 13"></polyline>
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Video: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  ),
  MessageSquare: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  Award: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
};

// ===== Components =====
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <h1 className={`text-2xl font-bold ${scrolled ? "text-primary-600" : "text-white"}`}>CareerTalk</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className={`hover:text-primary-600 transition ${scrolled ? "text-gray-700" : "text-white"}`}>주요 기능</a>
            <a href="#how-it-works" className={`hover:text-primary-600 transition ${scrolled ? "text-gray-700" : "text-white"}`}>사용 방법</a>
            <a href="#testimonials" className={`hover:text-primary-600 transition ${scrolled ? "text-gray-700" : "text-white"}`}>후기</a>
            <a href="#faq" className={`hover:text-primary-600 transition ${scrolled ? "text-gray-700" : "text-white"}`}>FAQ</a>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition">
              시작하기
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={scrolled ? "text-gray-700" : "text-white"}>
              {isOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#features" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">주요 기능</a>
            <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">사용 방법</a>
            <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">후기</a>
            <a href="#faq" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">FAQ</a>
            <button className="w-full bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition">
              시작하기
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="relative bg-gradient-to-br from-blue-800 to-blue-500 min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white" data-aos="fade-right">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              AI와 함께하는<br />완벽한 면접 준비
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              이력서, 자기소개서, 포트폴리오를 AI가 분석하고,<br />
              실전 같은 모의 면접으로 취업 성공률을 높이세요
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition hover:scale-105">
                무료로 시작하기
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition">
                자세히 보기
              </button>
            </div>
          </div>

          <div className="relative" data-aos="fade-left">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Icons.Video />
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">실시간 AI 면접 연습</h3>
                <p className="text-gray-600">웹캠을 통한 실전 같은 면접 경험</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
);

const Features = ({ onGoInterview }) => {
  const features = [
    {
      icon: <Icons.FileCheck />,
      title: "이력서 AI 분석",
      description: "경력, 학력, 스킬을 AI가 분석하여 경쟁력 있는 이력서로 개선합니다",
    },
    {
      icon: <Icons.FileText />,
      title: "자기소개서 AI 분석",
      description: "AI가 당신의 자기소개서를 깊이 분석하여 강점과 개선점을 제시합니다",
    },
    {
      icon: <Icons.Briefcase />,
      title: "포트폴리오 분석",
      description: "업계 전문가 수준의 포트폴리오 피드백을 AI가 즉시 제공합니다",
    },
    {
      icon: <Icons.Video />,
      title: "AI 모의 면접",
      description: "웹캠 기능으로 실전처럼 면접을 진행하고 실시간 피드백을 받으세요",
    },
    {
      icon: <Icons.MessageSquare />,
      title: "맞춤형 피드백",
      description: "개인별 맞춤 분석으로 면접 스킬을 체계적으로 향상시킬 수 있습니다",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI 기반{" "}
            <span className="bg-gradient-to-br from-blue-800 to-blue-500 bg-clip-text text-transparent">
              핵심 기능
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            CareerTalk의 강력한 기능으로 면접 준비를 완성하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {features.map((f, idx) => {
            const isInterview = f.title === "AI 모의 면접";

            return (
              <div
                key={idx}
                role={isInterview ? "button" : undefined}
                tabIndex={isInterview ? 0 : undefined}
                onClick={isInterview ? onGoInterview : undefined}
                onKeyDown={
                  isInterview
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") onGoInterview?.();
                      }
                    : undefined
                }
                className={[
                  "bg-white rounded-xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)] transition hover:scale-105",
                  isInterview ? "cursor-pointer ring-1 ring-blue-100 hover:ring-blue-300" : "",
                ].join(" ")}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="text-blue-600 mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>

                {isInterview && (
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
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

const HowItWorks = () => {
  const steps = [
    { number: "01", title: "자료 등록", description: "이력서/자기소개서/포트폴리오를 업로드하세요" },
    { number: "02", title: "AI 분석", description: "AI가 자료를 분석하고 상세한 피드백을 제공합니다" },
    { number: "03", title: "모의 면접", description: "웹캠을 켜고 AI와 실전 면접을 진행합니다" },
    { number: "04", title: "개선 & 성장", description: "피드백을 바탕으로 계속 발전해 나가세요" },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            간단한 <span className="bg-gradient-to-br from-blue-800 to-blue-500 bg-clip-text text-transparent">4단계</span> 프로세스
          </h2>
          <p className="text-xl text-gray-600">누구나 쉽게 시작할 수 있는 체계적인 면접 준비</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative" data-aos="fade-up" data-aos-delay={idx * 100}>
              <div className="text-center">
                <div className="inline-block bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-blue-600">{s.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600">{s.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-blue-200 -translate-x-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Statistics = () => {
  const stats = [
    { icon: <Icons.Users />, number: "10,000+", label: "누적 사용자" },
    { icon: <Icons.TrendingUp />, number: "95%", label: "만족도" },
    { icon: <Icons.CheckCircle />, number: "50,000+", label: "완료된 면접 세션" },
    { icon: <Icons.Award />, number: "4.8/5.0", label: "평균 개선 점수" },
  ];

  return (
    <section className="py-20 blue-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white" data-aos="zoom-in" data-aos-delay={index * 100}>
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-blue-200 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    { name: "김민준", role: "소프트웨어 엔지니어", company: "네이버 합격", content: "CareerTalk 덕분에 면접 준비를 체계적으로 할 수 있었어요. AI 피드백이 정말 도움이 되었습니다!", rating: 5 },
    { name: "이서연", role: "마케팅 전문가", company: "카카오 합격", content: "자기소개서 분석 기능이 정말 유용했어요. 제가 놓친 부분을 정확히 짚어주더라고요.", rating: 5 },
    { name: "박지훈", role: "데이터 분석가", company: "쿠팡 합격", content: "실전 같은 모의 면접으로 긴장감도 줄이고 답변도 다듬을 수 있었습니다. 강력 추천!", rating: 5 },
    { name: "정수아", role: "UX 디자이너", company: "토스 합격", content: "포트폴리오 피드백을 받고 개선했더니 면접관들의 반응이 확실히 달랐어요!", rating: 5 },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            성공한 <span className="text-gradient">사용자 후기</span>
          </h2>
          <p className="text-xl text-gray-600">CareerTalk와 함께 꿈의 직장에 합격한 분들의 이야기</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.1)]" data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">"{t.content}"</p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-600">{t.role}</div>
                <div className="text-sm text-primary-600 font-medium">{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: "CareerTalk는 어떻게 사용하나요?", answer: "간단합니다! 자기소개서와 포트폴리오를 업로드하면 AI가 분석하고, 그 결과를 바탕으로 맞춤형 모의 면접을 진행할 수 있습니다." },
    { question: "AI 면접은 어떻게 진행되나요?", answer: "웹캠을 통해 실전과 같은 환경에서 AI와 면접을 진행합니다. 질문에 답변하면 AI가 실시간으로 평가하고 피드백을 제공합니다." },
    { question: "가격은 어떻게 되나요?", answer: "기본 기능은 무료로 제공됩니다. 고급 분석과 무제한 면접 연습을 원하시면 프리미엄 플랜을 이용하실 수 있습니다." },
    { question: "제 정보는 안전하게 보호되나요?", answer: "네, 모든 개인정보와 업로드된 자료는 암호화되어 안전하게 보관됩니다. 귀하의 동의 없이 제3자와 공유되지 않습니다." },
    { question: "어떤 직무에 사용할 수 있나요?", answer: "IT, 마케팅, 디자인, 영업, 기획 등 모든 직무에 활용 가능합니다. AI가 직무별 특성을 고려하여 맞춤 피드백을 제공합니다." },
    { question: "모바일에서도 사용할 수 있나요?", answer: "네, 모바일 브라우저에서도 모든 기능을 사용할 수 있습니다. 다만 면접 연습은 PC 환경을 권장합니다." },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            자주 묻는 <span className="text-gradient">질문</span>
          </h2>
          <p className="text-xl text-gray-600">궁금한 점이 있으신가요? 여기서 답을 찾아보세요</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden" data-aos="fade-up" data-aos-delay={index * 50}>
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className={`transform transition-transform ${openIndex === index ? "rotate-180" : ""}`}>
                  <Icons.ChevronDown />
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-20 blue-gradient">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="zoom-in">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">지금 바로 면접 준비를 시작하세요</h2>
      <p className="text-xl text-blue-100 mb-8">수천 명의 취업 성공 스토리에 당신도 함께하세요</p>
      <button className="bg-white text-primary-600 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition hover:scale-105">
        무료로 시작하기
      </button>
      <p className="mt-4 text-blue-200">신용카드 등록 없이 무료로 체험 가능합니다</p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-2xl font-bold mb-4">CareerTalk</h3>
          <p className="text-gray-400">AI 기반 취업 면접 준비의 새로운 기준</p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">서비스</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition">AI 자기소개서 분석</a></li>
            <li><a href="#" className="hover:text-white transition">포트폴리오 피드백</a></li>
            <li><a href="#" className="hover:text-white transition">모의 면접</a></li>
            <li><a href="#" className="hover:text-white transition">가격 안내</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">회사</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition">회사 소개</a></li>
            <li><a href="#" className="hover:text-white transition">채용</a></li>
            <li><a href="#" className="hover:text-white transition">파트너십</a></li>
            <li><a href="#" className="hover:text-white transition">블로그</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">문의</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2"><Icons.Mail /><span>contact@careertalk.com</span></li>
            <li className="flex items-center gap-2"><Icons.Phone /><span>02-1234-5678</span></li>
            <li className="flex items-center gap-2"><Icons.MapPin /><span>서울시 강남구 테헤란로</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">© 2026 CareerTalk. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-white transition text-sm">이용약관</a>
          <a href="#" className="text-gray-400 hover:text-white transition text-sm">개인정보처리방침</a>
          <a href="#" className="text-gray-400 hover:text-white transition text-sm">쿠키 정책</a>
        </div>
      </div>
    </div>
  </footer>
);

// ===== Home Page =====
export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 100 });
  }, []);

  return (
    <>
      <Navigation />
      <Hero />
      <Features onGoInterview={() => navigate("/interview/select")} />
      <HowItWorks />
      <Statistics />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />

      <style>{`
        .blue-gradient { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); }
        .text-gradient {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </>
  );
}