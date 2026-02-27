import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        loginId: '', 
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/member/login', formData);
            if (response.status === 200) {
                alert(`${response.data.nickname}님 환영합니다!`);
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/');
            }
        } catch (error) {
            alert(error.response?.data || '아이디 또는 비밀번호를 확인해주세요.');
        }
    };

    // ⭐ 구글 로그인 시작 함수
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">로그인</h2>
                    <p className="text-gray-500">CareerTalk 서비스 이용을 위해 로그인해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
                        <input
                            type="text"
                            name="loginId"
                            value={formData.loginId}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                    >
                        로그인
                    </button>

                    {/* ⭐ 구글 로그인 버튼 섹션 추가 */}
                    <div className="mt-6 space-y-3">
                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-gray-200 w-full"></div>
                            <div className="absolute bg-white px-2 text-sm text-gray-400">또는</div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                        >
                            <img 
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                                alt="google" 
                                className="w-5 h-5" 
                            />
                            구글로 시작하기
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        계정이 없으신가요?{' '}
                        <a 
                            href="/signup" 
                            className="text-blue-600 font-bold hover:underline ml-1"
                        >
                            회원가입
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;