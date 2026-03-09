import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const MyPage = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    
    const [originalData, setOriginalData] = useState({ name: '', nickname: '', email: '', targetJob: '' });
    const [formData, setFormData] = useState({ name: '', nickname: '', email: '', targetJob: '' });
    
    const [isNicknameVerified, setIsNicknameVerified] = useState(true);
    const [nicknameMsg, setNicknameMsg] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await axios.get('http://localhost:8080/api/member/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
                setFormData(response.data);
                setOriginalData(response.data);
            } catch (error) {
                console.error("정보 로드 실패", error);
            } finally {
                setLoading(false); 
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'nickname') {
            if (value === originalData.nickname) {
                setIsNicknameVerified(true);
                setNicknameMsg('');
            } else {
                setIsNicknameVerified(false);
                setNicknameMsg('');
            }
        }
    };

    const handleNicknameCheck = async () => {
        if (!formData.nickname.trim()) {
            setNicknameMsg("닉네임을 입력해주세요.");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/api/member/check-nickname?nickname=${formData.nickname}`);
            if (response.data === true) {
                setNicknameMsg('이미 사용 중인 닉네임입니다.');
                setIsNicknameVerified(false);
            } else {
                setNicknameMsg('사용 가능한 닉네임입니다.');
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
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/member/update', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(formData); 
            setOriginalData(formData);
            setEditMode(false);
            setErrorMsg('');
            alert("정보가 성공적으로 수정되었습니다.");
            
            const currentUserStr = localStorage.getItem('user');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...formData }));
            }
        } catch (error) {
            setErrorMsg(error.response?.data || "수정 중 오류가 발생했습니다.");
        }
    };

    // 🌟 탈퇴 실행 함수 (실제 요청이 날아가는 곳)
    const handleWithdrawal = async () => {
        console.log("탈퇴 요청 시작..."); // 디버깅용 로그
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/member/delete/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowModal(false);
            setShowAlert(true); 
            localStorage.clear(); 

            setTimeout(() => {
                window.location.href = "/"; 
            }, 4000);

        } catch (error) {
            console.error("탈퇴 실패:", error);
            alert("탈퇴 처리 중 오류가 발생했습니다: " + (error.response?.data || "서버 에러"));
        }
    };

    if (loading) return <div className="text-center mt-20">데이터를 불러오는 중입니다...</div>;
    if (!user) return <div className="text-center mt-20">로그인이 필요한 페이지입니다.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 font-sans">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 font-semibold group">
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                <span>홈으로 이동</span>
            </Link>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center flex-1 ml-10">마이페이지</h2>
                    <button 
                        onClick={() => { if(editMode) handleUpdate(); else setEditMode(true); }}
                        disabled={editMode && !isNicknameVerified}
                        className={`px-5 py-2 rounded-xl font-bold transition-all ${!editMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : (isNicknameVerified ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed')}`}
                    >
                        {editMode ? "변경사항 저장" : "정보 수정"}
                    </button>
                </div>
                
                {/* 정보 입력 영역 */}
                <div className="bg-gray-50 rounded-2xl p-10 mb-10 border border-gray-100 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">이름</p>
                            <input 
                                type="text" name="name" value={formData.name} 
                                onChange={handleChange}
                                disabled={!editMode}
                                className={`w-full text-lg font-semibold bg-transparent border-b-2 py-1 transition-all outline-none ${editMode ? 'border-blue-500 text-gray-800' : 'border-transparent text-gray-500'}`}
                            />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">닉네임</p>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="text" name="nickname" value={formData.nickname} 
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    className={`flex-1 text-lg font-semibold bg-transparent border-b-2 py-1 transition-all outline-none ${editMode ? (isNicknameVerified ? 'border-green-500 text-gray-800' : 'border-blue-500 text-gray-800') : 'border-transparent text-gray-500'}`}
                                />
                                {editMode && (
                                    <button 
                                        onClick={handleNicknameCheck}
                                        disabled={isNicknameVerified}
                                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${isNicknameVerified ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 shadow-sm active:scale-95'}`}
                                    >
                                        {isNicknameVerified ? '확인완료' : '중복확인'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">이메일 (변경 불가)</p>
                            <input type="email" value={formData.email} disabled className="w-full text-lg font-semibold bg-transparent text-gray-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">목표 직무</p>
                            <p className="text-lg font-bold text-blue-600 py-1">{user.targetJob || "미설정"}</p>
                        </div>
                    </div>
                </div>

                {/* 🌟 탈퇴 섹션 */}
                <div className="border-t border-gray-100 pt-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-red-50 p-6 rounded-2xl border border-red-100">
                        <div>
                            <h3 className="text-red-800 font-bold text-lg mb-1">서비스 탈퇴</h3>
                            <p className="text-red-600/80 text-sm font-medium">탈퇴 시 모든 활동 데이터가 삭제됩니다.</p>
                        </div>
                        <button 
                            onClick={() => setShowModal(true)} // 1. 모달 띄우기 버튼
                            className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200 active:scale-95"
                        >
                            회원 탈퇴
                        </button>
                    </div>
                </div>
            </div>

            {/* 🌟 2. 회원 탈퇴 유의사항 모달 (이 코드가 반드시 있어야 함!) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
                            <p className="text-gray-500 font-medium italic">탈퇴 시 모든 데이터가 즉시 삭제됩니다.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold">취소</button>
                            <button onClick={handleWithdrawal} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700">탈퇴확인</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 탈퇴 완료 알림창 */}
            {showAlert && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-6">
                    <div className="bg-gray-900 text-white p-6 rounded-[2rem] text-center shadow-2xl">
                        <h4 className="text-xl font-bold">탈퇴가 완료되었습니다</h4>
                        <p className="text-gray-400 text-sm mt-2 font-medium">잠시 후 메인 화면으로 이동합니다.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPage;