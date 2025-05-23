import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // 백엔드 주소
  });

// 일정 저장
export function createPlan(planData) {
    return api.post('/plans', planData)
}
  
// 일정 조회
export function getPlan(planId) {
    return api.get(`/plans/${planId}`)
}
  
// 일정 수정
export function updatePlan(planId, planData) {
    return api.put(`/plans/${planId}`, planData)
}
  
// 일정 삭제
export function deletePlan(planId) {
    return api.delete(`/plans/${planId}`)
}
