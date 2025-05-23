<template>
    <v-container class="fill-height d-flex align-center justify-center" style="max-width: 600px;">
        <v-card elevation="10" width="100%" class="pa-8" rounded>
            <v-card-title class="text-h5 font-weight-bold mb-4 text-center">회원가입</v-card-title>
            <UserRegisterForm />
        </v-card>
    </v-container>
</template>

<script setup>
import UserRegisterForm from '@/components/user/UserRegisterForm.vue'
</script>