import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InterviewSelect from "./pages/interview/InterviewSelect";
import InterviewSession from "./pages/interview/InterviewSession";
import InAnalysis from './pages/InAnalysis';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview/select" element={<InterviewSelect />} />
        <Route path="/interview/session" element={<InterviewSession />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
