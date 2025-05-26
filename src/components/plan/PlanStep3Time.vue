<template>
    <div class="time-step">
      <div class="text-h6 mb-4">여행 시간 선택</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        각 날짜별로 여행 시작 시간과 종료 시간을 선택해주세요.
      </div>
  
      <div v-for="(date, index) in dateList" :key="date" class="mb-6">
        <div class="text-subtitle-1 font-weight-medium mb-4 d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-calendar-today</v-icon>
          {{ formatDate(date) }}
        </div>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="selection-card time-card">
              <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
                <v-icon class="mr-2" color="success">mdi-clock-start</v-icon>
                시작 시간
              </v-card-title>
              <v-card-text>
                <v-menu v-model="startMenuOpen[index]" location="bottom" :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="outlined"
                      class="time-btn"
                      :disabled="!date"
                      size="large"
                      prepend-icon="mdi-clock-outline"
                    >
                      {{ formatDisplayTime(timeRanges[index].start) }}
                    </v-btn>
                  </template>
                  <v-card min-width="320" class="time-picker-card">
                    <v-card-title class="d-flex justify-space-between align-center">
                      <span>시작 시간 선택</span>
                      <v-btn icon="mdi-close" variant="text" @click="closeMenu(index, 'start')"></v-btn>
                    </v-card-title>
                    <v-card-text>
                      <div class="time-selection">
                        <div class="period-selector mb-4">
                          <v-btn-toggle
                            v-model="selectedPeriods[index].start"
                            mandatory
                            color="primary"
                            class="period-toggle"
                            @update:model-value="updatePeriod(index, 'start')"
                          >
                            <v-btn value="AM" class="period-btn">
                              <v-icon class="mr-1">mdi-weather-sunny</v-icon>
                              AM
                            </v-btn>
                            <v-btn value="PM" class="period-btn">
                              <v-icon class="mr-1">mdi-weather-night</v-icon>
                              PM
                            </v-btn>
                          </v-btn-toggle>
                        </div>
                        <div class="hour-grid">
                          <v-btn
                            v-for="hour in displayHours"
                            :key="hour.value"
                            :color="isSelectedHour(index, 'start', hour.value) ? 'primary' : undefined"
                            :variant="isSelectedHour(index, 'start', hour.value) ? 'flat' : 'outlined'"
                            class="hour-btn"
                            @click="selectHour(index, 'start', hour.value)"
                          >
                            {{ hour.label }}
                          </v-btn>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="selection-card time-card" :class="{ 'card-disabled': !timeRanges[index].start }">
              <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
                <v-icon class="mr-2" :color="timeRanges[index].start ? 'error' : 'grey'">mdi-clock-end</v-icon>
                종료 시간
              </v-card-title>
              <v-card-text>
                <v-menu v-model="endMenuOpen[index]" location="bottom" :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="outlined"
                      class="time-btn"
                      :disabled="!date || !timeRanges[index].start"
                      size="large"
                      prepend-icon="mdi-clock-outline"
                    >
                      {{ formatDisplayTime(timeRanges[index].end) }}
                    </v-btn>
                  </template>
                  <v-card min-width="320" class="time-picker-card">
                    <v-card-title class="d-flex justify-space-between align-center">
                      <span>종료 시간 선택</span>
                      <v-btn icon="mdi-close" variant="text" @click="closeMenu(index, 'end')"></v-btn>
                    </v-card-title>
                    <v-card-text>
                      <div class="time-selection">
                        <div class="period-selector mb-4">
                          <v-btn-toggle
                            v-model="selectedPeriods[index].end"
                            mandatory
                            color="primary"
                            class="period-toggle"
                            @update:model-value="updatePeriod(index, 'end')"
                          >
                            <v-btn value="AM" class="period-btn">
                              <v-icon class="mr-1">mdi-weather-sunny</v-icon>
                              AM
                            </v-btn>
                            <v-btn value="PM" class="period-btn">
                              <v-icon class="mr-1">mdi-weather-night</v-icon>
                              PM
                            </v-btn>
                          </v-btn-toggle>
                        </div>
                        <div class="hour-grid">
                          <v-btn
                            v-for="hour in displayHours"
                            :key="hour.value"
                            :color="isSelectedHour(index, 'end', hour.value) ? 'primary' : undefined"
                            :variant="isSelectedHour(index, 'end', hour.value) ? 'flat' : 'outlined'"
                            class="hour-btn"
                            :disabled="isHourDisabled(index, hour.value)"
                            @click="selectHour(index, 'end', hour.value)"
                          >
                            {{ hour.label }}
                          </v-btn>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
  
      <!-- 모든 날짜 시간 요약 UI -->
      <v-expand-transition>
        <v-card 
          v-if="isAllTimeRangesValid" 
          variant="tonal" 
          color="success" 
          class="mt-6 selection-preview"
        >
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon class="mr-2" color="success">mdi-clock-check</v-icon>
            여행 시간 요약
          </v-card-title>
          <v-card-text class="py-3">
            <div class="time-summary">
              <div v-for="(date, index) in dateList" :key="date" class="summary-item">
                <div class="d-flex justify-space-between align-center py-2">
                  <div>
                    <div class="text-body-2 font-weight-medium">
                      {{ formatDateShort(date) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ getDayOfWeek(date) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-body-1 font-weight-bold">
                      {{ formatDisplayTime(timeRanges[index].start) }} - {{ formatDisplayTime(timeRanges[index].end) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ getTravelDuration(index) }}시간 여행
                    </div>
                  </div>
                </div>
                <v-divider v-if="index < dateList.length - 1" class="my-1" />
              </div>
              
              <!-- 전체 통계 -->
              <v-divider class="my-3" />
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-2 font-weight-medium">
                  총 여행 시간
                </div>
                <div class="text-h6 font-weight-bold text-success">
                  {{ getTotalTravelHours() }}시간
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  
  const props = defineProps({
    data: {
      type: Array,
      default: () => []
    },
    dates: {
      type: Object,
      default: () => ({})
    }
  })
  
  const emit = defineEmits(['update'])
  
  const displayHours = computed(() =>
    Array.from({ length: 24 }, (_, i) => ({
      value: i,
      label: `${i}:00`
    }))
  )
  
  const dateList = computed(() => {
    if (!props.dates.start || !props.dates.end) return []
  
    const dates = []
    const start = new Date(props.dates.start)
    const end = new Date(props.dates.end)
  
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date).toISOString().split('T')[0])
    }
  
    return dates
  })
  
  const timeRanges = ref([])
  const selectedPeriods = ref([])
  const startMenuOpen = ref([])
  const endMenuOpen = ref([])
  
  watch(dateList, (newDates) => {
    // 기존 데이터가 있으면 사용, 없으면 기본값
    if (Array.isArray(props.data) && props.data.length > 0) {
      timeRanges.value = props.data.map(item => ({
        start: item.startTime || '10:00',
        end: item.endTime || '22:00'
      }))
    } else {
      timeRanges.value = newDates.map(() => ({ start: '10:00', end: '22:00' }))
    }
    
    selectedPeriods.value = newDates.map(() => ({ start: 'AM', end: 'PM' }))
    startMenuOpen.value = newDates.map(() => false)
    endMenuOpen.value = newDates.map(() => false)
    
    updateData()
  }, { immediate: true })
  
  // 데이터 업데이트 함수
  function updateData() {
    console.log('Step3 updateData called, dateList:', dateList.value.length, 'timeRanges:', timeRanges.value.length)
    
    if (dateList.value.length > 0 && timeRanges.value.length > 0) {
      const timeData = dateList.value.map((date, index) => ({
        date,
        startTime: timeRanges.value[index]?.start || '10:00',
        endTime: timeRanges.value[index]?.end || '22:00'
      }))
      console.log('Step3 emitting time data:', timeData)
      emit('update', timeData)
    } else {
      console.log('Step3 emitting empty array')
      emit('update', [])
    }
  }
  
  // 여행 시간 계산
  function getTravelDuration(index) {
    const start = timeRanges.value[index]?.start
    const end = timeRanges.value[index]?.end
    if (!start || !end) return 0
    
    const startHour = parseInt(start.split(':')[0])
    const endHour = parseInt(end.split(':')[0])
    return endHour - startHour
  }
  
  // 총 여행 시간 계산
  function getTotalTravelHours() {
    return timeRanges.value.reduce((total, _, index) => {
      return total + getTravelDuration(index)
    }, 0)
  }
  
  function selectHour(index, type, hour) {
    const period = selectedPeriods.value[index][type]
    const hour24 = period === 'PM' && hour < 12 ? hour + 12 : hour
    timeRanges.value[index][type] = `${hour24.toString().padStart(2, '0')}:00`
  
    if (type === 'start') {
      startMenuOpen.value[index] = false
    } else {
      endMenuOpen.value[index] = false
    }
    
    updateData()
  }
  
  function updatePeriod(index, type) {
    const currentTime = timeRanges.value[index][type]
    const currentHour = parseInt(currentTime.split(':')[0])
    const period = selectedPeriods.value[index][type]
    
    let newHour = currentHour
    if (period === 'PM' && currentHour < 12) {
      newHour = currentHour + 12
    } else if (period === 'AM' && currentHour >= 12) {
      newHour = currentHour - 12
    }
    
    timeRanges.value[index][type] = `${newHour.toString().padStart(2, '0')}:00`
    updateData()
  }
  
  function isSelectedHour(index, type, hour) {
    const currentTime = timeRanges.value[index]?.[type]
    if (!currentTime) return false
    
    const currentHour = parseInt(currentTime.split(':')[0])
    const period = selectedPeriods.value[index][type]
    const hour24 = period === 'PM' && hour < 12 ? hour + 12 : hour
    return currentHour === hour24
  }
  
  function formatDisplayTime(time) {
    if (!time) return '시간 선택'
    const hour = parseInt(time.split(':')[0])
    const period = hour < 12 ? 'AM' : 'PM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }
  
  function formatDateShort(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }
  
  function getDayOfWeek(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', { weekday: 'short' })
  }
  
  function closeMenu(index, type) {
    if (type === 'start') {
      startMenuOpen.value[index] = false
    } else {
      endMenuOpen.value[index] = false
    }
  }
  
  const isAllTimeRangesValid = computed(() => {
    return timeRanges.value.every(range => {
      return range.start && range.end && range.start < range.end
    })
  })
  
  function isHourDisabled(index, hour) {
    const startTime = timeRanges.value[index]?.start
    if (!startTime) return false
  
    const startHour = parseInt(startTime.split(':')[0])
    const selectedPeriod = selectedPeriods.value[index].end
    const hour24 = selectedPeriod === 'PM' && hour < 12 ? hour + 12 : hour
  
    return hour24 <= startHour
  }
  
  // props 변경 감시
  watch(() => props.data, (newData) => {
    if (Array.isArray(newData) && newData.length > 0) {
      timeRanges.value = newData.map(item => ({
        start: item.startTime || '10:00',
        end: item.endTime || '22:00'
      }))
    }
  }, { deep: true })
  </script>
  
  <style scoped>
  .time-step {
    max-width: 100%;
  }
  
  .selection-card {
    height: 100%;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .selection-card:hover:not(.card-disabled) {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }
  
  .card-disabled {
    opacity: 0.75;
    background-color: rgb(var(--v-theme-surface));
    border-color: rgba(var(--v-border-color), 0.3) !important;
  }
  
  .time-card {
    min-height: 140px;
  }
  
  .time-btn {
    width: 100%;
    justify-content: flex-start;
    text-transform: none;
    height: 48px;
  }
  
  .time-picker-card {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .time-selection {
    padding: 8px;
  }
  
  .period-selector {
    display: flex;
    justify-content: center;
  }
  
  .period-toggle {
    border-radius: 12px;
    overflow: hidden;
  }
  
  .period-btn {
    min-width: 100px;
    font-weight: 500;
  }
  
  .hour-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 8px;
  }
  
  .hour-btn {
    min-width: 60px;
    height: 44px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .hour-btn:hover:not(:disabled) {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
  
  .selection-preview {
    border: 2px solid rgb(var(--v-theme-success));
    animation: fadeInUp 0.3s ease;
  }
  
  .time-summary {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .summary-item {
    transition: background-color 0.2s ease;
    border-radius: 8px;
    padding: 0 8px;
  }
  
  .summary-item:hover {
    background-color: rgba(var(--v-theme-success), 0.05);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .hour-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  /* 커스텀 스크롤바 */
  :deep(.v-field--focused) {
    border-color: rgb(var(--v-theme-primary)) !important;
  }
  </style>