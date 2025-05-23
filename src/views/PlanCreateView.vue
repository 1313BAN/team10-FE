<template>
    <v-container class="py-8">
        <v-card max-width="500" class="mx-auto pa-6">
            <div class="d-flex align-center mb-4">
                <span class="font-weight-bold mr-2">여행 계획 생성</span>
                <span class="ml-auto">{{ step }}/3</span>
            </div>
            <v-progress-linear :value="step * 33.33" height="8" color="primary" class="mb-6" rounded />
            <v-slide-x-transition mode="out-in">
                <component :is="currentStepComponent" :key="step" v-bind="stepProps" @next="handleNext"
                    @back="handleBack" />
            </v-slide-x-transition>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import PlanStep1Location from '@/components/plan/PlanStep1Location.vue'
import PlanStep2Date from '@/components/plan/PlanStep2Date.vue'
import PlanStep3Style from '@/components/plan/PlanStep3Style.vue'

const step = ref(1)
const location = ref({ province: '', city: '' })
const dates = ref({ start: '', end: '' })
const style = ref('')

const currentStepComponent = computed(() => {
    if (step.value === 1) return PlanStep1Location
    if (step.value === 2) return PlanStep2Date
    if (step.value === 3) return PlanStep3Style
})

const stepProps = computed(() => {
    if (step.value === 1) return { location: location.value }
    if (step.value === 2) return { dates: dates.value }
    if (step.value === 3) return { style: style.value }
    return {}
})

function handleNext(payload) {
    if (step.value === 1) location.value = payload
    if (step.value === 2) dates.value = payload
    if (step.value === 3) style.value = payload
    if (step.value < 3) step.value++
    // step 3에서 완료 시, 최종 데이터 처리(예: API 호출 등)
}

function handleBack() {
    if (step.value > 1) step.value--
}
</script>