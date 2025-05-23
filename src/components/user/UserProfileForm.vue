<template>
    <v-form @submit.prevent="handleUpdate">
        <v-text-field v-model="nickname" label="닉네임" class="mb-3" />
        <v-text-field v-model="email" label="이메일" disabled class="mb-3" />
        <v-text-field v-model="password" label="패스워드" class="mb-3" />
        <v-text-field v-model="name" label="이름" class="mb-3" />
        <v-btn type="submit" color="primary" block>정보 수정</v-btn>
        <v-btn @click="handleDelete" block>회원 탈퇴</v-btn>
        <v-alert v-if="success" type="success" class="mt-2">수정되었습니다!</v-alert>
    </v-form>

</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { deleteUser, updateUser } from '@/api/auth'

const authStore = useAuthStore()
const router = useRouter()
const email = ref(authStore.user?.email || '')
const nickname = ref(authStore.user?.username || '')
const password = ref(authStore.user?.password || '')
const name = ref(authStore.user?.name || '')
const success = ref(false)

const errorMessage = ref('')

const handleUpdate = async () => {
    console.log(authStore.user)
    try {
        const res = await updateUser({ id: authStore.user.id, username: nickname.value, email: email.value, password: password.value, name: name.value })
        if (res.status === 200) {
            authStore.setUser(res.data.user)
            success.value = true
            errorMessage.value = ''
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage.value = err.response.data.message; // 서버가 보내준 메시지 그대로 출력
        } else {
            errorMessage.value = '회원정보 수정 실패: 다시 시도해주세요.';
        }
        success.value = false
        console.error(err);
    }
}

const handleDelete = async () => {
    const confirmed = window.confirm('정말로 탈퇴하시겠습니까?')

    if (!confirmed) return

    try {
        const res = await deleteUser()
        if (res.status === 200) {
            authStore.clearUser()
            router.push('/')
        }
    } catch (err) {
        console.error('회원 탈퇴 실패:', err)
    }
}

</script>