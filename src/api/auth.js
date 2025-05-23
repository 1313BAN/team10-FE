import axios from 'axios';

const api = axios.create({
  baseURL: 'http://70.12.60.65:8080/api', // 백엔드 주소
  withCredentials: true,               // 세션 쿠키를 보내기 위해 필요
});

export const login = (email, password) => {
  return api.post('/user/login', { email, password });
};

export function register(userData) {
  return api.post('/user/register', userData)
}

export function updateUser(userData) {
  return api.put('/user', userData)
}

export function deleteUser() {
  return api.delete('/user')
}