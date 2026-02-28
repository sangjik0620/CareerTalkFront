import { api } from "../api";

export const interviewApi = {
  getResult(sessionId) {
    return api
      .get(`/api/interview/sessions/${sessionId}/result`)
      .then((r) => r.data);
  },
};