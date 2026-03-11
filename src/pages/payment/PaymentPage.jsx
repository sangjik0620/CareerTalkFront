import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getQuota, readyKakaoPay } from "../../lib/api/paymentApi";

// ── 아이콘 ───────────────────────────────────────────────────
const Icons = {
  Sparkles: (cls = "w-4 h-4") => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  Mic: (cls = "w-4 h-4") => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
    </svg>
  ),
  Check: (cls = "w-4 h-4") => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Close: (cls = "w-5 h-5") => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Arrow: (cls = "w-5 h-5") => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
      <path
        fillRule="evenodd"
        d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Shield: (cls = "w-3.5 h-3.5") => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
      <path
        fillRule="evenodd"
        d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Lock: (cls = "w-4 h-4") => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 3C7.03 3 3 6.36 3 10.5c0 2.64 1.68 4.96 4.22 6.32l-.9 3.32a.3.3 0 00.44.34l3.84-2.54c.45.06.92.06 1.4.06 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" />
  </svg>
);

// ════════════════════════════════════════════════════════════
export default function PaymentPage() {
  const navigate = useNavigate();

  const [quota, setQuota] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingCode, setPayingCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [paymentStep, setPaymentStep] = useState("confirm"); // confirm | kakao
  const [kakaoRedirectUrl, setKakaoRedirectUrl] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [activeCategory, setActiveCategory] = useState("ANALYSIS");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotaData, productData] = await Promise.all([getQuota(), getProducts()]);
        setQuota(quotaData);
        setProducts(productData);
      } catch (e) {
        console.error("결제 페이지 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = useCallback((product) => {
    setSelectedProduct(product);
    setPaymentStep("confirm");
    setKakaoRedirectUrl("");
    setPaymentError("");
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
    setPaymentStep("confirm");
    setKakaoRedirectUrl("");
    setPaymentError("");
    setPayingCode("");
  }, []);

  const handleBackToConfirm = useCallback(() => {
    setPaymentStep("confirm");
    setPaymentError("");
  }, []);

  const handlePay = async (productCode) => {
    try {
      setPayingCode(productCode);
      setPaymentError("");

      const data = await readyKakaoPay(productCode);

      if (!data?.redirectUrl) {
        throw new Error("카카오페이 redirectUrl이 없습니다.");
      }

      setKakaoRedirectUrl(data.redirectUrl);
      setPaymentStep("kakao");
    } catch (e) {
      console.error("결제 요청 실패", e);
      setPaymentError("결제창을 불러오지 못했습니다. 다시 시도해주세요.");
      setPaymentStep("kakao");
    } finally {
      setPayingCode("");
    }
  };

  const filteredProducts = products.filter((product) => {
    if (activeCategory === "ANALYSIS") {
      return product.productType === "ANALYSIS_PACKAGE";
    }
    if (activeCategory === "MOCK") {
      return product.productType === "MOCK_PACKAGE";
    }
    if (activeCategory === "STARTER") {
      return product.productType === "COMBO_PACKAGE";
    }
    return true;
  });

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f0f2ff 0%, #e8ecff 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{ borderColor: "#4F6EF7 transparent #4F6EF7 #4F6EF7" }}
          />
          <p className="text-sm font-medium" style={{ color: "#6B7DB3" }}>
            이용권 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f2ff 0%, #eaf0ff 50%, #f5f0ff 100%)" }}
    >
      <div
        className="absolute top-[-120px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,120,247,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,100,247,0.10) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* 상단 이동 버튼 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
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

          <button
            onClick={() => navigate("/mypage")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.9)",
              color: "#4B5672",
              border: "1px solid rgba(99,120,247,0.14)",
              boxShadow: "0 4px 14px rgba(99,120,247,0.08)",
            }}
          >
            마이페이지
            <span className="text-base">→</span>
          </button>
        </div>

        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "linear-gradient(90deg, rgba(99,120,247,0.12), rgba(139,100,247,0.12))",
              color: "#4F6EF7",
              border: "1px solid rgba(99,120,247,0.2)",
            }}
          >
            <span>✦</span> CareerTalk 이용권
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4" style={{ color: "#1a1d3a" }}>
            커리어 성장을 위한
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #4F6EF7, #7B61FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              최적의 플랜
            </span>
            을 선택하세요
          </h1>
          <p className="text-base" style={{ color: "#6B7DB3" }}>
            AI 이력서 분석부터 실전 모의면접까지, 합격을 앞당기는 모든 도구
          </p>
        </div>

        {quota && (
          <section className="mb-14">
            <SectionTitle icon={Icons.Check()} label="현재 보유 이용권" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuotaCard title="무료 분석" value={quota.freeAnalysisRemaining} icon={Icons.Sparkles()} type="free" />
              <QuotaCard title="무료 면접" value={quota.freeMockRemaining} icon={Icons.Mic()} type="free" />
              <QuotaCard title="유료 분석" value={quota.paidAnalysisRemaining} icon={Icons.Sparkles()} type="paid" />
              <QuotaCard title="유료 면접" value={quota.paidMockRemaining} icon={Icons.Mic()} type="paid" />
            </div>
          </section>
        )}

        <section>
          <SectionTitle icon={Icons.Lock()} label="이용권 구매" />

          <div className="flex flex-wrap gap-3 mb-6">
            <CategoryTab
              label="분석권"
              active={activeCategory === "ANALYSIS"}
              onClick={() => setActiveCategory("ANALYSIS")}
            />
            <CategoryTab
              label="면접권"
              active={activeCategory === "MOCK"}
              onClick={() => setActiveCategory("MOCK")}
            />
            <CategoryTab
              label="패키지 상품"
              active={activeCategory === "STARTER"}
              onClick={() => setActiveCategory("STARTER")}
            />
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.productCode}
                product={product}
                onSelect={handleOpenModal}
                highlight={idx === 0}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div
              className="rounded-3xl py-16 text-center mt-2"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px dashed rgba(99,120,247,0.18)",
                color: "#9BA8C8",
              }}
            >
              해당 카테고리의 상품이 아직 없습니다.
            </div>
          )}
        </section>

        <div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs"
          style={{ color: "#9BA8C8" }}
        >
          <span className="flex items-center gap-1.5">{Icons.Shield()} SSL 암호화 결제</span>
          <span className="hidden sm:block">·</span>
          <span>결제 후 즉시 이용권 지급</span>
          <span className="hidden sm:block">·</span>
          <span>카카오페이 안전 결제 지원</span>
        </div>
      </div>

      {selectedProduct && (
        <CompareModal
          product={selectedProduct}
          quota={quota}
          paying={payingCode === selectedProduct.productCode}
          onConfirm={() => handlePay(selectedProduct.productCode)}
          onClose={handleCloseModal}
          step={paymentStep}
          redirectUrl={kakaoRedirectUrl}
          paymentError={paymentError}
          onBack={handleBackToConfirm}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
function CompareModal({
  product,
  quota,
  paying,
  onConfirm,
  onClose,
  step,
  redirectUrl,
  paymentError,
  onBack,
}) {
  const after = quota
    ? {
        paidAnalysis: (quota.paidAnalysisRemaining ?? 0) + product.analysisCreditCount,
        paidMock: (quota.paidMockRemaining ?? 0) + product.mockCreditCount,
      }
    : null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,17,40,0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "white",
          border: "1px solid rgba(99,120,247,0.12)",
          animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div
          className="px-7 pt-7 pb-5 flex items-start justify-between"
          style={{ borderBottom: "1px solid rgba(99,120,247,0.08)" }}
        >
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3"
              style={{
                background: "rgba(99,120,247,0.08)",
                color: "#4F6EF7",
              }}
            >
              ✦ {step === "confirm" ? "이용권 구매 확인" : "카카오페이 결제"}
            </span>

            <h2 className="text-xl font-extrabold" style={{ color: "#1a1d3a" }}>
              {step === "confirm" ? product.productName : "QR 결제 진행"}
            </h2>

            <p className="text-sm mt-0.5" style={{ color: "#6B7DB3" }}>
              {step === "confirm"
                ? product.description
                : "휴대폰으로 QR을 스캔하거나 새 창에서 결제를 진행하세요."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="ml-4 mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-gray-100"
            style={{ color: "#9BA8C8" }}
          >
            {Icons.Close()}
          </button>
        </div>

        {step === "confirm" ? (
          <>
            {after && (
              <div className="px-7 py-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#9BA8C8" }}>
                  구매 후 이용권 변화
                </p>

                <div className="space-y-3">
                  <CompareRow
                    icon={Icons.Sparkles("w-3.5 h-3.5")}
                    label="유료 분석권"
                    before={quota.paidAnalysisRemaining ?? 0}
                    added={product.analysisCreditCount}
                    after={after.paidAnalysis}
                  />
                  <CompareRow
                    icon={Icons.Mic("w-3.5 h-3.5")}
                    label="유료 면접권"
                    before={quota.paidMockRemaining ?? 0}
                    added={product.mockCreditCount}
                    after={after.paidMock}
                  />
                </div>
              </div>
            )}

            <div className="mx-7" style={{ height: 1, background: "rgba(99,120,247,0.08)" }} />

            <div className="px-7 py-5 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#6B7DB3" }}>
                최종 결제 금액
              </span>
              <span className="text-2xl font-extrabold" style={{ color: "#1a1d3a" }}>
                {product.price.toLocaleString()}
                <span className="text-base font-semibold ml-1" style={{ color: "#9BA8C8" }}>원</span>
              </span>
            </div>

            <div className="px-7 pb-7 flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={paying}
                className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "#FFE812",
                  color: "#1a1d3a",
                  boxShadow: "0 4px 20px rgba(255,232,18,0.35)",
                }}
              >
                {paying ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: "#1a1d3a transparent #1a1d3a #1a1d3a" }}
                    />
                    결제 연결 중...
                  </>
                ) : (
                  <>
                    <KakaoIcon />
                    카카오페이로 결제하기
                    <span className="ml-1">{Icons.Arrow("w-4 h-4")}</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50 active:scale-95"
                style={{
                  border: "1.5px solid rgba(99,120,247,0.2)",
                  color: "#6B7DB3",
                }}
              >
                다시 선택하기
              </button>

              <p className="text-center text-xs flex items-center justify-center gap-1.5 mt-1" style={{ color: "#C2CADF" }}>
                {Icons.Shield()} 카카오페이 SSL 암호화 보안 결제
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="px-7 py-6">
              {paymentError ? (
                <div
                  className="rounded-2xl p-4 text-sm font-medium"
                  style={{
                    background: "rgba(255, 99, 99, 0.08)",
                    color: "#d14343",
                    border: "1px solid rgba(255, 99, 99, 0.18)",
                  }}
                >
                  {paymentError}
                </div>
              ) : (
                <>
                  <div
                    className="rounded-2xl overflow-hidden mx-auto"
                    style={{
                      border: "1px solid rgba(99,120,247,0.12)",
                      background: "#f8faff",
                      width: "760px",
                      maxWidth: "100%",
                      height: "420px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "950px",
                        height: "560px",
                        transform: "translateX(0px) scale(0.8)",
                        transformOrigin: "top center",
                      }}
                    >
                      <iframe
                        src={redirectUrl}
                        title="카카오페이 결제"
                        style={{
                          width: "950px",
                          height: "560px",
                          border: "none",
                          display: "block",
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-center mt-4" style={{ color: "#9BA8C8" }}>
                    QR 화면이 보이지 않으면 아래 버튼으로 새 창에서 열어주세요.
                  </p>
                </>
              )}
            </div>

            <div className="px-7 pb-7 flex flex-col gap-3">
              {!!redirectUrl && (
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    background: "#FFE812",
                    color: "#1a1d3a",
                    boxShadow: "0 4px 20px rgba(255,232,18,0.35)",
                  }}
                >
                  <KakaoIcon />
                  새 창에서 카카오페이 열기
                </a>
              )}

              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50 active:scale-95"
                style={{
                  border: "1.5px solid rgba(99,120,247,0.2)",
                  color: "#6B7DB3",
                }}
              >
                이전으로 돌아가기
              </button>

              <p className="text-center text-xs flex items-center justify-center gap-1.5 mt-1" style={{ color: "#C2CADF" }}>
                {Icons.Shield()} 카카오페이 SSL 암호화 보안 결제
              </p>
            </div>
          </>
        )}

        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
function CompareRow({ icon, label, before, added, after }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: "rgba(99,120,247,0.04)", border: "1px solid rgba(99,120,247,0.08)" }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(99,120,247,0.1)", color: "#4F6EF7" }}
      >
        {icon}
      </div>

      <span className="text-sm font-medium flex-1" style={{ color: "#4B5672" }}>
        {label}
      </span>

      <div className="text-center min-w-[36px]">
        <p className="text-[11px] font-medium mb-0.5" style={{ color: "#C2CADF" }}>현재</p>
        <p className="text-base font-bold" style={{ color: "#6B7DB3" }}>{before}</p>
      </div>

      <div className="flex flex-col items-center gap-0.5 px-1">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(99,120,247,0.12)", color: "#4F6EF7" }}
        >
          +{added}
        </span>
        <svg viewBox="0 0 20 10" className="w-6" fill="none">
          <path
            d="M0 5h16M12 1l4 4-4 4"
            stroke="#4F6EF7"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className="text-center min-w-[44px] rounded-xl px-2 py-1.5"
        style={{ background: "linear-gradient(135deg, #4F6EF7, #7B61FF)" }}
      >
        <p className="text-[10px] font-semibold mb-0.5 text-white/70">구매 후</p>
        <p className="text-base font-extrabold text-white">{after}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
function ProductCard({ product, onSelect, highlight }) {
  return (
    <div
      className="relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 cursor-pointer"
      style={
        highlight
          ? {
              background: "linear-gradient(145deg, #4F6EF7 0%, #7B61FF 100%)",
              boxShadow: "0 20px 60px rgba(99,120,247,0.35)",
            }
          : {
              background: "white",
              border: "1px solid rgba(99,120,247,0.12)",
              boxShadow: "0 4px 24px rgba(99,120,247,0.08)",
            }
      }
    >
      {highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-bold shadow-md"
            style={{ background: "#FFE812", color: "#1a1d3a" }}
          >
            ✦ 인기 플랜
          </span>
        </div>
      )}

      <div className="mb-5 mt-2">
        <h3 className="text-xl font-extrabold mb-1.5" style={{ color: highlight ? "white" : "#1a1d3a" }}>
          {product.productName}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: highlight ? "rgba(255,255,255,0.72)" : "#6B7DB3" }}
        >
          {product.description}
        </p>
      </div>

      <div
        className="my-4"
        style={{
          height: 1,
          background: highlight ? "rgba(255,255,255,0.15)" : "rgba(99,120,247,0.08)",
        }}
      />

      <ul className="space-y-2.5 mb-6">
        <FeatureItem
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
          label={`AI 문서 분석 ${product.analysisCreditCount}회`}
          highlight={highlight}
        />
        <FeatureItem
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          }
          label={`모의면접 ${product.mockCreditCount}회`}
          highlight={highlight}
        />
      </ul>

      <div className="mb-5">
        <span
          className="text-[13px] font-medium"
          style={{ color: highlight ? "rgba(255,255,255,0.6)" : "#9BA8C8" }}
        >
          총 금액
        </span>
        <div className="flex items-end gap-1 mt-0.5">
          <span className="text-3xl font-extrabold" style={{ color: highlight ? "white" : "#1a1d3a" }}>
            {product.price.toLocaleString()}
          </span>
          <span
            className="text-base font-semibold mb-0.5"
            style={{ color: highlight ? "rgba(255,255,255,0.6)" : "#9BA8C8" }}
          >
            원
          </span>
        </div>
      </div>

      <button
        onClick={() => onSelect(product)}
        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{
          background: "#FFE812",
          color: "#1a1d3a",
          boxShadow: highlight
            ? "0 4px 20px rgba(255,232,18,0.4)"
            : "0 2px 12px rgba(255,232,18,0.25)",
        }}
      >
        <KakaoIcon />
        이 플랜 선택하기
      </button>
    </div>
  );
}

// ── 공통 컴포넌트 ─────────────────────────────────────────────
function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span style={{ color: "#4F6EF7" }}>{icon}</span>
      <h2 className="text-base font-bold" style={{ color: "#1a1d3a" }}>{label}</h2>
    </div>
  );
}

function CategoryTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
      style={{
        background: active
          ? "linear-gradient(90deg, #4F6EF7, #7B61FF)"
          : "rgba(255,255,255,0.9)",
        color: active ? "white" : "#6B7DB3",
        border: active
          ? "1px solid transparent"
          : "1px solid rgba(99,120,247,0.14)",
        boxShadow: active
          ? "0 8px 24px rgba(99,120,247,0.22)"
          : "0 2px 10px rgba(99,120,247,0.05)",
      }}
    >
      {label}
    </button>
  );
}

function QuotaCard({ title, value, icon, type }) {
  const isPaid = type === "paid";

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: "white",
        border: "1px solid rgba(99,120,247,0.1)",
        boxShadow: "0 2px 16px rgba(99,120,247,0.06)",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{
          background: isPaid
            ? "linear-gradient(135deg, rgba(99,120,247,0.15), rgba(123,97,255,0.15))"
            : "rgba(99,120,247,0.07)",
          color: isPaid ? "#4F6EF7" : "#9BA8C8",
        }}
      >
        {icon}
      </div>
      <p className="text-xs font-medium" style={{ color: "#9BA8C8" }}>{title}</p>
      <p className="text-2xl font-extrabold" style={{ color: "#1a1d3a" }}>
        {value}
        <span className="text-sm font-semibold ml-0.5" style={{ color: "#9BA8C8" }}>회</span>
      </p>
    </div>
  );
}

function FeatureItem({ icon, label, highlight }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: highlight ? "rgba(255,255,255,0.2)" : "rgba(99,120,247,0.1)",
          color: highlight ? "white" : "#4F6EF7",
        }}
      >
        {icon}
      </span>
      <span style={{ color: highlight ? "rgba(255,255,255,0.88)" : "#4B5672" }}>{label}</span>
    </li>
  );
}