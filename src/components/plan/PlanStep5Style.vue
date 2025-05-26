<template>
    <div class="style-step">
      <div class="text-h6 mb-4">여행 스타일 선택</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        선호하는 여행 스타일을 선택해주세요.
      </div>
  
      <!-- 여행 스타일 선택 -->
      <v-row>
        <v-col v-for="style in travelStyles" :key="style.value" cols="12" md="6">
          <v-card
            variant="outlined"
            class="selection-card style-card"
            :class="{ 'selected': selectedStyle === style.value }"
            @click="selectStyle(style.value)"
          >
            <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
              <v-icon 
                class="mr-2" 
                :color="selectedStyle === style.value ? 'primary' : 'grey'"
                size="28"
              >
                {{ style.icon }}
              </v-icon>
              {{ style.label }}
            </v-card-title>
            <v-card-text>
              <div class="text-body-1 mb-3">
                {{ style.description }}
              </div>
              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ style.details }}
              </div>
              
              <!-- 스타일 특징 -->
              <div class="style-features">
                <v-chip
                  v-for="feature in style.features"
                  :key="feature"
                  size="small"
                  variant="outlined"
                  class="mr-1 mb-1"
                  :color="selectedStyle === style.value ? 'primary' : 'default'"
                >
                  {{ feature }}
                </v-chip>
              </div>
  
              <!-- 선택 표시 -->
              <div v-if="selectedStyle === style.value" class="selected-indicator mt-3">
                <v-chip color="primary" variant="flat" size="small">
                  <v-icon start size="16">mdi-check</v-icon>
                  선택됨
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 선택된 스타일 미리보기 -->
      <v-expand-transition>
        <v-card 
          v-if="selectedStyle" 
          variant="tonal" 
          color="success" 
          class="mt-6 selection-preview"
        >
          <v-card-text class="py-4">
            <div class="d-flex align-center">
              <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-medium">선택된 여행 스타일</div>
                <div class="text-h6 font-weight-bold mt-1">
                  {{ getSelectedStyleInfo()?.label }}
                </div>
                <div class="text-body-2 text-medium-emphasis mt-1">
                  {{ getSelectedStyleInfo()?.description }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    data: {
      type: String,
      default: ''
    }
  })
  
  const emit = defineEmits(['update'])
  
  const travelStyles = [
    { 
      value: 'relaxed',
      label: '널널한 여행',
      icon: 'mdi-timer-sand',
      description: '여유롭게 천천히 즐기는 여행',
      details: '충분한 휴식 시간과 함께 자유롭고 편안한 일정으로 구성됩니다.',
      features: ['여유로운 일정', '충분한 휴식', '자유시간 많음', '스트레스 없음']
    },
    { 
      value: 'packed',
      label: '빽빽한 여행',
      icon: 'mdi-timer',
      description: '알차게 꽉꽉 채우는 여행',
      details: '다양한 활동과 관광지를 최대한 많이 경험할 수 있는 일정으로 구성됩니다.',
      features: ['다양한 활동', '알찬 일정', '많은 경험', '효율적 동선']
    },
  ]
  
  const selectedStyle = ref(typeof props.data === 'string' ? props.data : null)
  
  // 선택된 스타일 정보 반환
  const getSelectedStyleInfo = () => {
    return travelStyles.find(style => style.value === selectedStyle.value)
  }
  
  function selectStyle(style) {
    console.log('Step5 selectStyle called:', style)
    selectedStyle.value = style
    console.log('Step5 emitting style:', selectedStyle.value)
    emit('update', selectedStyle.value)
  }
  
  // props 변경 감시
  watch(() => props.data, (newData) => {
    console.log('Step5 props.data changed:', newData, typeof newData)
    selectedStyle.value = typeof newData === 'string' ? newData : null
  })
  </script>
  
  <style scoped>
  .style-step {
    max-width: 100%;
  }
  
  .selection-card {
    height: 100%;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    cursor: pointer;
  }
  
  .selection-card:hover {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }
  
  .selection-card.selected {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
  
  .style-card {
    min-height: 240px;
    position: relative;
  }
  
  .style-features {
    margin-top: 12px;
  }
  
  .selected-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
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
  
  :deep(.v-chip) {
    font-weight: 500;
  }
  </style>