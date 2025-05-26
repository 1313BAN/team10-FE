<template>
    <v-container fluid class="pa-0">
      <!-- 로딩 상태 -->
      <v-overlay v-model="loading" class="align-center justify-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <div class="mt-4 text-h6">여행 일정을 생성하고 있습니다...</div>
      </v-overlay>
  
      <v-row no-gutters>
        <!-- 왼쪽: 여행 일정 목록 및 편집 -->
        <v-col cols="12" md="5" class="pa-4">
          <!-- 헤더 카드 -->
          <v-card elevation="2" class="mb-4">
            <v-card-title class="text-h5">
              <v-icon left>mdi-calendar-check</v-icon>
              {{ travelPlan.title || '여행 계획' }}
            </v-card-title>
            <v-card-subtitle v-if="travelPlan.location && travelPlan.dates">
              {{ travelPlan.location }} · {{ formatDateRange(travelPlan.dates) }}
            </v-card-subtitle>
            <v-card-actions>
              <v-btn 
                color="primary" 
                variant="tonal"
                prepend-icon="mdi-refresh"
                @click="showRecommendDialog = true"
                :loading="loadingRecommendation"
              >
                일정 재추천 받기
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                prepend-icon="mdi-content-save"
                @click="savePlan"
                :loading="saving"
              >
                저장
              </v-btn>
            </v-card-actions>
          </v-card>
          
          <!-- 여행 일정 목록 컴포넌트 -->
          <ScheduleList 
            :itinerary="itinerary"
            @select-place="handlePlaceSelect"
            class="mb-4"
          />
          
          <!-- 일정 편집 컴포넌트 -->
          <ScheduleEditor
            :itinerary="itinerary"
            @update-itinerary="handleItineraryUpdate"
          />
        </v-col>
        
        <!-- 오른쪽: 구글 맵 -->
        <v-col cols="12" md="7" class="pa-0">
          <GoogleMap
            :places="mapPlaces"
            :selected-place-id="selectedPlaceId"
            @marker-click="handleMarkerClick"
          />
        </v-col>
      </v-row>
  
      <!-- 재추천 다이얼로그 -->
      <v-dialog v-model="showRecommendDialog" max-width="600">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-refresh</v-icon>
            일정 재추천 받기
          </v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-4">
              고정된 일정을 제외한 나머지 시간에 맞춰 새로운 추천을 받습니다.
            </v-alert>
            
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">고정된 일정</div>
              <v-chip-group>
                <v-chip 
                  v-for="place in fixedPlaces" 
                  :key="place.id"
                  color="orange"
                  variant="outlined"
                  prepend-icon="mdi-pin"
                >
                  {{ place.name }} (Day {{ place.day }})
                </v-chip>
              </v-chip-group>
              <div v-if="fixedPlaces.length === 0" class="text-body-2 text-grey">
                고정된 일정이 없습니다.
              </div>
            </div>
  
            <div>
              <div class="text-subtitle-2 mb-2">추천 옵션</div>
              <v-select
                v-model="recommendOptions.style"
                :items="travelStyles"
                label="여행 스타일"
                variant="outlined"
                density="compact"
              />
              <v-select
                v-model="recommendOptions.types"
                :items="travelTypes"
                label="선호 여행 타입"
                variant="outlined"
                density="compact"
                multiple
                chips
              />
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="showRecommendDialog = false">취소</v-btn>
            <v-btn 
              color="primary" 
              variant="elevated"
              @click="requestRecommendation"
              :loading="loadingRecommendation"
            >
              재추천 받기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import ScheduleList from '@/components/schedule/ScheduleList.vue'
  import GoogleMap from '@/components/schedule/GoogleMap.vue'
  import ScheduleEditor from '@/components/schedule/ScheduleEditor.vue'
  import { travelAPI } from '@/api/travel' // API 모듈 import
  
  const route = useRoute()
  
  // 상태 관리
  const loading = ref(true)
  const loadingRecommendation = ref(false)
  const saving = ref(false)
  const showRecommendDialog = ref(false)
  
  // 여행 계획 데이터
  const travelPlan = ref({
    id: null,
    title: '',
    location: '',
    dates: { start: null, end: null },
    style: '',
    types: []
  })
  
  // 여행 일정 데이터
  const itinerary = ref([])
  
  // 선택된 장소
  const selectedPlaceId = ref(null)
  
  // 재추천 옵션
  const recommendOptions = ref({
    style: '',
    types: []
  })
  
  // 여행 스타일 옵션
  const travelStyles = [
    { title: '빠르게 많이 보기', value: 'fast' },
    { title: '여유롭게 천천히', value: 'slow' },
    { title: '균형잡힌 일정', value: 'balanced' }
  ]
  
  // 여행 타입 옵션
  const travelTypes = [
    { title: '관광', value: 'sightseeing' },
    { title: '맛집', value: 'food' },
    { title: '쇼핑', value: 'shopping' },
    { title: '문화체험', value: 'culture' },
    { title: '액티비티', value: 'activity' },
    { title: '휴식', value: 'relaxation' }
  ]
  
  // 지도에 표시할 장소 목록
  const mapPlaces = computed(() => {
    const places = []
    itinerary.value.forEach(day => {
      day.places.forEach(place => {
        places.push({
          id: place.id,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          day: day.day,
          time: place.time
        })
      })
    })
    return places
  })
  
  // 고정된 장소 목록
  const fixedPlaces = computed(() => {
    const fixed = []
    itinerary.value.forEach(day => {
      day.places.forEach(place => {
        if (place.fixed) {
          fixed.push({
            ...place,
            day: day.day
          })
        }
      })
    })
    return fixed
  })
  
  // 날짜 범위 포맷팅
  const formatDateRange = (dates) => {
    if (!dates.start || !dates.end) return ''
    const start = new Date(dates.start).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })
    const end = new Date(dates.end).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })
    return `${start} ~ ${end}`
  }
  
  // 초기 일정 로드
  const loadInitialSchedule = async () => {
    try {
      loading.value = true
      
      // 라우트 파라미터에서 계획 ID 가져오기
      const planId = route.params.id
      
      if (planId) {
        // 기존 계획 불러오기
        const response = await travelAPI.getPlan(planId)
        travelPlan.value = response.data.plan
        itinerary.value = response.data.itinerary
      } else {
        // 새로운 계획 생성 (이전 페이지에서 전달된 데이터 사용)
        const planData = route.query // 또는 store에서 가져오기
        
        const response = await travelAPI.createPlan({
          location: planData.location,
          dates: planData.dates,
          times: planData.times,
          types: planData.types,
          style: planData.style,
          attractions: planData.attractions
        })
        
        travelPlan.value = response.data.plan
        itinerary.value = response.data.itinerary
      }
      
      // 재추천 옵션 초기화
      recommendOptions.value.style = travelPlan.value.style
      recommendOptions.value.types = travelPlan.value.types
      
    } catch (error) {
      console.error('일정 로드 실패:', error)
      // 에러 처리 (토스트 메시지 등)
    } finally {
      loading.value = false
    }
  }
  
  // 장소 선택 핸들러
  const handlePlaceSelect = (placeId) => {
    selectedPlaceId.value = placeId
  }
  
  // 마커 클릭 핸들러
  const handleMarkerClick = (placeId) => {
    selectedPlaceId.value = placeId
  }
  
  // 일정 업데이트 핸들러
  const handleItineraryUpdate = (updatedItinerary) => {
    itinerary.value = updatedItinerary
  }
  
  // 일정 재추천 요청
  const requestRecommendation = async () => {
    try {
      loadingRecommendation.value = true
      showRecommendDialog.value = false
      
      // 고정된 일정 정보 수집
      const fixedSchedules = []
      itinerary.value.forEach(day => {
        day.places.forEach(place => {
          if (place.fixed) {
            fixedSchedules.push({
              dayId: day.id,
              placeId: place.id,
              time: place.time,
              duration: place.duration
            })
          }
        })
      })
      
      // 재추천 API 요청
      const response = await travelAPI.getRecommendation({
        planId: travelPlan.value.id,
        fixedSchedules,
        style: recommendOptions.value.style,
        types: recommendOptions.value.types,
        dates: travelPlan.value.dates
      })
      
      // 새로운 추천 일정으로 업데이트 (고정된 일정은 유지)
      const newItinerary = response.data.itinerary
      
      // 고정된 일정을 유지하면서 새 일정 병합
      itinerary.value = mergeItineraries(itinerary.value, newItinerary)
      
    } catch (error) {
      console.error('재추천 요청 실패:', error)
      // 에러 토스트 표시
    } finally {
      loadingRecommendation.value = false
    }
  }
  
  // 일정 병합 (고정된 일정 유지)
  const mergeItineraries = (current, recommended) => {
    return recommended.map((recDay, dayIndex) => {
      const currentDay = current[dayIndex]
      if (!currentDay) return recDay
      
      // 고정된 장소들만 추출
      const fixedPlaces = currentDay.places.filter(place => place.fixed)
      
      // 고정되지 않은 시간대에 추천 장소 배치
      const mergedPlaces = []
      let recommendedIndex = 0
      
      // 시간순으로 정렬하여 병합
      const allTimes = [...fixedPlaces, ...recDay.places]
        .map(p => p.time)
        .sort()
        .filter((time, index, self) => self.indexOf(time) === index)
      
      allTimes.forEach(time => {
        const fixedPlace = fixedPlaces.find(p => p.time === time)
        if (fixedPlace) {
          mergedPlaces.push(fixedPlace)
        } else if (recommendedIndex < recDay.places.length) {
          const recPlace = recDay.places[recommendedIndex]
          mergedPlaces.push({
            ...recPlace,
            time: time
          })
          recommendedIndex++
        }
      })
      
      return {
        ...recDay,
        places: mergedPlaces
      }
    })
  }
  
  // 계획 저장
  const savePlan = async () => {
    try {
      saving.value = true
      
      await travelAPI.updatePlan({
        planId: travelPlan.value.id,
        itinerary: itinerary.value
      })
      
      // 성공 토스트 표시
      console.log('저장 완료')
      
    } catch (error) {
      console.error('저장 실패:', error)
      // 에러 토스트 표시
    } finally {
      saving.value = false
    }
  }
  
  // 컴포넌트 마운트 시 초기 데이터 로드
  onMounted(() => {
    loadInitialSchedule()
  })
  </script>
  
  <style scoped>
  .v-container {
    height: 100vh;
  }
  
  .v-col {
    height: 100vh;
    overflow-y: auto;
  }
  
  .v-col:last-child {
    position: relative;
  }
  
  .v-overlay {
    z-index: 9999;
  }
  </style>