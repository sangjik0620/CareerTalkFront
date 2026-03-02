import { api } from "../api";

export const interviewApi = {
  getResult(sessionId) {
    return api
      .get(`/api/interview/sessions/${sessionId}/result`)
      .then((r) => r.data);
  },
   startAnalysis: (sessionId) =>
    api.post(`/api/interview/sessions/${sessionId}/analyze`),

  getAnalysisStatus: (sessionId) =>
    api.get(`/api/interview/sessions/${sessionId}/analysis/status`),
};