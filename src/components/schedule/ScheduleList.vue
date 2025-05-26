<template>
    <v-card elevation="2">
      <v-card-title>
        <v-icon left>mdi-format-list-bulleted</v-icon>
        여행 일정
      </v-card-title>
      
      <v-card-text class="pa-0">
        <v-expansion-panels v-model="expandedPanels" multiple>
          <v-expansion-panel
            v-for="day in itinerary"
            :key="day.id"
            elevation="0"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-chip color="primary" size="small" class="mr-2">
                  Day {{ day.day }}
                </v-chip>
                <span class="text-body-2 text-grey">{{ formatDate(day.date) }}</span>
              </div>
            </v-expansion-panel-title>
            
            <v-expansion-panel-text>
              <v-timeline dense align-top>
                <v-timeline-item
                  v-for="place in day.places"
                  :key="place.id"
                  :dot-color="selectedPlaceId === place.id ? 'primary' : 'grey'"
                  size="small"
                >
                  <v-card 
                    :class="{ 'selected-place': selectedPlaceId === place.id }"
                    @click="$emit('select-place', place.id)"
                    hover
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex justify-space-between align-start">
                        <div>
                          <div class="d-flex align-center mb-1">
                            <v-icon 
                              v-if="place.fixed" 
                              size="small" 
                              color="orange"
                              class="mr-1"
                            >
                              mdi-pin
                            </v-icon>
                            <strong>{{ place.name }}</strong>
                          </div>
                          <div class="text-caption text-grey mb-1">
                            <v-icon size="x-small">mdi-clock-outline</v-icon>
                            {{ place.time }} ({{ place.duration }}분)
                          </div>
                          <div class="text-body-2">{{ place.description }}</div>
                        </div>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                        >
                          <v-icon>mdi-map-marker</v-icon>
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    itinerary: {
      type: Array,
      required: true
    },
    selectedPlaceId: {
      type: String,
      default: null
    }
  })
  
  const emit = defineEmits(['select-place'])
  
  // 확장된 패널 상태
  const expandedPanels = ref([0])
  
  // 선택된 장소가 변경되면 해당 날짜의 패널을 확장
  watch(() => props.selectedPlaceId, (newId) => {
    if (newId) {
      props.itinerary.forEach((day, index) => {
        if (day.places.some(place => place.id === newId)) {
          if (!expandedPanels.value.includes(index)) {
            expandedPanels.value.push(index)
          }
        }
      })
    }
  })
  
  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { month: 'long', day: 'numeric', weekday: 'short' }
    return date.toLocaleDateString('ko-KR', options)
  }
  </script>
  
  <style scoped>
  .selected-place {
    border: 2px solid rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
  
  .v-card {
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .v-expansion-panel-text {
    padding: 0 16px 16px;
  }
  
  :deep(.v-timeline--dense .v-timeline-item__body) {
    max-width: 100%;
  }
  </style>