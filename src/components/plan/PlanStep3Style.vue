<template>
    <div>
        <v-radio-group v-model="style" label="여행 스타일을 선택하세요">
            <v-radio label="빽빽하게 (많은 장소 방문)" value="tight" />
            <v-radio label="널널하게 (여유롭게 휴식)" value="relaxed" />
        </v-radio-group>
        <div class="d-flex justify-space-between mt-4">
            <v-btn variant="outlined" @click="$emit('back')">이전</v-btn>
            <v-btn color="primary" :disabled="!style" @click="nextStep">완료</v-btn>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ style: String })
const emit = defineEmits(['next', 'back'])
const style = ref(props.style || '')

function nextStep() {
    emit('next', style.value)
}
</script>