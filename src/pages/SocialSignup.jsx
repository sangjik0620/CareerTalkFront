import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const SocialSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        loginId: '',
        email: '',
        name: '',
        phone: '',
        birthDate: '',
        nickname: '',
        targetJob: ''
    });

    const [nicknameMessage, setNicknameMessage] = useState('');
    const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const isFormValid = 
        formData.name.trim() !== '' &&        // 카카오 유저는 직접 입력
        formData.phone.length >= 12 &&       
        formData.birthDate !== '' &&          
        isNicknameAvailable &&                
        formData.targetJob !== '';          

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setFormData(prev => ({
            ...prev,
            email: params.get('email') || '',
            name: params.get('name') || '',
            phone: params.get('phone') || '',
            birthDate: params.get('birthDate') || '',
            loginId: params.get('loginId') || ''
        }));
    }, [location]);

    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/[^\d]/g, '');
        if (phoneNumber.length < 4) return phoneNumber;
        if (phoneNumber.length < 8) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'phone') {
            // 전화번호 입력 시 하이픈 자동 적용
            setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (name === 'nickname') {
            setIsNicknameAvailable(false);
            setNicknameMessage('');
        }
    };

    const checkNickname = async () => {
        if (!formData.nickname.trim()) {
            setNicknameMessage("닉네임을 입력해주세요.");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/api/member/check-nickname?nickname=${formData.nickname}`);
            if (response.data === true) {
                setNicknameMessage("이미 존재하는 닉네임입니다.");
                setIsNicknameAvailable(false);
            } else {
                setNicknameMessage("사용 가능한 닉네임입니다.");
                setIsNicknameAvailable(true);
            }
        } catch (error) {
            alert("중복 확인 중 오류가 발생했습니다.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isNicknameAvailable || !formData.targetJob) {
            alert("모든 필수 정보를 입력하고 닉네임 중복 확인을 해주세요.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/member/social-signup-complete', formData);
            sessionStorage.setItem('token', response.data.accessToken); 
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
            
            setShowWelcomeModal(true);
            setTimeout(() => {
                setShowWelcomeModal(false);
                window.location.href = "/";
            }, 3000);

        } catch (error) {
            alert(error.response?.data || "정보 등록 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 font-sans">
            {showWelcomeModal && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4">
                    <div className="bg-white border-2 border-blue-500 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center text-center animate-in fade-in slide-in-from-top-10 duration-500">
                        <h3 className="text-xl font-black text-gray-900 mb-2">가입을 축하합니다!</h3>
                        <p className="text-gray-600 font-medium text-sm leading-relaxed">
                            이제 CareerTalk의 모든 기능을 이용하실 수 있습니다!<br/>
                            <span className="text-blue-500 text-xs mt-2 block">3초 후 메인 페이지로 이동합니다.</span>
                        </p>
                    </div>
                </div>
            )}
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-semibold group"
            >
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                <span>홈으로 이동</span>
            </Link>

            <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">마지막 단계</h2>
                    <p className="text-gray-500 font-medium">CareerTalk에서 사용할 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                   <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">이메일</label>
                        <input type="text" value={formData.email} disabled className="w-full px-4 py-3 rounded-lg border bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
                    </div>

                    {/* 이름 입력 섹션 (구글/카카오 유저는 직접 입력) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            이름 (실명)
                        </label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange}
                            placeholder="정확한 실명을 입력하세요"
                            disabled={!!new URLSearchParams(location.search).get('name')} 
                            className={`w-full px-4 py-3 rounded-lg border outline-none transition 
                                ${!!new URLSearchParams(location.search).get('name') 
                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' 
                                    : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                }`}
                            required
                        />
                        {!new URLSearchParams(location.search).get('name') && (
                            <p className="text-xs text-blue-500 mt-1.5 ml-1 font-medium">
                                * 원활한 서비스 이용을 위해 반드시 실명을 입력해주세요.
                            </p>
                        )}
                    </div>

                    {/* 전화번호 입력 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">전화번호</label>
                        <input 
                            type="text" name="phone" value={formData.phone} onChange={handleChange}
                            placeholder="010-0000-0000" maxLength="13"
                            disabled={!!new URLSearchParams(location.search).get('phone')}
                            className={`w-full px-4 py-3 rounded-lg border outline-none transition ${!!new URLSearchParams(location.search).get('phone') ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500'}`}
                            required
                        />
                    </div>

                    {/* 생년월일 입력 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">생년월일</label>
                        <input 
                            type="date" name="birthDate" value={formData.birthDate} onChange={handleChange}
                            disabled={!!new URLSearchParams(location.search).get('birthDate')}
                            className={`w-full px-4 py-3 rounded-lg border outline-none transition ${!!new URLSearchParams(location.search).get('birthDate') ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500'}`}
                            required
                        />
                    </div>

                    {/* 닉네임 입력 (중복 확인 필수) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">닉네임</label>
                        <div className="flex gap-2.5">
                            <input 
                                type="text" name="nickname" value={formData.nickname} onChange={handleChange}
                                placeholder="사용할 닉네임"
                                className={`flex-1 px-4 py-3 rounded-lg border outline-none transition ${isNicknameAvailable ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                                required 
                            />
                            <button type="button" onClick={checkNickname} className="px-6 py-3 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition">중복확인</button>
                        </div>
                        {nicknameMessage && <p className={`text-xs mt-1.5 ml-1 ${isNicknameAvailable ? 'text-green-600' : 'text-red-500 font-medium'}`}>{nicknameMessage}</p>}
                    </div>

                    {/* 목표 직무 선택 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">목표 직무</label>
                        <select 
                            name="targetJob" value={formData.targetJob} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white transition cursor-pointer font-medium"
                            required
                        >
                            <option value="">직무를 선택하세요</option>
                            <option value="IT개발∙데이터">IT개발∙데이터</option>
                            <option value="기획∙전략">기획∙전략</option>
                            <option value="디자인">디자인</option>
                            <option value="마케팅∙홍보">마케팅∙홍보</option>
                            <option value="인사∙노무">인사∙노무</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!isFormValid}
                        className={`w-full py-4 rounded-lg font-bold text-lg shadow-md transition mt-6 text-white 
                            ${!isFormValid ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
                    >
                        가입 완료
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SocialSignup;