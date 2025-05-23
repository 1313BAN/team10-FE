<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
const dates = ref(['', '']) // 반드시 배열!
const authStore = useAuthStore()
console.log(authStore.user)
</script>

<template>
  <div class="ocean-bg-container">
    <video autoplay loop muted playsinline class="ocean-bg-video">
      <source
        src="https://static.videezy.com/system/resources/previews/000/050/624/original/underwater-ocean-waves-flow-with-light-effects.mp4"
        type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div class="ocean-bg-overlay"></div>
    <main class="ocean-bg-content">
      <div>
        <h1>홈페이지</h1>
        <div v-if="authStore.user">
          <p>환영합니다, {{ authStore.user.name }}님!</p>
        </div>
        <div v-else>
          <p>로그인 해주세요.</p>
        </div>
      </div>
    </main>
  </div>
  <v-app>
    <v-main>
      <v-container>
        <v-date-picker v-model="dates" range color="primary" show-adjacent-months />
        <div class="mt-4">
          선택된 기간: {{ dates[0] }} ~ {{ dates[1] }}
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.ocean-bg-container {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
}

.ocean-bg-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
}

.ocean-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 40, 80, 0.3);
  z-index: 1;
}

.ocean-bg-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #fff;
  text-shadow: 0 2px 8px #000a;
}
</style>
