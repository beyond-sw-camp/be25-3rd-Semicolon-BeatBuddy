<template>
  <div class="login-container">
    <br><br>
    <!-- 로고 -->
    <div class="logo-section">
      <div class="logo-icon">
        <span class="mdi mdi-music-note-eighth"></span>
      </div>
      <h1 class="logo-title">BeatBuddy</h1>
      <p class="logo-subtitle">음악 취향으로 만나는 친구</p>
    </div>

    <!-- 폼 -->
    <div class="form-section">
        <div class="input-group">
        <label>아이디</label>
        <v-text-field
          v-model="email"
          placeholder="아이디를 입력하세요"
          variant="solo"
          flat
          bg-color="#f0f0f0"
          hide-details
          density="compact"
          rounded="lg"
        />
      </div>

      <div class="input-group">
        <label>비밀번호</label>
        <v-text-field
          v-model="password"
          placeholder="비밀번호를 입력하세요"
          type="password"
          variant="solo"
          flat
          bg-color="#f0f0f0"
          hide-details
          density="compact"
          rounded="lg"
        />
      </div>

      <!-- 에러 메시지 -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <v-btn
        color="primary"
        block
        size="large"
        rounded="lg"
        class="login-btn"
        :loading="isLoading"
        @click="handleLogin"
      >
        로그인 하기
      </v-btn>

      <div class="links">
        <RouterLink to="/find-email">아이디 찾기</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/find-password">비밀번호 찾기</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/register">회원가입 하기</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { login } from "@/api/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await login(email.value, password.value);
    const result = response.data.result;

    authStore.setToken(result.accessToken);
    authStore.setUser({
      userId: result.userId,
      email: result.email,
      nickname: result.nickname,
    });

    router.push("/");
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "로그인에 실패했습니다.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  padding: 60px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: var(--color-primary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon .mdi {
  font-size: 40px;
  color: white;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #333333;
}

.logo-subtitle {
  font-size: 14px;
  color: #9e9e9e;
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

.login-btn {
  margin-top: 8px;
}

.error-message {
  color: #f44336;
  font-size: 13px;
  text-align: center;
  margin: 0;
}

.links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.links a {
  font-size: 13px;
  color: #757575;
  text-decoration: none;
}

.divider {
  color: #e0e0e0;
}

:deep(.v-field__input) {
  padding-left: 10px !important;
}
</style>
