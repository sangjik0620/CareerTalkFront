export default function PaymentFail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">결제에 실패했습니다</h1>
        <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
      </div>
    </div>
  );
}