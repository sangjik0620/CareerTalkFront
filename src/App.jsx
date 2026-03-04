import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 페이지 및 컴포넌트 임포트
import Home from "./pages/Home";
import InterviewSession from "./pages/interview/InterviewSession";
import InterviewSelect from "./pages/interview/InterviewSelect"; // 이름을 InterviewSelect로 수정
import PortfolioResultPage from "./components/portfolio/PortfolioResultPage"; // 결과 페이지 임포트 추가
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SocialSignup from "./pages/SocialSignup";
import Evaluation from "./pages/Evaluation";
import CIAnalysis from "./pages/ClAnalysis";
import CIAnalysisResult from "./pages/CIAnalysisResult";
import Resume from "./pages/Resume";
import RsResume from "./pages/RsResume";

function App() {
  return (
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
