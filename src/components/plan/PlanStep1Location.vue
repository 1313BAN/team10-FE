<template>
    <div class="location-step">
      <div class="text-h6 mb-4">여행 지역 선택</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        먼저 도/시를 선택하신 후, 구체적인 시/군/구를 선택해주세요.
      </div>
      
      <v-row>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="selection-card">
            <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
              <v-icon class="mr-2" color="primary">mdi-map</v-icon>
              도/시 선택
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="area"
                :items="areas"
                item-title="name"
                item-value="code"
                label="도/시를 선택하세요"
                placeholder="예: 서울특별시, 경기도..."
                variant="outlined"
                density="comfortable"
                :loading="areaStore.loading"
                autocomplete="off"
                prepend-inner-icon="mdi-map-marker-outline"
                hide-details="auto"
                :error-messages="areaError"
                @update:model-value="handleAreaSelect"
              />
            </v-card-text>
          </v-card>
        </v-col>
  
        <v-col cols="12" md="6">
          <v-card 
            variant="outlined" 
            class="selection-card"
            :class="{ 'card-disabled': !area }"
          >
            <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
              <v-icon class="mr-2" :color="area ? 'primary' : 'grey'">mdi-map-marker-radius</v-icon>
              시/군/구 선택
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="sigungu"
                :items="sigunguItems"
                item-title="name"
                item-value="code"
                label="시/군/구를 선택하세요"
                placeholder="세부 지역을 선택해주세요"
                variant="outlined"
                density="comfortable"
                :disabled="!area"
                :loading="areaStore.loadingSigungu"
                autocomplete="off"
                prepend-inner-icon="mdi-map-marker-radius-outline"
                hide-details="auto"
                :error-messages="sigunguError"
              >
                <template #selection="{ item }">
                  <div class="d-flex align-center">
                    <v-chip 
                      :color="item.value === 'ALL' ? 'success' : 'info'" 
                      size="small" 
                      class="mr-2"
                    >
                      {{ item.title }}
                    </v-chip>
                  </div>
                </template>
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" class="location-item">
                    <template #prepend>
                      <v-avatar 
                        size="small" 
                        :color="item.value === 'ALL' ? 'success' : 'info'" 
                        class="mr-3"
                      >
                        <v-icon size="16">
                          {{ item.value === 'ALL' ? 'mdi-check-all' : 'mdi-map-marker-radius' }}
                        </v-icon>
                      </v-avatar>
                    </template>
                    <template #append v-if="item.value === 'ALL'">
                      <v-chip color="success" size="x-small" variant="outlined">
                        전체
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
                <template #no-data>
                  <div class="text-center pa-4">
                    <v-icon color="grey" size="48" class="mb-2">mdi-map-marker-off-outline</v-icon>
                    <div class="text-body-2 text-medium-emphasis">
                      먼저 도/시를 선택해주세요
                    </div>
                  </div>
                </template>
              </v-select>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 선택된 정보 미리보기 -->
      <v-expand-transition>
        <v-card 
          v-if="area && sigungu" 
          variant="tonal" 
          color="success" 
          class="mt-6 selection-preview"
        >
          <v-card-text class="py-4">
            <div class="d-flex align-center">
              <v-icon color="success" class="mr-3">mdi-map-check</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-medium">선택된 여행 지역</div>
                <div class="text-h6 font-weight-bold mt-1">
                  {{ getSelectedLocationName() }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed, onMounted } from 'vue'
  import { useAreaStore } from '@/stores/area'
  
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({})
    }
  })
  
  const emit = defineEmits(['update'])
  
  const areaStore = useAreaStore()
  const area = ref(props.data?.areaCode || '')
  const sigungu = ref(props.data?.sigunguCode || '')
  
  // 에러 메시지
  const areaError = ref('')
  const sigunguError = ref('')
  
  // 전체 선택이 가능한 areaCode 목록
  const specialAreaCodes = [1, 2, 3, 4, 5, 6, 7] // 예시 코드, 실제 코드로 교체 필요
  
  // 가져온 전체 데이터
  const areas = computed(() => areaStore.areas)
  const sigunguMap = areaStore.sigunguMap
  
  // 선택된 도/시 기준 시/군 배열 추출
  const sigunguItems = computed(() => {
    const items = sigunguMap[area.value] || []
    // 특정 areaCode인 경우 전체 선택 옵션 추가
    if (specialAreaCodes.includes(area.value)) {
      return [{ name: '전체 선택', code: 'ALL' }, ...items]
    }
    return items
  })
  
  // 선택된 지역명 반환
  function getSelectedLocationName() {
    const areaName = areas.value.find(a => a.code === area.value)?.name || ''
    const sigunguName = sigunguItems.value.find(s => s.code === sigungu.value)?.name || ''
    
    if (sigungu.value === 'ALL') {
      return `${areaName} 전체`
    }
    return `${areaName} ${sigunguName}`
  }
  
  // 직접 이벤트 핸들러
  function handleAreaSelect(value) {
    area.value = value
    if (value) {
      areaStore.fetchSigungu(value)
      sigungu.value = ''
      areaError.value = ''
    }
    // 여기서만 updateData 호출
    updateData()
  }
  
  // 시군구 선택 핸들러도 추가
  function handleSigunguSelect(value) {
    sigungu.value = value
    if (value) {
      sigunguError.value = ''
    }
    // 여기서 updateData 호출
    updateData()
  }
  
  // 데이터 업데이트 함수 - area만 있어도 전달
  function updateData() {
    if (area.value) {
      const locationData = {
        areaCode: area.value,
        sigunguCode: sigungu.value || null, // 빈 문자열이면 null
        areaName: areas.value.find(a => a.code === area.value)?.name,
        sigunguName: sigungu.value ? (sigungu.value === 'ALL' ? '전체' : sigunguItems.value.find(s => s.code === sigungu.value)?.name) : null,
        displayName: sigungu.value ? getSelectedLocationName() : areas.value.find(a => a.code === area.value)?.name
      }
      emit('update', locationData)
    } else {
      emit('update', {})
    }
  }
  
  // 라이프사이클 - 더 단순하게
  onMounted(() => {
    areaStore.fetchAreas()
    
    // props에서 초기값 설정
    if (props.data?.areaCode) {
      area.value = props.data.areaCode
      if (props.data.sigunguCode) {
        sigungu.value = props.data.sigunguCode
      }
    }
  })
  
  // 감시자 - sigungu watch 추가
  watch(area, (code) => {
    if (code) {
      areaStore.fetchSigungu(code)
      sigungu.value = '' // 선택 초기화
      areaError.value = ''
    }
    // area 변경 시에만 updateData 호출 (sigungu 초기화 때문에)
  })
  
  watch(sigungu, () => {
    if (sigungu.value) {
      sigunguError.value = ''
    }
    // sigungu 변경 시에는 항상 updateData 호출
    updateData()
  })
  
  // props 변경 감시 - 반응성 문제 해결
  watch(() => props.data, (newData, oldData) => {
    // 무한 루프 방지: 실제로 값이 다를 때만 업데이트
    if (newData && newData !== oldData) {
      if (newData.areaCode && newData.areaCode !== area.value) {
        area.value = newData.areaCode
      }
      if (newData.sigunguCode && newData.sigunguCode !== sigungu.value) {
        sigungu.value = newData.sigunguCode
      }
    }
  }, { deep: true, immediate: true })
  </script>
  
  <style scoped>
  .location-step {
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
  
  .location-item {
    transition: background-color 0.2s ease;
  }
  
  .location-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
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
  :deep(.v-select__menu-icon) {
    color: rgb(var(--v-theme-primary));
  }
  
  :deep(.v-field--focused) {
    border-color: rgb(var(--v-theme-primary)) !important;
  }
  
  :deep(.v-chip) {
    font-weight: 500;
  }
  </style>