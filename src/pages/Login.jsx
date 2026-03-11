import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
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
            const response = await axios.post('http://localhost:8080/api/member/login', {
                loginId: formData.loginId,
                password: formData.password
            });
            
            sessionStorage.setItem('token', response.data.accessToken);
            sessionStorage.setItem('user', JSON.stringify(response.data.user));

            window.location.href = "/";

        } catch (error) {
            alert(error.response?.data || "로그인에 실패했습니다.");
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleNaverLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/naver";
    };

    const handleKakaoLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');

        if (error === 'duplicate_email') {
            alert("이미 다른 소셜 계정으로 가입된 이메일 주소입니다.\n기존에 가입하셨던 소셜 계정으로 로그인해주세요.");
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center font-sans px-4"
            style={{ background: "linear-gradient(135deg, #f0f2ff 0%, #eaf0ff 50%, #f5f0ff 100%)" }}
        >
            {/* 배경 블롭 */}
            <div
                className="absolute top-[-120px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(99,120,247,0.12) 0%, transparent 70%)" }}
            />
            <div
                className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,100,247,0.10) 0%, transparent 70%)" }}
            />

            {/* 홈으로 돌아가기 버튼 */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-8 left-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 z-10"
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

            <div className="relative z-10 bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
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

                    <div className="mt-6 space-y-3">
                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-gray-200 w-full"></div>
                            <div className="absolute bg-white px-2 text-sm text-gray-400">또는</div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full h-[52px] flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 transition-all shadow-sm hover:brightness-95"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" className="w-5 h-5" />
                            구글로 시작하기
                        </button>

                        <button
                            type="button"
                            onClick={handleNaverLogin}
                            className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white py-3 rounded-lg font-semibold hover:bg-[#02b350] transition shadow-sm"
                        >
                            <span className="font-bold text-lg mr-1">N</span>
                            네이버로 시작하기
                        </button>

                        <button 
                            type="button"
                            onClick={handleKakaoLogin}
                            className="w-full h-[52px] rounded-lg overflow-hidden transition-all shadow-sm hover:brightness-90"
                        >
                            <img src="src/img/kakao.png" alt="카카오로 시작하기" className="w-full h-full object-cover" />
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        계정이 없으신가요?{' '}
                        <Link to="/signup" className="text-blue-600 font-bold hover:underline ml-1">
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;