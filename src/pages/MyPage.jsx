import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const MyPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [showModal, setShowModal] = useState(false); // 탈퇴 확인 모달 상태
    const [showAlert, setShowAlert] = useState(false); // 탈퇴 완료 알림 상태

    // 회원 탈퇴 처리 함수
    const handleWithdrawal = async () => {
        try {
            // 백엔드 삭제 API 호출
            await axios.delete(`http://localhost:8080/api/member/delete/${user.email}`);
            
            setShowModal(false); // 모달 닫기
            setShowAlert(true);  // 커스텀 알림창 띄우기
            
            // 로컬 스토리지 비우기 (로그아웃)
            localStorage.removeItem('user');

            // 4초 후 메인페이지로 이동
            setTimeout(() => {
                setShowAlert(false);
                window.location.href = "/"; // 메인으로 이동하며 새로고침
            }, 4000);

        } catch (error) {
            console.error(error);
            alert("탈퇴 처리 중 오류가 발생했습니다.");
        }
    };

    if (!user) return <div className="text-center mt-20 font-bold text-gray-400">로그인이 필요합니다.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 font-sans">
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-semibold group"
            >
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                <span>홈으로 이동</span>
            </Link>
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">마이페이지</h2>
                
                {/* 사용자 정보 섹션 */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-10 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">이메일</p>
                            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">닉네임</p>
                            <p className="text-lg font-semibold text-gray-800">{user.nickname}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">목표 직무</p>
                            {/* ⭐ DB에서 한글로 불러온 데이터를 그대로 출력 */}
                            <p className="text-lg font-bold text-blue-600">{user.targetJob || "미설정"}</p>
                        </div>
                    </div>
                </div>

                {/* 위험 구역: 회원 탈퇴 */}
                <div className="border-t border-gray-100 pt-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-red-50 p-6 rounded-2xl border border-red-100">
                        <div>
                            <h3 className="text-red-800 font-bold text-lg mb-1">서비스 탈퇴</h3>
                            <p className="text-red-600/80 text-sm font-medium">탈퇴 시 모든 활동 데이터가 삭제됩니다.</p>
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

            {/* ⭐ 회원 탈퇴 유의사항 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-pulse">
                                ⚠️
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
                            <p className="text-gray-500 font-medium">아래 유의사항을 반드시 확인해주세요.</p>
                        </div>

                        <ul className="text-sm text-gray-600 space-y-4 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <li className="flex gap-3 items-start">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>계정에 저장된 <b>모든 분석 데이터와 정보</b>가 즉시 영구 삭제됩니다.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>탈퇴 후에는 동일한 이메일로 재가입해도 <b>기존 데이터를 복구할 수 없습니다.</b></span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>작성 중이었거나 완료된 <b>모든 면접 피드백</b>이 소멸됩니다.</span>
                            </li>
                        </ul>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition active:scale-95"
                            >
                                취소
                            </button>
                            <button 
                                onClick={handleWithdrawal} 
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 active:scale-95"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ⭐ 4초 자동 닫힘 알림창 (Toast) */} 
            {/* ⭐ 세련된 커스텀 알림창 (Toast) */}
            {showAlert && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-gray-900/90 backdrop-blur-2xl text-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col items-center text-center gap-3">
                        {/* 체크 아이콘 애니메이션 */}
                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-2xl mb-1 ring-8 ring-green-500/5">
                            ✓
                        </div>
                        
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold tracking-tight">탈퇴가 완료되었습니다</h4>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                그동안 CareerTalk과 함께해주셔서 감사합니다.<br/>
                                잠시 후 메인 화면으로 이동합니다.
                            </p>
                        </div>

                        {/* 하단 프로그레스 바 (4초 흐름 시각화) */}
                        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-500 animate-progress-shrink origin-left"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPage;