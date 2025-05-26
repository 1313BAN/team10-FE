<template>
    <div class="step-action-bar">
      <v-card elevation="8" class="action-card">
        <v-card-text class="pa-0">
          <div class="d-flex justify-space-between align-center">
            <!-- 진행 상황 표시 -->
            <div class="step-info">
              <div class="text-caption text-medium-emphasis mb-1">
                <v-icon :icon="stepIcon" size="14" class="mr-1" />
                {{ currentStep }}단계: {{ stepTitle }}
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ statusText }}
              </div>
            </div>
            
            <!-- 액션 버튼 -->
            <div class="d-flex gap-2">
              <!-- 초기화 버튼 -->
              <v-btn
                v-if="showReset"
                variant="outlined"
                :disabled="!canReset"
                size="default"
                @click="$emit('reset')"
              >
                <v-icon class="mr-1" size="18">mdi-refresh</v-icon>
                초기화
              </v-btn>
              
              <!-- 이전 버튼 -->
              <v-btn
                v-if="showBack"
                variant="outlined"
                size="default"
                @click="$emit('back')"
              >
                <v-icon class="mr-1" size="18">mdi-arrow-left</v-icon>
                이전
              </v-btn>
              
              <!-- 다음/완료 버튼 -->
              <v-btn
                color="primary"
                size="default"
                :disabled="!canGoNext"
                @click="$emit('next')"
                :append-icon="isLastStep ? 'mdi-check' : 'mdi-arrow-right'"
              >
                {{ nextButtonText }}
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    // 현재 단계 정보
    currentStep: {
      type: Number,
      required: true
    },
    stepTitle: {
      type: String,
      required: true
    },
    stepIcon: {
      type: String,
      default: 'mdi-help-circle'
    },
    
    // 상태 텍스트
    statusText: {
      type: String,
      required: true
    },
    
    // 버튼 상태
    canGoNext: {
      type: Boolean,
      default: false
    },
    canReset: {
      type: Boolean,
      default: false
    },
    
    // 버튼 표시 여부
    showReset: {
      type: Boolean,
      default: true
    },
    showBack: {
      type: Boolean,
      default: true
    },
    
    // 마지막 단계 여부
    isLastStep: {
      type: Boolean,
      default: false
    },
    
    // 커스텀 버튼 텍스트
    customNextText: {
      type: String,
      default: ''
    }
  })
  
  const emit = defineEmits(['next', 'back', 'reset'])
  
  // 다음 버튼 텍스트 계산
  const nextButtonText = computed(() => {
    if (props.customNextText) return props.customNextText
    if (props.isLastStep) return '완료'
    return '다음 단계'
  })
  </script>
  
  <style scoped>
  .step-action-bar {
    position: sticky;
    bottom: 20px;
    left: 0;
    right: 0;
    z-index: 100;
    margin-top: 32px;
    padding: 0;
  }
  
  .action-card {
    border-radius: 12px !important;
    border: 1px solid rgba(var(--v-border-color), 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
  }
  
  .action-card .v-card-text {
    padding: 12px 16px !important;
  }
  
  .step-info {
    flex: 1;
    max-width: 60%;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .step-action-bar .d-flex {
      flex-direction: column;
      gap: 12px;
    }
    
    .step-info {
      max-width: 100%;
      text-align: center;
    }
    
    .d-flex.gap-2 {
      justify-content: center;
      width: 100%;
    }
  }
  
  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    .action-card {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }
  }
  </style>