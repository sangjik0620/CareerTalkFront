import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans py-12 px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
                    <p className="text-gray-500 text-sm">CareerTalk의 모든 서비스를 시작해보세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 아이디 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">아이디</label>
                        <input 
                            type="text" 
                            name="loginId" 
                            value={formData.loginId} 
                            onChange={handleChange} 
                            placeholder="로그인에 사용할 아이디를 입력하세요" 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" 
                            required 
                        />
                    </div>
                    {/* 이메일 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">이메일</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} placeholder="example@mail.com" className={`w-full px-4 py-2.5 rounded-lg border outline-none transition ${emailError ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} required />
                        {emailError && <p className="text-red-500 text-xs mt-1">올바른 이메일 형식이 아닙니다.</p>}
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">비밀번호</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handlePwBlur} placeholder="8자 이상 영문, 숫자, 특수문자 조합" className={`w-full px-4 py-2.5 rounded-lg border outline-none transition ${pwError ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} required />
                        {pwError && <p className="text-red-500 text-xs mt-1">8자 이상 영문, 숫자, 특수문자를 조합해주세요.</p>}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">비밀번호 확인</label>
                        <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} placeholder="비밀번호를 한 번 더 입력하세요" className={`w-full px-4 py-2.5 rounded-lg border outline-none transition ${formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} required />
                    </div>

                    {/* 이름 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">이름</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="실명을 입력하세요" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                    </div>

                    {/* 닉네임 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">닉네임</label>
                        <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="사용하실 닉네임을 입력하세요" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                    </div>

                    {/* 휴대폰 번호 (자동 하이픈 적용) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">휴대폰 번호</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            maxLength="13" // 하이픈 포함 최대 길이
                            placeholder="010-0000-0000" 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" 
                            required 
                        />
                    </div>

                    {/* 생년월일 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">생년월일</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition bg-white" required />
                    </div>

                    {/* 목표 직무 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">목표 직무</label>
                        <select name="targetJob" value={formData.targetJob} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white transition" required>
                            <option value="">직무를 선택하세요</option>
                            <option value="frontend">프론트엔드 개발자</option>
                            <option value="backend">백엔드 개발자</option>
                            <option value="design">UI/UX 디자이너</option>
                            <option value="marketing">마케팅</option>
                            <option value="planner">기획자</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-md transition mt-4">
                        가입 완료
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        이미 계정이 있으신가요? <a href="/login" className="text-blue-600 font-bold hover:underline ml-1">로그인</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;