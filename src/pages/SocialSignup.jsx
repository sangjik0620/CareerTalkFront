import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const SocialSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. URL 파라미터나 세션에서 구글 정보를 가져오는 로직 (백엔드에서 보내준 방식에 따라 달라짐)
    const [formData, setFormData] = useState({
        loginId: '',   // 구글 고유 ID
        email: '',
        name: '',
        phone: '',
        birthDate: '',
        nickname: '',  // 추가 입력 필요
        targetJob: ''  // 추가 입력 필요
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 최종적으로 DB에 저장하는 API 호출
            const response = await axios.post('http://localhost:8080/api/member/social-signup-complete', formData);
            alert("회원가입이 완료되었습니다!");
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/');
        } catch (error) {
            alert(error.response?.data || "정보 등록 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">마지막 단계</h2>
                    <p className="text-gray-500">CareerTalk에서 사용할 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 구글에서 가져온 정보 (수정 불가) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-1">이메일</label>
                        <input type="text" value={formData.email} disabled className="w-full px-4 py-2.5 rounded-lg border bg-gray-100 outline-none" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-1">전화번호</label>
                        <input 
                            type="text" 
                            value={formData.phone} 
                            disabled 
                            className="w-full px-4 py-2.5 rounded-lg border bg-gray-100 outline-none text-gray-500" 
                        />
                    </div>

                    {/* 닉네임 (직접 입력) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">닉네임</label>
                        <input 
                            type="text" 
                            name="nickname" 
                            value={formData.nickname} 
                            onChange={handleChange} 
                            placeholder="사용할 닉네임을 입력하세요" 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition" 
                            required 
                        />
                    </div>

                    {/* 목표 직무 (직접 선택) */}
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
            </div>
        </div>
    );
};

export default SocialSignup;