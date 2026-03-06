import React, { useState } from 'react';
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

    // ⭐ 휴대폰 번호 자동 하이픈 포맷터 함수
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
            // ⭐ 휴대폰 번호일 경우 포맷팅 적용
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
            
            // 하이픈 제거: "010-1234-5678" -> "01012345678"
            submitData.phone = submitData.phone.replace(/-/g, '');

            const response = await axios.post('http://localhost:8080/api/member/signup', submitData);
            alert("회원가입이 완료되었습니다!"); 
            navigate('/login');
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
            alert("인증 코드가 발송되었습니다.");
        } catch (error) {
            alert("이메일 발송에 실패했습니다.");
        }
    };

    // 2. 인증 번호 확인
    const verifyEmailCode = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/api/member/verify-email?code=${emailCode}`);
            if (response.data) {
                setIsEmailVerified(true);
                alert("인증에 성공했습니다.");
            } else {
                alert("인증 번호가 일치하지 않습니다.");
            }
        } catch (error) {
            alert("인증 확인 중 오류가 발생했습니다.");
        }
    };

    // ... 상단 import 및 함수(formatPhoneNumber, handleChange 등) 로직은 동일 ...

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans py-12 px-4">
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
                                disabled={isEmailVerified || emailError || !formData.email}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold whitespace-nowrap disabled:bg-gray-400"
                            >
                                {isEmailSent ? "재발송" : "인증 요청"}
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

                    {/* 비밀번호 섹션 (비밀번호와 확인을 나란히 배치하고 싶다면 flex 가능하나, 안정감을 위해 수직 배치 유지 및 py 확장) */}
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
                            <option value="frontend">프론트엔드 개발자</option>
                            <option value="backend">백엔드 개발자</option>
                            <option value="design">UI/UX 디자이너</option>
                            <option value="marketing">마케팅</option>
                            <option value="planner">기획자</option>
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