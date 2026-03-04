import React, { useEffect, useMemo, useState } from "react";
import "../css/Evaluation.css";
import { useLocation, useSearchParams } from "react-router-dom";
import { interviewApi } from "../lib/api/interviewApi";

import SummaryTab from "./evaluation/tabs/SummaryTab";
import DocumentTab from "./evaluation/tabs/DocumentTab";
import InterviewTab from "./evaluation/tabs/InterviewTab";
import ComparisonTab from "./evaluation/tabs/ComparisonTab";
import CompetencyTab from "./evaluation/tabs/CompetencyTab";

const Evaluation = ({ evaluationData }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [analysisStatus, setAnalysisStatus] = useState("PENDING"); // PENDING/PROCESSING/DONE/FAILED
  const [polling, setPolling] = useState(false);

  const [docLoading, setDocLoading] = useState(false);
  const [docErr, setDocErr] = useState("");
  const [docAnalysisMap, setDocAnalysisMap] = useState({});

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tabs = [
    { id: "summary", label: "요약", icon: "📌" },
    { id: "document", label: "문서", icon: "📄" },
    { id: "interview", label: "면접", icon: "🎤" },
    { id: "comparison", label: "비교", icon: "📊" },
    { id: "competency", label: "역량", icon: "🧭" },
  ];

  // 1) sessionId 확보
  const sessionId = useMemo(() => {
    const fromState = location?.state?.uploadResult?.sessionId;
    const fromQuery = searchParams.get("sessionId");
    return fromState ?? (fromQuery ? Number(fromQuery) : null);
  }, [location?.state, searchParams]);

  // 2) 분석 시작 + 폴링
  useEffect(() => {
    if (!sessionId) return;

    let alive = true;
    let timer = null;

    const startAndPoll = async () => {
      try {
        setErr("");
        setPolling(true);

        await interviewApi.startAnalysis(sessionId);

        const poll = async () => {
          const res = await interviewApi.getAnalysisStatus(sessionId);
          const st = res?.data?.status ?? "PENDING";

          if (!alive) return;

          setAnalysisStatus(st);

          if (st === "DONE") {
            setPolling(false);
            return;
          }
          if (st === "FAILED") {
            setPolling(false);
            setErr("분석에 실패했습니다.");
            return;
          }

          timer = window.setTimeout(poll, 1200);
        };

        await poll();
      } catch (e) {
        if (!alive) return;
        setPolling(false);
        setErr(e?.response?.data?.message ?? e?.message ?? "분석 요청 실패");
      }
    };

    startAndPoll();

    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [sessionId]);

  // 3) 결과 조회
  useEffect(() => {
    let alive = true;

    if (evaluationData) {
      setData(evaluationData);
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setLoading(false);
      setErr("sessionId가 없습니다. 업로드 후 이동하거나, ?sessionId= 로 접근하세요.");
      return;
    }

    if (analysisStatus !== "DONE") {
      setLoading(true);
      return;
    }

    setLoading(true);
    setErr("");

    interviewApi
      .getResult(sessionId)
      .then((res) => {
        if (!alive) return;
        setData(res?.evaluation ?? null);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "결과 조회 실패");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [sessionId, evaluationData, analysisStatus]);

  // 4) 문서탭 데이터 로드
  useEffect(() => {
    if (activeTab !== "document") return;
    if (!sessionId) return;

    let alive = true;
    setDocLoading(true);
    setDocErr("");

    (async () => {
      try {
        const targets = await interviewApi.getSessionTargets(sessionId);
        if (!alive) return;

        const analysisIds = (targets || []).map((t) => t.analysisId).filter(Boolean);

        if (!analysisIds.length) {
          setDocAnalysisMap({});
          return;
        }

        const analyses = await interviewApi.getAnalysesByIds(analysisIds);
        if (!alive) return;

        const map = {};
        (analyses || []).forEach((a) => {
          map[a.targetType] = a;
        });

        setDocAnalysisMap(map);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setDocErr("문서 분석 데이터를 불러오지 못했습니다.");
        setDocAnalysisMap({});
      } finally {
        if (alive) setDocLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeTab, sessionId]);

  // 5) 가드
  if (loading) {
    return (
      <div className="evaluation-container">
        {polling || analysisStatus !== "DONE"
          ? `분석 중... (상태: ${analysisStatus})`
          : "결과 불러오는 중..."}
      </div>
    );
  }
  if (err) return <div className="evaluation-container">에러: {err}</div>;
  if (!data) return <div className="evaluation-container">데이터 없음</div>;

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <h1>면접 평가 결과</h1>
        <button className="export-btn">📥 PDF 내보내기</button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content-wrapper">
        {activeTab === "summary" && <SummaryTab data={data} />}
        {activeTab === "document" && (
          <DocumentTab
            docLoading={docLoading}
            docErr={docErr}
            docAnalysisMap={docAnalysisMap}
          />
        )}
        {activeTab === "interview" && <InterviewTab data={data} />}
        {activeTab === "comparison" && <ComparisonTab data={data} />}
        {activeTab === "competency" && <CompetencyTab data={data} />}
      </div>
    </div>
  );
};

export default Evaluation;