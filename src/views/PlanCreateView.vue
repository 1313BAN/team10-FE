<template>
  <div class="plan-create-view">
    <!-- 메인 콘텐츠 영역 -->
    <div class="content-container">
      <!-- 커스텀 진행 표시기 -->
      <div class="step-progress mb-6">
        <div class="d-flex align-center justify-space-between">
          <div 
            v-for="(step, index) in stepConfig"
            :key="step.title"
            class="step-item d-flex align-center"
            :class="{ 
              'step-active': currentStep === index + 1,
              'step-completed': currentStep > index + 1 
            }"
          >
            <div class="step-circle">
              <v-icon 
                v-if="currentStep > index + 1"
                size="16"
                color="white"
              >
                mdi-check
              </v-icon>
              <span v-else class="step-number">{{ index + 1 }}</span>
            </div>
            <div class="step-title ml-2">{{ step.title }}</div>
            <div 
              v-if="index < stepConfig.length - 1"
              class="step-line"
              :class="{ 'step-line-completed': currentStep > index + 1 }"
            />
          </div>
        </div>
      </div>
      
      <!-- 현재 단계 컴포넌트 -->
      <component 
        :is="currentStepComponent" 
        :data="stepData[currentStep - 1] || {}"
        :dates="currentStep === 3 ? stepData[1] || {} : undefined"
        @update="updateStepData"
      />
    </div>

    <!-- 화면 하단 고정 통합 액션 바 -->
    <div class="fixed-action-bar">
      <StepActionBar
        :current-step="currentStep"
        :step-title="getCurrentStepInfo().title"
        :step-icon="getCurrentStepInfo().icon"
        :status-text="getStatusText()"
        :can-go-next="canProceed"
        :can-reset="canReset"
        :show-back="currentStep > 1"
        :show-reset="canReset"
        :is-last-step="isLastStep"
        :custom-next-text="isLastStep ? '여행 계획 완료' : ''"
        @next="isLastStep ? completeplan() : nextStep()"
        @back="previousStep"
        @reset="resetCurrentStep"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StepActionBar from '@/components/plan/StepActionBar.vue'
import PlanStep1Location from '@/components/plan/PlanStep1Location.vue'
import PlanStep2Date from '@/components/plan/PlanStep2Date.vue'
import PlanStep3Time from '@/components/plan/PlanStep3Time.vue'
import PlanStep4Type from '@/components/plan/PlanStep4Type.vue'
import PlanStep5Style from '@/components/plan/PlanStep5Style.vue'
import PlanStep6Attractions from '@/components/plan/PlanStep6Attractions.vue'

// 현재 단계
const currentStep = ref(1)
const totalSteps = 6

// 각 단계별 데이터
const stepData = ref([
  {}, // Step 1: 지역 선택
  {}, // Step 2: 날짜 선택
  {}, // Step 3: 시간 선택
  {}, // Step 4: 타입 선택
  {}, // Step 5: 스타일 선택
  {}  // Step 6: 관광지 선택
])

// 단계별 설정 정보
const stepConfig = [
  {
    title: '여행 지역 선택',
    icon: 'mdi-map-marker',
    component: PlanStep1Location,
    canReset: true
  },
  {
    title: '여행 날짜 선택',
    icon: 'mdi-calendar',
    component: PlanStep2Date,
    canReset: true
  },
  {
    title: '여행 시간 선택',
    icon: 'mdi-clock',
    component: PlanStep3Time,
    canReset: false
  },
  {
    title: '여행 타입 선택',
    icon: 'mdi-map-marker-multiple',
    component: PlanStep4Type,
    canReset: true
  },
  {
    title: '여행 스타일 선택',
    icon: 'mdi-account-tie',
    component: PlanStep5Style,
    canReset: true
  },
  {
    title: '필수 관광지 선택',
    icon: 'mdi-map-marker-star',
    component: PlanStep6Attractions,
    canReset: true
  }
]

// 현재 단계 컴포넌트
const currentStepComponent = computed(() => {
  return stepConfig[currentStep.value - 1]?.component
})

// 현재 단계 정보
const getCurrentStepInfo = () => {
  return stepConfig[currentStep.value - 1] || {}
}

// 마지막 단계 여부
const isLastStep = computed(() => currentStep.value === totalSteps)

// 초기화 가능 여부
const canReset = computed(() => {
  const config = stepConfig[currentStep.value - 1]
  return config?.canReset && hasStepData(currentStep.value - 1)
})

// 다음 단계 진행 가능 여부
const canProceed = computed(() => {
  return validateCurrentStep()
})

// 단계별 데이터가 있는지 확인
function hasStepData(stepIndex) {
  const data = stepData.value[stepIndex]
  return data && Object.keys(data).length > 0
}

// 현재 단계 유효성 검사
function validateCurrentStep() {
  const data = stepData.value[currentStep.value - 1]
  console.log(`Validating step ${currentStep.value}:`, data) // 디버깅
  
  switch (currentStep.value) {
    case 1: // 지역 선택
      const isValid1 = data && data.areaCode && data.sigunguCode
      console.log('Step 1 validation:', { areaCode: data?.areaCode, sigunguCode: data?.sigunguCode, isValid: isValid1 })
      return isValid1
    case 2: // 날짜 선택
      return data && data.start && data.end
    case 3: // 시간 선택
      return data && Array.isArray(data) && data.length > 0
    case 4: // 타입 선택
      return data && Array.isArray(data) && data.length > 0
    case 5: // 스타일 선택
      const isValid5 = data && typeof data === 'string' && data.length > 0
      console.log('Step 5 validation:', { data, type: typeof data, isValid: isValid5 })
      return isValid5
    case 6: // 관광지 선택 (선택사항)
      return true
    default:
      return false
  }
}

// 상태 텍스트 가져오기
function getStatusText() {
  const data = stepData.value[currentStep.value - 1]
  console.log(`Getting status for step ${currentStep.value}:`, data) // 디버깅
  
  switch (currentStep.value) {
    case 1:
      if (data && data.areaCode && data.sigunguCode) {
        return '지역 선택 완료!'
      } else if (data && data.areaCode) {
        return '시/군/구를 선택해주세요'
      }
      return '지역을 선택해주세요'
    case 2:
      if (data && data.start && data.end) {
        const days = calculateDays(data.start, data.end)
        return `${days}일 여행 날짜 선택 완료!`
      }
      return '여행 날짜를 선택해주세요'
    case 3:
      if (data && Array.isArray(data)) {
        const totalHours = data.reduce((sum, day) => {
          const start = parseInt(day.startTime.split(':')[0])
          const end = parseInt(day.endTime.split(':')[0])
          return sum + (end - start)
        }, 0)
        return `모든 날짜의 시간이 설정되었습니다 (총 ${totalHours}시간)`
      }
      return '여행 시간을 설정해주세요'
    case 4:
      return data && data.length > 0 ? `${data.length}개 타입이 선택되었습니다` : '여행 타입을 선택해주세요'
    case 5:
      if (data && typeof data === 'string') {
        return `${getStyleName(data)} 스타일이 선택되었습니다`
      }
      return '여행 스타일을 선택해주세요'
    case 6:
      const count = data && Array.isArray(data) ? data.length : 0
      return count > 0 ? `${count}개 관광지가 선택되었습니다` : '관광지를 선택하거나 건너뛸 수 있습니다'
    default:
      return ''
  }
}

// 여행 일수 계산
function calculateDays(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate - startDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

// 스타일 이름 가져오기
function getStyleName(value) {
  const styles = {
    'relaxed': '널널한 여행',
    'packed': '빽빽한 여행'
  }
  return styles[value] || value
}

// 단계 데이터 업데이트
function updateStepData(data) {
  console.log(`Step ${currentStep.value} data updated:`, data) // 디버깅
  stepData.value[currentStep.value - 1] = data
  console.log('All step data:', stepData.value) // 디버깅
}

// 단계 액션 처리 (각 Step 컴포넌트에서 next 이벤트 발생 시)
function handleStepAction(data) {
  updateStepData(data)
  nextStep()
}

// 다음 단계
function nextStep() {
  if (currentStep.value < totalSteps && canProceed.value) {
    currentStep.value++
  }
}

// 이전 단계
function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 현재 단계 초기화
function resetCurrentStep() {
  stepData.value[currentStep.value - 1] = {}
}

// 여행 계획 완료
function completeplan() {
  if (canProceed.value) {
    console.log('여행 계획 완료!', stepData.value)
    // 여기서 API 호출이나 다음 페이지로 이동
    // router.push('/plan-result')
  }
}

onMounted(() => {
  console.log('PlanCreateView mounted')
})
</script>

<style scoped>
.plan-create-view {
  min-height: 100vh;
  position: relative;
}

/* 메인 콘텐츠 영역 - 하단 액션 바 공간 확보 */
.content-container {
  padding: 16px;
  padding-bottom: 100px; /* 액션 바 높이만큼 패딩 추가 */
  max-width: 1200px;
  margin: 0 auto;
}

/* 화면 하단 고정 액션 바 */
.fixed-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 16px 20px 16px;
}

.fixed-action-bar :deep(.step-action-bar) {
  margin-top: 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* 커스텀 진행 표시기 */
.step-progress {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.step-item {
  flex: 1;
  position: relative;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step-active .step-circle {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.step-completed .step-circle {
  background: rgb(var(--v-theme-success));
  color: white;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  transition: color 0.3s ease;
}

.step-active .step-title {
  color: rgb(var(--v-theme-primary));
}

.step-completed .step-title {
  color: rgb(var(--v-theme-success));
}

.step-line {
  flex: 1;
  height: 2px;
  background: rgb(var(--v-theme-surface-variant));
  margin: 0 16px;
  transition: background-color 0.3s ease;
}

.step-line-completed {
  background: rgb(var(--v-theme-success));
}

/* Stepper 스타일 제거 */

/* 반응형 디자인 */
@media (max-width: 768px) {
  .content-container {
    padding: 12px;
    padding-bottom: 120px; /* 모바일에서 더 큰 패딩 */
  }
  
  .fixed-action-bar {
    padding: 0 12px 20px 12px;
  }
  
  .step-progress {
    padding: 12px;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
  }
  
  .step-title {
    margin-left: 0 !important;
    margin-top: 8px;
    font-size: 12px;
  }
  
  .step-line {
    display: none;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  /* StepActionBar 컴포넌트 자체에서 다크 모드 처리 */
}
</style>