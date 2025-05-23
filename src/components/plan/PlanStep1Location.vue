<template>
    <div>
        <v-select v-model="area" :items="areas" item-title="name" item-value="code" label="도/시 선택" autocomplete="off"
            class="mb-4" />
        <v-select v-model="sigungu" :items="sigunguItems" item-title="name" item-value="code" label="시/군 선택"
            :disabled="!area" autocomplete="off" class="mb-4" />
        <div class="d-flex justify-end">
            <v-btn color="primary" :disabled="!area || !sigungu" @click="nextStep">다음</v-btn>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useAreaStore } from '@/stores/area'

const props = defineProps({ location: Object })
const emit = defineEmits(['next'])

const areaStore = useAreaStore()
const area = ref('')
const sigungu = ref('')

// 가져온 전체 데이터
const areas = computed(() => areaStore.areas)
const sigunguMap = areaStore.sigunguMap


// 선택된 도/시 기준 시/군 배열 추출
const sigunguItems = computed(() => {
    return sigunguMap[area.value] || []
})

onMounted(() => {
    areaStore.fetchAreas()
    console.log(areaStore.areas)
})

watch(area, (code) => {
    if (code) {
        areaStore.fetchSigungu(code)
        sigungu.value = '' // 선택 초기화
    }
})

function nextStep() {
    emit('next', { area: area.value, sigungu: sigungu.value })
}
</script>