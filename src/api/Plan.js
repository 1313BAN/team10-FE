import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080/api';

export const planService = {
  // 여행 계획 생성
  createPlan(planData) {
    return axios.post(`${API_URL}/plans`, planData);
  },

  // 여행 계획 수정
  updatePlan(planId, planData) {
    return axios.put(`${API_URL}/plans/${planId}`, planData);
  },

  // 여행 계획 삭제
  deletePlan(planId) {
    return axios.delete(`${API_URL}/plans/${planId}`);
  },

  // 여행 계획 상세 조회
  getPlan(planId) {
    return axios.get(`${API_URL}/plans/${planId}`);
  },

  // 여행 계획 목록 조회
  getPlans(params) {
    return axios.get(`${API_URL}/plans`, { params });
  }
};
