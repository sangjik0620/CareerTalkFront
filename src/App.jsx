import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InterviewDocSelect from './pages/interview/InterviewDocSelect';
import InterviewScreen from './pages/interview/InterviewScreen';
import InAnalysis from './pages/InAnalysis';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview/select" element={<InterviewDocSelect />} />
        <Route path="/interview" element={<InterviewScreen />} />
        <Route path="/interview/result" element={<InAnalysis />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
