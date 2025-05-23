import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAreas, getSigungu } from '@/api/area'

export const useAreaStore = defineStore('area', () => {
  // 도/시 리스트
  const areas = ref([])
  const sigunguMap = ref({})

  // 도/시 리스트 불러오기
  async function fetchAreas() {
    if (areas.value.length > 0) return
    try {
      const res = await getAreas()
      areas.value = res.data
    } catch (e) {
      console.error('도/시 리스트 불러오기 실패:', e)
    }
  }

  // 시/군구 리스트 불러오기
  async function fetchSigungu(areaCode) {
    if (!areaCode) return
    if (sigunguMap.value[areaCode]) return
    try {
      const res = await getSigungu(areaCode)
      sigunguMap.value[areaCode] = res.data
    } catch (e) {
      console.error('시/군구 리스트 불러오기 실패:', e)
    }
  }

  return {
    areas,
    sigunguMap,
    fetchAreas,
    fetchSigungu,
  }
})