import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true, // 세션/쿠키 기반이면 true, JWT면 필요없을 수도
});