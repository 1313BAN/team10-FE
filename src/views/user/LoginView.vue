<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/api/auth';
import { useAuthStore } from '@/stores/auth'

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    const res = await login(email.value, password.value);

    // 200 OK인 경우
    if (res.status === 200) {
      authStore.setUser(res.data.user);  // ✅ 응답에서 user 정보 저장
      console.log(res.data)
      console.log(authStore.user)
      router.push('/');  // 홈으로 이동
    }
  } catch (err) {
    // ❗에러 응답에서 메시지 추출
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message;
    } else {
      errorMessage.value = '로그인 중 문제가 발생했습니다.';
    }
    console.error(err);
  }
};
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center" style="max-width: 600px;">
    <v-card elevation="10" width="100%" class="pa-8" rounded>
      <v-card-title class="text-h5 font-weight-bold mb-4 text-center">로그인</v-card-title>
      <v-form @submit.prevent="handleLogin">
        <v-text-field v-model="email" label="이메일" prepend-inner-icon="mdi-email" type="email" variant="outlined"
          density="comfortable" class="mb-4" required />
        <v-text-field v-model="password" label="비밀번호" prepend-inner-icon="mdi-lock" type="password" variant="outlined"
          density="comfortable" class="mb-4" required />
        <v-btn type="submit" color="primary" block size="large" class="mb-2">로그인</v-btn>
        <v-btn to="/register" variant="text" block class="mt-2">회원가입</v-btn>
        <v-alert v-if="errorMessage" type="error" dense class="mt-2">{{ errorMessage }}</v-alert>
      </v-form>
    </v-card>
  </v-container>
</template>
