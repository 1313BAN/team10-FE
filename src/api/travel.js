import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 (인증 토큰 추가 등)
apiClient.interceptors.request.use(
  config => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 공통 에러 처리
    if (error.response?.status === 401) {
      // 인증 에러 처리
      // router.push('/login')
    }
    return Promise.reject(error)
  }
)

export const travelAPI = {
  /**
   * 새로운 여행 계획 생성
   * @param {Object} planData - 여행 계획 데이터
   * @returns {Promise} API 응답
   */
  createPlan: async (planData) => {
    return await apiClient.post('/travel/plans', {
      location: planData.location,
      dates: planData.dates,
      times: planData.times,
      types: planData.types,
      style: planData.style,
      attractions: planData.attractions
    })
  },

  /**
   * 기존 여행 계획 조회
   * @param {String} planId - 계획 ID
   * @returns {Promise} API 응답
   */
  getPlan: async (planId) => {
    return await apiClient.get(`/travel/plans/${planId}`)
  },

  /**
   * 여행 계획 업데이트
   * @param {Object} updateData - 업데이트 데이터
   * @returns {Promise} API 응답
   */
  updatePlan: async (updateData) => {
    return await apiClient.put(`/travel/plans/${updateData.planId}`, {
      itinerary: updateData.itinerary
    })
  },

  /**
   * 일정 재추천 요청
   * @param {Object} recommendData - 재추천 요청 데이터
   * @returns {Promise} API 응답
   */
  getRecommendation: async (recommendData) => {
    return await apiClient.post('/travel/recommendations', {
      planId: recommendData.planId,
      fixedSchedules: recommendData.fixedSchedules,
      style: recommendData.style,
      types: recommendData.types,
      dates: recommendData.dates
    })
  },

  /**
   * 사용자의 모든 여행 계획 목록 조회
   * @returns {Promise} API 응답
   */
  getMyPlans: async () => {
    return await apiClient.get('/travel/plans')
  },

  /**
   * 여행 계획 삭제
   * @param {String} planId - 계획 ID
   * @returns {Promise} API 응답
   */
  deletePlan: async (planId) => {
    return await apiClient.delete(`/travel/plans/${planId}`)
  }
}

// 백엔드 API 예시 스펙
/*
POST /api/travel/plans
Request Body:
{
  "location": "서울",
  "dates": {
    "start": "2024-01-20",
    "end": "2024-01-22"
  },
  "times": [
    { "date": "2024-01-20", "start": "09:00", "end": "21:00" },
    { "date": "2024-01-21", "start": "09:00", "end": "21:00" },
    { "date": "2024-01-22", "start": "09:00", "end": "18:00" }
  ],
  "types": ["sightseeing", "food", "shopping"],
  "style": "balanced",
  "attractions": ["경복궁", "남산타워", "명동"]
}

Response:
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan_123456",
      "title": "서울 3일 여행",
      "location": "서울",
      "dates": { "start": "2024-01-20", "end": "2024-01-22" },
      "style": "balanced",
      "types": ["sightseeing", "food", "shopping"]
    },
    "itinerary": [
      {
        "id": 1,
        "day": 1,
        "date": "2024-01-20",
        "places": [
          {
            "id": "place_1",
            "name": "경복궁",
            "time": "09:00",
            "duration": 120,
            "lat": 37.5796,
            "lng": 126.9770,
            "fixed": true,
            "description": "조선시대 대표 궁궐",
            "category": "sightseeing"
          },
          {
            "id": "place_2",
            "name": "인사동",
            "time": "11:30",
            "duration": 90,
            "lat": 37.5732,
            "lng": 126.9858,
            "fixed": false,
            "description": "전통문화의 거리",
            "category": "shopping"
          }
        ]
      }
    ]
  }
}

POST /api/travel/recommendations
Request Body:
{
  "planId": "plan_123456",
  "fixedSchedules": [
    {
      "dayId": 1,
      "placeId": "place_1",
      "time": "09:00",
      "duration": 120
    }
  ],
  "style": "balanced",
  "types": ["sightseeing", "food"],
  "dates": { "start": "2024-01-20", "end": "2024-01-22" }
}

Response:
{
  "success": true,
  "data": {
    "itinerary": [
      // 고정된 일정을 제외한 새로운 추천 일정
    ]
  }
}
*/