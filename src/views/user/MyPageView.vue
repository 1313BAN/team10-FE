<template>
    <v-container class="fill-height d-flex align-center justify-center" style="max-width: 600px;">
        <v-card elevation="10" width="100%" class="pa-8" rounded>
            <v-card-title class="text-h5 font-weight-bold mb-4 text-center">내 정보</v-card-title>
            <UserProfileForm />
        </v-card>
    </v-container>
</template>

<script setup>
import UserProfileForm from '@/components/user/UserProfileForm.vue'
</script>