import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios"

// 페이지 및 컴포넌트 임포트
import Home from "./pages/Home";
import InterviewSession from "./pages/interview/InterviewSession";
import InterviewSelect from "./pages/interview/InterviewSelect"; // 이름을 InterviewSelect로 수정
import PortfolioResultPage from "./components/portfolio/PortfolioResultPage"; // 결과 페이지 임포트 추가
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPage from "./pages/MyPage";
import SocialSignup from "./pages/SocialSignup";
import Evaluation from "./pages/Evaluation";
import CIAnalysisResult from "./pages/CIAnalysisResult";
import Resume from "./pages/Resume";
import RsResume from "./pages/RsResume";

// 결제
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";
import PaymentFail from "./pages/payment/PaymentFail";

// 토큰 만료 시 자동 로그아웃
axios.interceptors.response.use(
  (response) => { return response; },
  (error) => {
    const originalRequestUrl = error.config?.url || "";
    
    if (error.response && error.response.status === 401) {

      if (originalRequestUrl.includes("/login")) {
        return Promise.reject(error);
      }

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      window.dispatchEvent(new CustomEvent("tokenExpired"));    
    }
    return Promise.reject(error);
  }
);

function App() {

  const [showExpiredModal, setShowExpiredModal] = useState(false);

    useEffect(() => {
      const handleTokenExpired = () => {
        setShowExpiredModal(true);
        
        setTimeout(() => {
          setShowExpiredModal(false);
          window.location.href = "/"; 
        }, 3000);
      };

      window.addEventListener("tokenExpired", handleTokenExpired);
      return () => window.removeEventListener("tokenExpired", handleTokenExpired);
    }, []);

  return (
    <>
      {showExpiredModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] px-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center scale-in-center">
            
            {/* 시계/시간 만료 느낌의 아이콘 */}
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">로그인 시간이 만료되었습니다</h3>
            <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">
              정보 보호를 위해 자동으로 로그아웃 되었습니다.<br/>
              잠시 후 메인 페이지로 이동합니다.
            </p>
            
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* 자기소개서 분석 결과 */}
          <Route
            path="/analysis/result/:analysisId"
            element={<CIAnalysisResult />}
          />

          {/* 면접 관련 라우트 */}
          <Route path="/interview/select" element={<InterviewSelect />} />
          <Route path="/interview/session" element={<InterviewSession />} />
          <Route path="/interview/result" element={<Evaluation />} />

          {/* 포트폴리오 관련 라우트 */}
          <Route
            path="/portfolio/result/:analysisId"
            element={<PortfolioResultPage />}
          />

          {/* 이력서 관련 라우트 */}
          <Route path="/resume" element={<Resume />} />
          <Route path="/resume/result/:analysisId" element={<RsResume />} />

          {/* 로그인 관련 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 소셜 로그인 관련 라우트 */}
          <Route path="/social-signup" element={<SocialSignup />} />

          {/* 마이페이지 라우트 */}
          <Route path="/mypage" element={<MyPage />} />

          {/* 결제 라우트 */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
