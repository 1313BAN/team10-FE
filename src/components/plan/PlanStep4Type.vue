<template>
    <div class="type-step">
      <div class="text-h6 mb-4">여행 타입 선택</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        선호하는 여행 타입을 여러 개 선택해주세요.
      </div>
  
      <!-- 전체 선택 카드 -->
      <v-card
        variant="outlined"
        class="selection-card mb-4 all-select-card"
        :class="{ 'selected': isAllSelected }"
        @click="toggleType('all')"
      >
        <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
          <v-icon class="mr-2" :color="isAllSelected ? 'primary' : 'grey'">mdi-check-all</v-icon>
          전체 선택
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis">
            모든 여행 타입을 한 번에 선택할 수 있습니다
          </div>
          <div v-if="isAllSelected" class="mt-2">
            <v-chip color="primary" size="small" variant="flat">
              {{ travelTypes.length }}개 타입 선택됨
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
  
      <!-- 여행 타입 그리드 -->
      <v-row>
        <v-col v-for="type in travelTypes" :key="type.value" cols="12" sm="6" md="4">
          <v-card
            variant="outlined"
            class="selection-card type-card"
            :class="{ 'selected': selectedTypes.includes(type.value) }"
            @click="toggleType(type.value)"
          >
            <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
              <v-icon 
                class="mr-2" 
                :color="selectedTypes.includes(type.value) ? 'primary' : 'grey'"
              >
                {{ type.icon }}
              </v-icon>
              {{ type.label }}
            </v-card-title>
            <v-card-text>
              <div class="text-body-2 text-medium-emphasis mb-2">
                {{ type.description || '다양한 ' + type.label + ' 관련 장소를 추천해드립니다' }}
              </div>
              <div v-if="selectedTypes.includes(type.value)" class="selected-indicator">
                <v-chip color="primary" size="small" variant="flat">
                  <v-icon start size="16">mdi-check</v-icon>
                  선택됨
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 선택된 타입 미리보기 -->
      <v-expand-transition>
        <v-card 
          v-if="selectedTypes.length > 0 && !isAllSelected" 
          variant="tonal" 
          color="success" 
          class="mt-6 selection-preview"
        >
          <v-card-text class="py-4">
            <div class="d-flex align-center">
              <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-medium">선택된 여행 타입</div>
                <div class="text-h6 font-weight-bold mt-1">
                  {{ getSelectedTypesText() }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  총 {{ selectedTypes.length }}개 타입 선택
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
  
      <!-- 전체 선택 미리보기 -->
      <v-expand-transition>
        <v-card 
          v-if="isAllSelected" 
          variant="tonal" 
          color="info" 
          class="mt-6 selection-preview"
        >
          <v-card-text class="py-4">
            <div class="d-flex align-center">
              <v-icon color="info" class="mr-3">mdi-check-all</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-medium">모든 여행 타입 선택됨</div>
                <div class="text-h6 font-weight-bold mt-1">
                  관광지, 문화시설, 축제, 레포츠, 쇼핑, 맛집, 카페
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  다양한 여행 경험을 제공해드립니다
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
    }
  })
  
  const emit = defineEmits(['update'])
  
  const travelTypes = [
    { 
      value: 'attraction', 
      label: '관광지', 
      icon: 'mdi-map-marker',
      description: '유명한 관광 명소와 자연 경관'
    },
    { 
      value: 'culture', 
      label: '문화시설', 
      icon: 'mdi-palette',
      description: '박물관, 미술관, 전시관 등'
    },
    { 
      value: 'festival', 
      label: '축제/공연/행사', 
      icon: 'mdi-party-popper',
      description: '지역 축제와 다양한 공연'
    },
    { 
      value: 'leisure', 
      label: '레포츠', 
      icon: 'mdi-bike',
      description: '액티비티와 스포츠 활동'
    },
    { 
      value: 'shopping', 
      label: '쇼핑', 
      icon: 'mdi-shopping',
      description: '쇼핑몰, 전통시장, 특산품'
    },
    { 
      value: 'restaurant', 
      label: '맛집', 
      icon: 'mdi-food',
      description: '지역 특색 음식과 유명 맛집'
    },
    { 
      value: 'cafe', 
      label: '카페', 
      icon: 'mdi-coffee',
      description: '감성 카페와 디저트 명소'
    }
  ]
  
  const selectedTypes = ref(Array.isArray(props.data) ? [...props.data] : [])
  
  const isAllSelected = computed(() => selectedTypes.value.length === travelTypes.length)
  
  // 선택된 타입들의 텍스트 반환
  const getSelectedTypesText = () => {
    return selectedTypes.value
      .map(value => travelTypes.find(type => type.value === value)?.label)
      .filter(Boolean)
      .join(', ')
  }
  
  function toggleType(type) {
    if (type === 'all') {
      if (isAllSelected.value) {
        selectedTypes.value = []
      } else {
        selectedTypes.value = travelTypes.map(t => t.value)
      }
    } else {
      const index = selectedTypes.value.indexOf(type)
      if (index === -1) {
        selectedTypes.value.push(type)
      } else {
        selectedTypes.value.splice(index, 1)
      }
    }
    
    emit('update', selectedTypes.value)
  }
  
  // props 변경 감시
  watch(() => props.data, (newData) => {
    if (Array.isArray(newData)) {
      selectedTypes.value = [...newData]
    }
  }, { deep: true })
  </script>
  
  <style scoped>
  .type-step {
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
  
  .all-select-card {
    border-style: dashed;
    min-height: 100px;
  }
  
  .all-select-card.selected {
    border-style: solid;
    background-color: rgba(var(--v-theme-primary), 0.08);
  }
  
  .type-card {
    min-height: 140px;
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