<template>
    <v-card elevation="2">
      <v-card-title>
        <v-icon left>mdi-pencil-outline</v-icon>
        일정 편집
      </v-card-title>
      
      <v-card-text>
        <!-- 날짜 선택 탭 -->
        <v-tabs v-model="selectedDayIndex" class="mb-4">
          <v-tab v-for="(day, index) in editableItinerary" :key="day.id">
            Day {{ day.day }}
          </v-tab>
        </v-tabs>
        
        <!-- 선택된 날짜의 일정 테이블 -->
        <v-window v-model="selectedDayIndex">
          <v-window-item v-for="(day, dayIndex) in editableItinerary" :key="day.id">
            <v-data-table
              :headers="headers"
              :items="day.places"
              :items-per-page="-1"
              density="comfortable"
              class="elevation-1"
            >
              <!-- 시간 컬럼 -->
              <template #item.time="{ item }">
                <v-text-field
                  v-model="item.time"
                  density="compact"
                  hide-details
                  variant="outlined"
                  @change="updateSchedule"
                />
              </template>
              
              <!-- 장소명 컬럼 -->
              <template #item.name="{ item }">
                <v-text-field
                  v-model="item.name"
                  density="compact"
                  hide-details
                  variant="outlined"
                  @change="updateSchedule"
                />
              </template>
              
              <!-- 체류시간 컬럼 -->
              <template #item.duration="{ item }">
                <v-text-field
                  v-model.number="item.duration"
                  type="number"
                  density="compact"
                  hide-details
                  variant="outlined"
                  suffix="분"
                  @change="updateSchedule"
                />
              </template>
              
              <!-- 설명 컬럼 -->
              <template #item.description="{ item }">
                <v-text-field
                  v-model="item.description"
                  density="compact"
                  hide-details
                  variant="outlined"
                  @change="updateSchedule"
                />
              </template>
              
              <!-- 고정 컬럼 -->
              <template #item.fixed="{ item }">
                <v-checkbox
                  v-model="item.fixed"
                  hide-details
                  density="compact"
                  color="orange"
                  @change="updateSchedule"
                />
              </template>
              
              <!-- 액션 컬럼 -->
              <template #item.actions="{ item, index }">
                <div class="d-flex">
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click="moveUp(dayIndex, index)"
                    :disabled="index === 0"
                  >
                    <v-icon>mdi-arrow-up</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click="moveDown(dayIndex, index)"
                    :disabled="index === day.places.length - 1"
                  >
                    <v-icon>mdi-arrow-down</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="removePlace(dayIndex, index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
            
            <!-- 새 장소 추가 버튼 -->
            <v-btn
              class="mt-4"
              color="primary"
              variant="outlined"
              block
              @click="addNewPlace(dayIndex)"
            >
              <v-icon left>mdi-plus</v-icon>
              새 장소 추가
            </v-btn>
          </v-window-item>
        </v-window>
        
        <!-- 시간 자동 조정 -->
        <v-card class="mt-4" variant="outlined">
          <v-card-text>
            <v-switch
              v-model="autoAdjustTime"
              label="시간 자동 조정"
              color="primary"
              density="compact"
              hide-details
            />
            <div class="text-caption text-grey mt-2">
              활성화하면 체류시간에 따라 다음 일정의 시작 시간이 자동으로 조정됩니다.
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
      
      <!-- 저장/취소 버튼 -->
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="resetChanges">
          취소
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="saveChanges">
          저장
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  
  const props = defineProps({
    itinerary: {
      type: Array,
      required: true
    }
  })
  
  const emit = defineEmits(['update-itinerary'])
  
  // 편집 가능한 일정 데이터 (딥 카피)
  const editableItinerary = ref(JSON.parse(JSON.stringify(props.itinerary)))
  const selectedDayIndex = ref(0)
  const autoAdjustTime = ref(true)
  
  // 테이블 헤더
  const headers = [
    { title: '시간', key: 'time', width: '100px' },
    { title: '장소', key: 'name', width: '200px' },
    { title: '체류시간', key: 'duration', width: '100px' },
    { title: '설명', key: 'description' },
    { title: '고정', key: 'fixed', width: '60px', align: 'center' },
    { title: '', key: 'actions', width: '120px', align: 'center', sortable: false }
  ]
  
  // 새 장소 추가
  const addNewPlace = (dayIndex) => {
    const day = editableItinerary.value[dayIndex]
    const lastPlace = day.places[day.places.length - 1]
    
    // 마지막 장소의 종료 시간 계산
    let newTime = '09:00'
    if (lastPlace) {
      const [hours, minutes] = lastPlace.time.split(':').map(Number)
      const totalMinutes = hours * 60 + minutes + lastPlace.duration
      const newHours = Math.floor(totalMinutes / 60)
      const newMinutes = totalMinutes % 60
      newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
    }
    
    const newPlace = {
      id: `place_${Date.now()}`,
      name: '새 장소',
      time: newTime,
      duration: 60,
      lat: 37.5665 + (Math.random() - 0.5) * 0.1,
      lng: 126.9780 + (Math.random() - 0.5) * 0.1,
      fixed: false,
      description: ''
    }
    
    day.places.push(newPlace)
  }
  
  // 장소 제거
  const removePlace = (dayIndex, placeIndex) => {
    editableItinerary.value[dayIndex].places.splice(placeIndex, 1)
    if (autoAdjustTime.value) {
      adjustTimes(dayIndex)
    }
  }
  
  // 위로 이동
  const moveUp = (dayIndex, placeIndex) => {
    const places = editableItinerary.value[dayIndex].places
    const temp = places[placeIndex]
    places[placeIndex] = places[placeIndex - 1]
    places[placeIndex - 1] = temp
    
    if (autoAdjustTime.value) {
      adjustTimes(dayIndex)
    }
  }
  
  // 아래로 이동
  const moveDown = (dayIndex, placeIndex) => {
    const places = editableItinerary.value[dayIndex].places
    const temp = places[placeIndex]
    places[placeIndex] = places[placeIndex + 1]
    places[placeIndex + 1] = temp
    
    if (autoAdjustTime.value) {
      adjustTimes(dayIndex)
    }
  }
  
  // 시간 자동 조정
  const adjustTimes = (dayIndex) => {
    const places = editableItinerary.value[dayIndex].places
    
    for (let i = 1; i < places.length; i++) {
      if (!places[i].fixed) {
        const prevPlace = places[i - 1]
        const [hours, minutes] = prevPlace.time.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + prevPlace.duration
        const newHours = Math.floor(totalMinutes / 60)
        const newMinutes = totalMinutes % 60
        places[i].time = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
      }
    }
  }
  
  // 일정 업데이트
  const updateSchedule = () => {
    if (autoAdjustTime.value) {
      adjustTimes(selectedDayIndex.value)
    }
  }
  
  // 변경사항 저장
  const saveChanges = () => {
    emit('update-itinerary', JSON.parse(JSON.stringify(editableItinerary.value)))
  }
  
  // 변경사항 취소
  const resetChanges = () => {
    editableItinerary.value = JSON.parse(JSON.stringify(props.itinerary))
  }
  
  // props 변경 감지
  watch(() => props.itinerary, (newVal) => {
    editableItinerary.value = JSON.parse(JSON.stringify(newVal))
  }, { deep: true })
  </script>
  
  <style scoped>
  :deep(.v-data-table) {
    background: #f5f5f5;
  }
  
  :deep(.v-data-table__tr:hover) {
    background: #e3f2fd !important;
  }
  
  :deep(.v-field__input) {
    min-height: 32px;
    padding: 4px 12px;
  }
  
  :deep(.v-text-field .v-field) {
    font-size: 14px;
  }
  </style>