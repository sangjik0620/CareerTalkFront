import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 페이지 및 컴포넌트 임포트
import Home from "./pages/Home";
import InAnalysis from "./pages/InAnalysis";
import PfAnalysis from "./pages/PfAnalysis";
import InterviewSession from "./pages/interview/InterviewSession";
import InterviewSelect from "./pages/interview/InterviewSelect"; // 이름을 InterviewSelect로 수정
import PortfolioResultPage from "./components/portfolio/PortfolioResultPage"; // 결과 페이지 임포트 추가
import Resume from "./pages/Resume";
import RsResume from "./pages/RsResume";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 면접 관련 라우트 */}
        <Route path="/interview/select" element={<InterviewSelect />} />
        <Route path="/interview/session" element={<InterviewSession />} />
        <Route path="/interview/result" element={<InAnalysis />} />

        {/* 포트폴리오 관련 라우트 */}
        <Route path="/portfolio" element={<PfAnalysis />} />
        <Route path="/portfolio/result" element={<PortfolioResultPage />} />

        {/* 이력서 관련 라우트 */}
        <Route path="/resume" element={<Resume />} />
        <Route path="/resume/result" element={<RsResume />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
