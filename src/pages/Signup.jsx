import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        loginId: '',
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
        nickname: '',
        phone: '',
        birthDate: '', 
        targetJob: ''
    });

    const [emailError, setEmailError] = useState(false);
    const [pwError, setPwError] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showSentModal, setShowSentModal] = useState(false); 

    const [timer, setTimer] = useState(0); 
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatPhoneNumber = (value) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, ''); // 숫자만 남기기
        const phoneNumberLength = phoneNumber.length;

        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 8) {
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
        }
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            setFormData({ ...formData, [name]: formatPhoneNumber(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (name === 'email' && value.includes('@')) setEmailError(false);
        if (name === 'password') {
            const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*?_]).{8,}$/;
            if (pwRegex.test(value)) setPwError(false);
        }
    };

    const handleEmailBlur = () => {
        if (formData.email && !formData.email.includes('@')) setEmailError(true);
        else setEmailError(false);
    };

    const handlePwBlur = () => {
        const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*?_]).{8,}$/;
        if (formData.password && !pwRegex.test(formData.password)) setPwError(true);
        else setPwError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (emailError || pwError) {
            alert("입력 형식을 다시 확인해주세요.");
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const { passwordConfirm, ...submitData } = formData;
            const response = await axios.post('http://localhost:8080/api/member/signup', submitData);

            // alert("회원가입이 완료되었습니다!"); 
            setShowWelcomeModal(true);
            setTimeout(() => {
                setShowWelcomeModal(false);
                navigate('/login');
            }, 3000);
            // navigate('/login');
        } catch (error) {
            alert(error.response?.data || '회원가입 정보가 올바르지 않습니다.');
        }
    };

    const [idMessage, setIdMessage] = useState(''); // 화면에 표시할 메시지
    const [isIdAvailable, setIsIdAvailable] = useState(false); // 사용 가능 여부 (색상 결정용)

    const checkIdDuplicate = async () => {
        if (!formData.loginId) {
            setIdMessage("아이디를 입력해주세요.");
            setIsIdAvailable(false);
            return;
        }
        
        try {
            const response = await axios.get(`http://localhost:8080/api/member/check-id?loginId=${formData.loginId}`);
            
            if (response.data === true) {
                setIdMessage("이미 사용 중인 아이디입니다.");
                setIsIdAvailable(false);
            } else {
                setIdMessage("사용 가능한 아이디입니다.");
                setIsIdAvailable(true);
            }
        } catch (error) {
            setIdMessage("중복 확인 중 오류가 발생했습니다.");
            setIsIdAvailable(false);
        }
    };

    const [nicknameMessage, setNicknameMessage] = useState(''); // 안내 메시지
    const [isNicknameAvailable, setIsNicknameAvailable] = useState(false); // 가입 가능 여부

    const checkNicknameDuplicate = async () => {
        if (!formData.nickname) {
            setNicknameMessage("닉네임을 입력해주세요.");
            setIsNicknameAvailable(false);
            return;
        }
        
        try {
            const response = await axios.get(`http://localhost:8080/api/member/check-nickname?nickname=${formData.nickname}`);
            
            if (response.data === true) {
                setNicknameMessage("이미 사용 중인 닉네임입니다.");
                setIsNicknameAvailable(false);
            } else {
                setNicknameMessage("사용 가능한 닉네임입니다.");
                setIsNicknameAvailable(true);
            }
        } catch (error) {
            setNicknameMessage("중복 확인 중 오류가 발생했습니다.");
            setIsNicknameAvailable(false);
        }
    };

    const [emailCode, setEmailCode] = useState(''); // 사용자가 입력한 인증번호
    const [isEmailSent, setIsEmailSent] = useState(false); // 메일 발송 여부
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 성공 여부

    // 1. 인증 메일 보내기
    const sendVerificationEmail = async () => {
        try {
            await axios.post(`http://localhost:8080/api/member/send-email?email=${formData.email}`);
            setIsEmailSent(true);
            setTimer(20);
            setShowSentModal(true);
            setTimeout(() => setShowSentModal(false), 3000);
        } catch (error) {
            // 409(중복)이거나, 500(서버에러-중복데이터때문)일 때 모달 띄우기
            if (error.response?.status === 409 || error.response?.status === 500) {
                setModalMessage("동일한 이메일의 계정이 존재합니다.");
                setShowDuplicateModal(true);
                setTimeout(() => setShowDuplicateModal(false), 3000);
            } else {
                alert(error.response?.data || "이메일 발송에 실패했습니다.");
            }
        }
    };

    // 2. 인증 번호 확인
    const verifyEmailCode = async () => {
    try {
        const response = await axios.post(`http://localhost:8080/api/member/verify-email`, null, {
            params: {
                email: formData.email,
                code: emailCode
            }
        });
        
        if (response.data) {
            setIsEmailVerified(true);
            // alert("인증에 성공했습니다.");
        } else {
            alert("인증 번호가 일치하지 않습니다.");
        }
    } catch (error) {
        alert("인증 확인 중 오류가 발생했습니다.");
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans py-12 px-4">

            {showSentModal && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-6 animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
                    <div className="bg-white/80 backdrop-blur-xl border border-blue-100 p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,126,255,0.15)] flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0 animate-bounce">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        
                        <div className="text-left">
                            <h4 className="text-gray-900 font-black text-lg leading-tight">메일 발송 완료!</h4>
                            <p className="text-gray-500 text-xs font-bold mt-0.5 italic">인증번호가 도착했습니다.</p>
                        </div>

                        <div className="ml-auto pr-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                        </div>
                    </div>
                </div>
            )}

            {showWelcomeModal && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4">
                    <div className="bg-white border-2 border-blue-500 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center text-center animate-in fade-in slide-in-from-top-10">
                        <h3 className="text-xl font-black text-gray-900 mb-2">가입을 축하합니다!</h3>
                        <p className="text-gray-600 font-medium text-sm leading-relaxed">
                            이제 CareerTalk의 모든 기능을 이용하실 수 있습니다!<br/>
                            <span className="text-blue-500 text-xs mt-2 block">3초 후 로그인 페이지로 이동합니다.</span>
                        </p>
                    </div>
                </div>
            )}

            {showDuplicateModal && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
                    <div className="bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-red-400">
                        <span className="text-xl">⚠️</span>
                        <span className="font-bold text-lg">{modalMessage}</span>
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
                    <p className="text-gray-500 text-sm font-medium">CareerTalk의 모든 서비스를 시작해보세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 아이디 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">아이디</label>
                        <div className="flex gap-2.5">
                            <input 
                                type="text" 
                                name="loginId" 
                                value={formData.loginId} 
                                onChange={(e) => {
                                    handleChange(e);
                                    setIdMessage('');
                                }}
                                placeholder="아이디를 입력하세요" 
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" 
                                required 
                            />
                            <button 
                                type="button"
                                onClick={checkIdDuplicate}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold whitespace-nowrap"
                            >
                                중복 확인
                            </button>
                        </div>
                        {idMessage && (
                            <p className={`text-xs mt-1.5 ml-1 ${isIdAvailable ? 'text-green-600' : 'text-red-500 font-medium'}`}>
                                {idMessage}
                            </p>
                        )}  
                    </div>

                    {/* 이메일 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">이메일</label>
                        <div className="flex gap-2.5">
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                onBlur={handleEmailBlur} 
                                placeholder="example@mail.com" 
                                className={`flex-1 px-4 py-3 rounded-lg border outline-none transition ${emailError ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'} ${isEmailVerified ? 'bg-gray-100' : ''}`} 
                                disabled={isEmailVerified}
                                required 
                            />
                            <button 
                                type="button"
                                onClick={sendVerificationEmail}
                                disabled={isEmailVerified || emailError || !formData.email || timer > 0}
                                className={`w-[110px] flex justify-center items-center py-3 rounded-lg transition text-sm font-bold whitespace-nowrap shadow-sm
                                    ${isEmailVerified 
                                        ? 'bg-green-500 text-white cursor-default' 
                                        : 'bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500'}`}
                            >
                                {isEmailVerified 
                                    ? "인증 완료" 
                                    : (timer > 0 ? `${timer}초` : (isEmailSent ? "재발송" : "인증 요청"))
                                }
                            </button>
                        </div>
                        {emailError && <p className="text-red-500 text-xs mt-1.5 ml-1">올바른 이메일 형식이 아닙니다.</p>}

                        {isEmailSent && !isEmailVerified && (
                            <div className="mt-2.5 flex gap-2.5 animate-fadeIn">
                                <input 
                                    type="text" 
                                    placeholder="인증번호 6자리 입력" 
                                    value={emailCode}
                                    onChange={(e) => setEmailCode(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                                <button 
                                    type="button"
                                    onClick={verifyEmailCode}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                                >
                                    확인
                                </button>
                            </div>
                        )}
                        {isEmailVerified && (
                            <p className="text-green-600 text-xs mt-1.5 ml-1 font-semibold">✓ 이메일 인증이 완료되었습니다.</p>
                        )}
                    </div>

                    {/* 비밀번호 섹션 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">비밀번호</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handlePwBlur} placeholder="8자 이상 영문, 숫자, 특수문자 조합" className={`w-full px-4 py-3 rounded-lg border outline-none transition ${pwError ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} required />
                        {pwError && <p className="text-red-500 text-xs mt-1.5 ml-1">8자 이상 영문, 숫자, 특수문자를 조합해주세요.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">비밀번호 확인</label>
                        <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} placeholder="비밀번호를 한 번 더 입력하세요" className={`w-full px-4 py-3 rounded-lg border outline-none transition ${formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} required />
                    </div>

                    {/* 이름 & 닉네임 */}
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">이름</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="실명을 입력하세요" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">닉네임</label>
                            <div className="flex gap-2.5">
                                <input 
                                    type="text" 
                                    name="nickname" 
                                    value={formData.nickname} 
                                    onChange={(e) => {
                                        handleChange(e);
                                        setNicknameMessage('');
                                        setIsNicknameAvailable(false);
                                    }}
                                    placeholder="사용하실 닉네임" 
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                                <button 
                                    type="button"
                                    onClick={checkNicknameDuplicate}
                                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold whitespace-nowrap"
                                >
                                    중복 확인
                                </button>
                            </div>
                            {nicknameMessage && (
                                <p className={`text-xs mt-1.5 ml-1 ${isNicknameAvailable ? 'text-green-600' : 'text-red-500 font-medium'}`}>
                                    {nicknameMessage}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 휴대폰 & 생년월일 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">휴대폰 번호</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength="13" placeholder="010-0000-0000" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">생년월일</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition bg-white" required />
                        </div>
                    </div>

                    {/* 목표 직무 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">목표 직무</label>
                        <select name="targetJob" value={formData.targetJob} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white transition" required>
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
                        disabled={!isIdAvailable || !isNicknameAvailable || !isEmailVerified}
                        className={`w-full py-4 rounded-lg font-bold text-white text-lg transition shadow-md mt-6
                                ${(!isIdAvailable || !isNicknameAvailable || !isEmailVerified) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'}`}
                    >
                        가입 완료
                    </button>
                </form>

                <div className="mt-10 text-center border-t border-gray-100 pt-8">
                    <p className="text-gray-600 text-sm font-medium">
                        이미 계정이 있으신가요? <a href="/login" className="text-blue-600 font-bold hover:underline ml-1">로그인</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;