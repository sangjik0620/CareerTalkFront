import { api } from "../api";

export const getQuota = async () => {
  const res = await api.get("/api/payments/quota");
  return res.data;
};

export const getProducts = async () => {
  const res = await api.get("/api/payments/products");
  return res.data;
};

export const readyKakaoPay = async (productCode) => {
  const res = await api.post("/api/payments/kakao/ready", { productCode });
  return res.data;
};