import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // 백엔드 주소
  withCredentials: true,               // 세션 쿠키를 보내기 위해 필요
});

// 도/시 리스트 불러오기
export function getAreas() {
  return api.get('/area');
}

// 시/군구 리스트 불러오기
export function getSigungu(areaCode) {
  return api.get(`/area/${areaCode}`);
}

// (필요하다면) 관광지 리스트 불러오기
export function getAttractions({ areaCode, sigunguCode, contentTypeId }) {
  return api.get('/attraction', {
    params: { areaCode, sigunguCode, contentTypeId }
  });
}