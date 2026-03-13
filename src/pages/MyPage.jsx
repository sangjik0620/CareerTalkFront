import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getQuota } from "../lib/api/paymentApi";

const MyPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [quota, setQuota] = useState(null);

  const [originalData, setOriginalData] = useState({
    name: "",
    nickname: "",
    email: "",
    targetJob: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    targetJob: "",
  });

  const [isNicknameVerified, setIsNicknameVerified] = useState(true);
  const [nicknameMsg, setNicknameMsg] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [mainTab, setMainTab] = useState("analysis");
  const [subTab, setSubTab] = useState("포트폴리오"); // 기본 탭을 포트폴리오로 두면 테스트하기 편합니다.

  const [analysesData, setAnalysesData] = useState({
    이력서: [],
    자기소개서: [],
    포트폴리오: [],
  });
  const [interviewsData, setInterviewsData] = useState([]);

  useEffect(() => {
    const fetchAllMyData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [userRes, analysisRes, interviewRes, quotaRes] =
          await Promise.all([
            axios.get("http://localhost:8080/api/member/me", config),
            axios
              .get("http://localhost:8080/api/analysis/my", config)
              .catch(() => ({ data: null })),
            axios
              .get("http://localhost:8080/api/interview/my", config)
              .catch(() => ({ data: null })),
            getQuota().catch(() => null),
          ]);

        setUser(userRes.data);
        setFormData(userRes.data);
        setOriginalData(userRes.data);

        if (analysisRes.data) {
          setAnalysesData({
            이력서: analysisRes.data.resume || [],
            자기소개서: analysisRes.data.coverLetter || [],
            포트폴리오: analysisRes.data.portfolio || [],
          });
        }

        if (interviewRes.data) {
          setInterviewsData(interviewRes.data);
        }

        if (quotaRes) {
          setQuota(quotaRes);
        } else {
          setQuota({
            freeAnalysisRemaining: 0,
            freeMockRemaining: 0,
            paidAnalysisRemaining: 0,
            paidMockRemaining: 0,
          });
        }
      } catch (error) {
        console.error("마이페이지 데이터 로드 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMyData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "nickname") {
      if (value === originalData.nickname) {
        setIsNicknameVerified(true);
        setNicknameMsg("");
      } else {
        setIsNicknameVerified(false);
        setNicknameMsg("");
      }
    }
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      setNicknameMsg("닉네임을 입력해주세요.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8080/api/member/check-nickname?nickname=${formData.nickname}`,
      );
      if (response.data === true) {
        setNicknameMsg("이미 사용 중인 닉네임입니다.");
        setIsNicknameVerified(false);
      } else {
        setNicknameMsg("사용 가능한 닉네임입니다.");
        setIsNicknameVerified(true);
      }
    } catch (error) {
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleUpdate = async () => {
    if (!isNicknameVerified) {
      setErrorMsg("닉네임 중복확인을 완료해주세요.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      await axios.post("http://localhost:8080/api/member/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(formData);
      setOriginalData(formData);
      setEditMode(false);
      setErrorMsg("");

      const currentUserStr = sessionStorage.getItem("user");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        sessionStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, ...formData }),
        );
      }
    } catch (error) {
      setErrorMsg(error.response?.data || "수정 중 오류가 발생했습니다.");
    }
  };

  const handleWithdrawal = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/member/delete/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setShowAlert(true);
      sessionStorage.clear();

      setTimeout(() => {
        window.location.href = "/";
      }, 4000);
    } catch (error) {
      console.error("탈퇴 실패:", error);
      alert(
        "탈퇴 처리 중 오류가 발생했습니다: " +
          (error.response?.data || "서버 에러"),
      );
    }
  };

  const handleResultClick = (id, category) => {
    if (category === "analysis") {
      if (subTab === "이력서") {
        navigate(`/resume/result/${id}`);
      } else if (subTab === "자기소개서") {
        navigate(`/analysis/result/${id}`);
      } else if (subTab === "포트폴리오") {
        navigate(`/portfolio/result/${id}`);
      }
    } else if (category === "interview") {
      navigate(`/interview/result/${id}`);
    }
  };

  // 개별 분석 기록 삭제 로직
  const handleDeleteAnalysis = async (id) => {
    if (
      !window.confirm(
        `정말 이 ${subTab} 분석 기록을 삭제하시겠습니까?\n(원본 파일도 함께 영구 삭제됩니다)`,
      )
    ) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      let apiUrl = "";

      // 현재는 포트폴리오 API만 연결되어 있으므로 분기 처리
      if (subTab === "포트폴리오") {
        apiUrl = `http://localhost:8080/api/portfolios/${id}`;
      } else if (subTab === "이력서") {
        apiUrl = `http://localhost:8080/api/resumes/${id}`;
        // if (subTab === "자기소개서") apiUrl = `http://localhost:8080/api/cover-letters/${id}`;
      }

      // 백엔드 삭제 API 호출
      await axios.delete(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 화면에서 즉시 삭제된 데이터 제거 (새로고침 불필요)
      setAnalysesData((prev) => ({
        ...prev,
        [subTab]: prev[subTab].filter((item) => item.id !== id),
      }));

      alert("성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleInterviewDelete = async (id) => {
    const ok = window.confirm(
      "이 면접 기록을 삭제할까요?\n삭제 후에는 복구할 수 없습니다.",
    );
    if (!ok) return;

    try {
      const token = sessionStorage.getItem("token");

      await axios.delete(`http://localhost:8080/api/interview/sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInterviewsData((prev) => prev.filter((item) => item.id !== id));
      alert("면접 기록이 삭제되었습니다.");
    } catch (error) {
      console.error("면접 기록 삭제 실패", error);
      alert(
        error.response?.data?.message ||
          "면접 기록 삭제 중 오류가 발생했습니다.",
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20">데이터를 불러오는 중입니다...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-20">로그인이 필요한 페이지입니다.</div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden pt-28 pb-12 px-4 font-sans"
      style={{
        background:
          "linear-gradient(135deg, #f0f2ff 0%, #eaf0ff 50%, #f5f0ff 100%)",
      }}
    >
      <div
        className="absolute top-[-120px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,120,247,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,100,247,0.10) 0%, transparent 70%)",
        }}
      />

      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 z-20"
        style={{
          background: "rgba(255,255,255,0.9)",
          color: "#4B5672",
          border: "1px solid rgba(99,120,247,0.14)",
          boxShadow: "0 4px 14px rgba(99,120,247,0.08)",
        }}
      >
        <span className="text-base">←</span>
        홈으로 돌아가기
      </button>

      <div className="relative z-10 max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 text-center flex-1 ml-10">
            마이페이지
          </h2>
          <button
            onClick={() => {
              if (editMode) handleUpdate();
              else setEditMode(true);
            }}
            disabled={editMode && !isNicknameVerified}
            className={`px-5 py-2 rounded-xl font-bold transition-all ${
              !editMode
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : isNicknameVerified
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {editMode ? "변경사항 저장" : "정보 수정"}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-10 mb-10 border border-gray-100 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                이름
              </p>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full text-lg font-semibold bg-transparent border-b-2 py-1 transition-all outline-none ${
                  editMode
                    ? "border-blue-500 text-gray-800"
                    : "border-transparent text-gray-800"
                }`}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                닉네임
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`flex-1 text-lg font-semibold bg-transparent border-b-2 py-1 transition-all outline-none text-gray-800 ${
                    editMode
                      ? isNicknameVerified
                        ? "border-green-500"
                        : "border-blue-500"
                      : "border-transparent"
                  }`}
                />
                {editMode && (
                  <button
                    onClick={handleNicknameCheck}
                    disabled={isNicknameVerified}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${
                      isNicknameVerified
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-800 hover:bg-gray-700 shadow-sm active:scale-95"
                    }`}
                  >
                    {isNicknameVerified ? "확인완료" : "중복확인"}
                  </button>
                )}
              </div>
              {editMode && nicknameMsg && (
                <p
                  className={`text-sm font-bold mt-2 animate-in fade-in ${
                    isNicknameVerified ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {nicknameMsg}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
            <div className="flex flex-col">
              <p className="h-5 flex items-end text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest whitespace-nowrap">
                이메일 (변경 불가)
              </p>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full text-lg font-semibold bg-transparent text-gray-800 outline-none py-1 border-b-2 border-transparent cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <p className="h-5 flex items-end text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest whitespace-nowrap">
                목표 직무
              </p>
              <input
                type="text"
                value={user.targetJob || "미설정"}
                disabled
                className="w-full text-lg font-semibold bg-transparent text-gray-800 outline-none py-1 border-b-2 border-transparent cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-2xl font-semibold text-gray-900">
              이용권 현황
            </h3>
            <button
              onClick={() => navigate("/payment")}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all shadow-sm active:scale-95"
            >
              이용권 구매하러 가기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <QuotaCard
              title="무료 분석권"
              value={`${quota?.freeAnalysisRemaining ?? 0}회`}
              desc="회원 기본 제공"
              color="blue"
              icon="📄"
            />
            <QuotaCard
              title="무료 모의면접권"
              value={`${quota?.freeMockRemaining ?? 0}회`}
              desc="회원 기본 제공"
              color="purple"
              icon="🎤"
            />
            <QuotaCard
              title="유료 분석권"
              value={`${quota?.paidAnalysisRemaining ?? 0}회`}
              desc="구매 이용권"
              color="emerald"
              icon="💳"
            />
            <QuotaCard
              title="유료 모의면접권"
              value={`${quota?.paidMockRemaining ?? 0}회`}
              desc="구매 이용권"
              color="amber"
              icon="🚀"
            />
          </div>
        </div>

        <div className="flex border-b-2 border-gray-100 mb-10 mt-12">
          <button
            onClick={() => setMainTab("analysis")}
            className={`flex-1 py-4 text-lg font-black flex items-center justify-center gap-2 transition-colors relative ${
              mainTab === "analysis"
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">분석 결과</span>
            {mainTab === "analysis" && (
              <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
            )}
          </button>

          <button
            onClick={() => setMainTab("interview")}
            className={`flex-1 py-4 text-lg font-black flex items-center justify-center gap-2 transition-colors relative ${
              mainTab === "interview"
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">면접 기록</span>
            {mainTab === "interview" && (
              <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        </div>

        <div className="min-h-[300px] mb-12">
          {mainTab === "analysis" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-left">
                분석 결과 조회
              </h3>

              <div className="flex gap-3 mb-8">
                {["이력서", "자기소개서", "포트폴리오"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSubTab(tab)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                      subTab === tab
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysesData[subTab] && analysesData[subTab].length > 0 ? (
                  analysesData[subTab].map((item) => (
                    <ResultCard
                      key={item.id}
                      badge={subTab}
                      badgeClass="bg-blue-50 text-blue-600"
                      date={item.date}
                      title={item.title}
                      score={item.score}
                      onClick={() => handleResultClick(item.id, "analysis")}
                      onDelete={() => handleDeleteAnalysis(item.id)} // 💡 삭제 프롭스 전달
                      buttonClass="group-hover:bg-blue-600 group-hover:text-white"
                    />
                  ))
                ) : (
                  <EmptyState text={`아직 분석된 ${subTab}가 없습니다.`} />
                )}
              </div>
            </div>
          )}

          {mainTab === "interview" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-left">
                면접 기록 조회
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviewsData && interviewsData.length > 0 ? (
                  interviewsData.map((item) => (
                    <ResultCard
                      key={item.id}
                      badge={item.type || "면접"}
                      badgeClass="bg-purple-50 text-purple-600"
                      date={item.date}
                      title={item.title}
                      duration={item.duration}
                      interview
                      onClick={() => handleResultClick(item.id, "interview")}
                      onDelete={() => handleInterviewDelete(item.id)}
                      buttonClass="group-hover:bg-purple-600 group-hover:text-white"
                    />
                  ))
                ) : (
                  <EmptyState text="아직 면접 기록이 없습니다." />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-red-50 p-6 rounded-2xl border border-red-100">
            <div>
              <h3 className="text-red-800 font-bold text-lg mb-1">
                서비스 탈퇴
              </h3>
              <p className="text-red-600/80 text-sm font-medium">
                탈퇴 시 모든 활동 데이터가 삭제됩니다.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200 active:scale-95"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-[400px] w-full shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              계정을 삭제하시겠습니까?
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              탈퇴 시{" "}
              <strong className="text-gray-700 font-semibold">
                모든 면접 기록과 분석 리포트
              </strong>
              가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
              <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                <li>모든 활동 데이터 즉시 파기</li>
                <li>재가입 시 기존 데이터 복구 불가</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                취소
              </button>
              <button
                onClick={handleWithdrawal}
                className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm shadow-sm"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-6">
          <div className="bg-gray-900 text-white p-6 rounded-[2rem] text-center shadow-2xl">
            <h4 className="text-xl font-bold">탈퇴가 완료되었습니다</h4>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              잠시 후 메인 화면으로 이동합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ResultCard 컴포넌트에 삭제 버튼 UI 추가
function ResultCard({
  badge,
  badgeClass,
  date,
  title,
  score,
  duration,
  onClick,
  buttonClass,
  interview = false,
  onDelete, // 삭제 핸들러 Props 추가
}) {
  return (
    // relative 속성을 주어 우측 상단 삭제 버튼 위치 기준점을 잡아줍니다.
    <div
      className="relative group border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all bg-white cursor-pointer"
      onClick={onClick}
    >
      {/* 삭제 버튼 로직 (onDelete가 전달되었을 때만 렌더링) */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // 카드 전체 클릭을 막아줌
            onDelete();
          }}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
          title="삭제하기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      <div className="flex justify-between items-center mb-4 pr-8">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-lg ${badgeClass}`}
        >
          {badge}
        </span>
        <span className="text-xs text-gray-400 font-medium">{date}</span>
      </div>

      <h4 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">
        {title}
      </h4>

      <div className="flex justify-between items-end mt-auto">
        <div>
          <p className="text-xs text-gray-400 font-bold mb-1">
            {interview ? "진행 시간" : "AI 종합 점수"}
          </p>
          {interview ? (
            <p className="text-xl font-bold text-gray-700">{duration}</p>
          ) : (
            <p className="text-2xl font-black text-gray-900">
              {score}
              <span className="text-sm font-medium text-gray-500 ml-1">점</span>
            </p>
          )}
        </div>

        <button
          className={`px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold transition-colors ${buttonClass}`}
        >
          {interview ? "기록 보기" : "결과 보기"}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="col-span-2 py-16 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
      <p className="text-gray-400 font-semibold">{text}</p>
    </div>
  );
}

function QuotaCard({ title, value, desc, color, icon }) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      titleText: "text-blue-700",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      titleText: "text-purple-700",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      titleText: "text-emerald-700",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      titleText: "text-amber-700",
    },
  };

  const styles = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-2xl p-5 transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${styles.iconBg}`}
        >
          <span className={`text-xl ${styles.iconText}`}>{icon}</span>
        </div>
      </div>

      <p className={`text-sm font-bold mb-2 ${styles.titleText}`}>{title}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-2 font-medium">{desc}</p>
    </div>
  );
}

export default MyPage;
