<template>
    <div>
        <!-- 선택된 날짜 표시 영역 -->
        <div class="mb-4">
            <v-row>
                <v-col cols="6">
                    <v-card variant="outlined" class="pa-4 text-center" :class="{ 'border-primary': dateRange.start }">
                        <div class="text-subtitle-2 text-grey-600 mb-1">시작 날짜</div>
                        <div class="text-h6" :class="dateRange.start ? 'text-primary' : 'text-grey-400'">
                            {{ dateRange.start ? formatDate(dateRange.start) : '날짜 선택' }}
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card variant="outlined" class="pa-4 text-center" :class="{ 'border-primary': dateRange.end }">
                        <div class="text-subtitle-2 text-grey-600 mb-1">마지막 날짜</div>
                        <div class="text-h6" :class="dateRange.end ? 'text-primary' : 'text-grey-400'">
                            {{ dateRange.end ? formatDate(dateRange.end) : '날짜 선택' }}
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <!-- 날짜 선택기 (헤더 숨김) -->
        <v-date-picker v-model="selectedDates" multiple color="primary" show-adjacent-months :min="minDate"
            class="mb-4 custom-date-picker" @update:model-value="handleDateChange" hide-header />

        <!-- 선택 상태 안내 -->
        <div v-if="selectionStep === 1" class="text-center mb-4">
            <v-alert type="info" variant="tonal" color="primary" class="text-body-2">
                📅 시작 날짜를 선택하세요
            </v-alert>
        </div>
        <div v-else-if="selectionStep === 2" class="text-center mb-4">
            <v-alert type="info" variant="tonal" color="primary" class="text-body-2">
                📅 마지막 날짜를 선택하세요
            </v-alert>
        </div>
        <div v-else-if="selectionStep === 3" class="text-center mb-4">
            <v-alert type="success" variant="tonal" color="success" class="text-body-2">
                ✅ 날짜 선택 완료! 다른 날짜를 선택하면 처음부터 다시 선택됩니다.
            </v-alert>
        </div>

        <!-- 초기화 버튼 -->
        <div class="text-center mb-4" v-if="dateRange.start || dateRange.end">
            <v-btn variant="outlined" size="small" @click="resetSelection">
                <v-icon start>mdi-refresh</v-icon>
                날짜 선택 초기화
            </v-btn>
        </div>

        <div class="d-flex justify-space-between mt-4">
            <v-btn variant="outlined" @click="$emit('back')">이전</v-btn>
            <v-btn color="primary" :disabled="!dateRange.start || !dateRange.end" @click="nextStep">
                다음
            </v-btn>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
    dates: {
        type: Object,
        default: () => ({ start: '', end: '' })
    }
})

const emit = defineEmits(['next', 'back'])

const today = new Date().toISOString().slice(0, 10)
const minDate = today

// 선택된 날짜들을 배열로 관리
const selectedDates = ref([])

// 시작일과 종료일을 관리하는 객체
const dateRange = ref({
    start: props.dates?.start || '',
    end: props.dates?.end || ''
})

// 선택 단계 (1: 시작일 선택, 2: 종료일 선택, 3: 완료)
const selectionStep = ref(1)

// props에서 초기값 설정
if (props.dates?.start && props.dates?.end) {
    selectedDates.value = [props.dates.start, props.dates.end]
    selectionStep.value = 3
}

// 날짜 변경 핸들러 - 날짜 정렬 명확하게 처리
async function handleDateChange(dates) {
    if (!dates || dates.length === 0) {
        dateRange.value = { start: '', end: '' }
        selectionStep.value = 1
        return
    }

    const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b)) // ✅ 날짜 기준 정렬

    if (selectionStep.value === 3 && dates.length >= 3) {
        const previousDates = selectedDates.value
        const newDate = dates.find(date => !previousDates.includes(date))
        if (newDate) {
            selectedDates.value = []
            await nextTick()
            selectedDates.value = [newDate]
            dateRange.value = { start: newDate, end: '' }
            selectionStep.value = 2
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
}


// 선택 초기화
function resetSelection() {
    selectedDates.value = []
    dateRange.value = { start: '', end: '' }
    selectionStep.value = 1
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    })
}

// 다음 단계로
function nextStep() {
    if (dateRange.value.start && dateRange.value.end) {
        emit('next', {
            start: dateRange.value.start,
            end: dateRange.value.end
        })
    }
}
</script>

<style scoped>
/* 날짜 선택기 헤더 숨김 */
.custom-date-picker :deep(.v-date-picker-header) {
    display: none;
}

/* 카드 보더 강조 */
.border-primary {
    border-color: rgb(var(--v-theme-primary)) !important;
    border-width: 2px !important;
}

/* 날짜 선택기 스타일 개선 */
.custom-date-picker {
    box-shadow: none;
}

.custom-date-picker :deep(.v-date-picker) {
    box-shadow: none;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 8px;
}
</style>