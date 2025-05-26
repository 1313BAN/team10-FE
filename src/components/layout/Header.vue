<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title>SSAFY Trip</v-toolbar-title>
    <v-spacer />
    <v-btn to="/" variant="text">Home</v-btn>
    <v-btn to="/login" variant="text" v-if="!authStore.user">Login</v-btn>
    <v-btn to="/plan/create" variant="text">Plan Create</v-btn>
    <v-btn to="/schedule" variant="text">Schedule</v-btn>
    <v-btn to="/myPage" variant="text" v-if="authStore.user">MyPage</v-btn>
    <v-btn v-if="authStore.user" variant="text" color="error" @click="logout">Logout</v-btn>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.clearUser()
  router.push('/')
}
</script>

<style scoped>
/* 헤더 관련 스타일 삭제됨 */
</style>
