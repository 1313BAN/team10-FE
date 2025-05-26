<template>
    <div class="date-step">
      <div class="text-h6 mb-4">여행 날짜 선택</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        시작 날짜와 종료 날짜를 선택해주세요.
      </div>

      <!-- 날짜 선택기 카드 -->
      <v-card variant="outlined" class="selection-card mb-6">
        <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
          <v-icon class="mr-2" color="primary">mdi-calendar</v-icon>
          날짜 선택
        </v-card-title>
        <v-card-text class="d-flex justify-center">
          <v-date-picker 
            v-model="selectedDates" 
            multiple 
            color="primary" 
            show-adjacent-months 
            :min="minDate"
            class="custom-date-picker" 
            @update:model-value="handleDateSelect" 
            hide-header 
          />
        </v-card-text>
      </v-card>
  
      <!-- 선택 상태 안내 -->
      <v-expand-transition>
        <v-card 
          v-if="selectionStep < 3" 
          variant="tonal" 
          color="info" 
          class="mb-6 selection-guide"
        >
          <v-card-text class="py-3">
            <div class="d-flex align-center">
              <v-icon color="info" class="mr-3">mdi-information-outline</v-icon>
              <div class="text-body-2">
                <span v-if="selectionStep === 1">📅 시작 날짜를 선택하세요</span>
                <span v-else-if="selectionStep === 2">📅 종료 날짜를 선택하세요</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
  
      <!-- 선택 완료 미리보기 -->
      <v-expand-transition>
        <v-card 
          v-if="dateRange.start && dateRange.end" 
          variant="tonal" 
          color="success" 
          class="mb-6 selection-preview"
        >
          <v-card-text class="py-4">
            <div class="d-flex align-center">
              <v-icon color="success" class="mr-3">mdi-calendar-check</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-medium">선택된 여행 기간</div>
                <div class="text-h6 font-weight-bold mt-1">
                  {{ getTravelPeriodText() }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  총 {{ getTravelDays() }}일 여행
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </div>
  </template>
  
  <script setup>
  import { ref, nextTick, watch } from 'vue'
  
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({})
    }
  })
  
  const emit = defineEmits(['update'])
  
  const today = new Date().toISOString().slice(0, 10)
  const minDate = today
  
  // 선택된 날짜들을 배열로 관리
  const selectedDates = ref([])
  
  // 시작일과 종료일을 관리하는 객체
  const dateRange = ref({
    start: props.data?.start || '',
    end: props.data?.end || ''
  })
  
  // 선택 단계 (1: 시작일 선택, 2: 종료일 선택, 3: 완료)
  const selectionStep = ref(1)
  
  // props에서 초기값 설정
  if (props.data?.start && props.data?.end) {
    selectedDates.value = [props.data.start, props.data.end]
    selectionStep.value = 3
  }
  
  // 여행 기간 텍스트
  const getTravelPeriodText = () => {
    if (!dateRange.value.start || !dateRange.value.end) return ''
    return `${formatDate(dateRange.value.start)} ~ ${formatDate(dateRange.value.end)}`
  }
  
  // 여행 일수 계산
  const getTravelDays = () => {
    if (!dateRange.value.start || !dateRange.value.end) return 0
    const start = new Date(dateRange.value.start)
    const end = new Date(dateRange.value.end)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }
  
  // 데이터 업데이트 함수
  function updateData() {
    console.log('Step2 updateData called:', { start: dateRange.value.start, end: dateRange.value.end })
    
    if (dateRange.value.start && dateRange.value.end) {
      const dateData = {
        start: dateRange.value.start,
        end: dateRange.value.end
      }
      console.log('Step2 emitting date data:', dateData)
      emit('update', dateData)
    } else {
      console.log('Step2 emitting empty data')
      emit('update', {})
    }
  }
  
  // 직접 날짜 변경 핸들러
  function handleDateSelect(dates) {
    console.log('Direct date select:', dates)
    handleDateChange(dates)
  }
  
  // 날짜 변경 핸들러
  async function handleDateChange(dates) {
    if (!dates || dates.length === 0) {
      dateRange.value = { start: '', end: '' }
      selectionStep.value = 1
      updateData()
      return
    }
  
    const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b))
  
    if (selectionStep.value === 3 && dates.length >= 3) {
      const previousDates = selectedDates.value
      const newDate = dates.find(date => !previousDates.includes(date))
      if (newDate) {
        selectedDates.value = []
        await nextTick()
        selectedDates.value = [newDate]
        dateRange.value = { start: newDate, end: '' }
        selectionStep.value = 2
        updateData()
        return
      }
    }
  
    if (sortedDates.length === 1) {
      dateRange.value = {
        start: sortedDates[0],
        end: ''
      }
      selectionStep.value = 2
    } else if (sortedDates.length === 2) {
      dateRange.value = {
        start: sortedDates[0],
        end: sortedDates[1]
      }
      selectionStep.value = 3
    } else if (sortedDates.length > 2) {
      selectedDates.value = [sortedDates[0], sortedDates[1]]
      dateRange.value = {
        start: sortedDates[0],
        end: sortedDates[1]
      }
      selectionStep.value = 3
    }
    
    updateData()
  }
  
  // 날짜 포맷팅
  function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // 요일 가져오기
  function getDayOfWeek(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', { weekday: 'long' })
  }
  
  // props 변경 감시
  watch(() => props.data, (newData) => {
    if (newData && newData.start && newData.end) {
      dateRange.value = { start: newData.start, end: newData.end }
      selectedDates.value = [newData.start, newData.end]
      selectionStep.value = 3
    }
  }, { deep: true })
  </script>
  
  <style scoped>
  .date-step {
    max-width: 100%;
  }
  
  .selection-card {
    height: 100%;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .selection-card:hover {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }
  
  .date-display-card {
    min-height: 120px;
  }
  
  .custom-date-picker {
    box-shadow: none;
    width: 100%;
    max-width: 400px;
  }
  
  .custom-date-picker :deep(.v-date-picker) {
    box-shadow: none;
    border: none;
    width: 100%;
    margin: 0 auto;
  }
  
  .selection-guide {
    border: 2px solid rgb(var(--v-theme-info));
    animation: fadeInUp 0.3s ease;
  }
  
  .selection-preview {
    border: 2px solid rgb(var(--v-theme-success));
    animation: fadeInUp 0.3s ease;
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
  
  /* 커스텀 스크롤바 */
  :deep(.v-field--focused) {
    border-color: rgb(var(--v-theme-primary)) !important;
  }
  </style>