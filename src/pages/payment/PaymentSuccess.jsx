import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/mypage"), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">결제가 완료되었습니다</h1>
        <p className="text-gray-500">이용권이 정상적으로 지급되었어요. 잠시 후 마이페이지로 이동합니다.</p>
      </div>
    </div>
  );
}