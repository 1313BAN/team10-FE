<template>
    <v-form @submit.prevent="handleRegister">
        <v-text-field v-model="nickname" label="닉네임" required class="mb-3" />
        <v-text-field v-model="email" label="이메일" type="email" required class="mb-3" />
        <v-text-field v-model="password" label="비밀번호" type="password" required class="mb-3" />
        <v-text-field v-model="name" label="이름" required class="mb-3" />
        <v-btn type="submit" color="primary" block>회원가입</v-btn>
        <v-alert v-if="errorMessage" type="error" class="mt-2">{{ errorMessage }}</v-alert>
    </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'

const email = ref('')
const password = ref('')
const nickname = ref('')
const name = ref('')
const errorMessage = ref('')
const router = useRouter()

const handleRegister = async () => {
    try {
        const res = await register({
            email: email.value,
            password: password.value,
            name: name.value,
            username: nickname.value
        });
        if (res.status === 200) {
            router.push('/login'); // 가입 성공 시 로그인 페이지로 이동
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage.value = err.response.data.message; // 서버가 보내준 메시지 그대로 출력
        } else {
            errorMessage.value = '회원가입 실패: 입력값을 확인해주세요.';
        }
        console.error(err);
    }
};

</script>