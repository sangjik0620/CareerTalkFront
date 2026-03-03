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

  getSessionTargets(sessionId) {
    return api
      .get(`/api/interview/sessions/${sessionId}/targets`)
      .then((r) => r.data);
  },
  
  getAnalysesByIds(analysisIds) {
    return api
      .post(`/api/analysis/batch-by-ids`, { analysisIds })
      .then((r) => r.data);
  },
};