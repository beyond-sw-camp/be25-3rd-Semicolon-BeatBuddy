<template>
  <div class="login-container">
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
      <v-form ref="formRef">
        <div class="input-group">
        <label>아이디</label>
        <v-text-field
          v-model="email"
          placeholder="아이디를 입력하세요"
          :rules="emailRules"       
          hide-details="auto"
          variant="solo"
          flat
          bg-color="#f0f0f0"
          density="compact"
          rounded="lg"/>
        </div>
      </v-form>

      <div class="input-group">
        <v-form>
          <label>비밀번호</label>
          <v-text-field
            v-model="password"
            placeholder="비밀번호를 입력하세요"
            :type="showPassword ? 'text' : 'password'"           
            variant="solo"
            flat
            bg-color="#f0f0f0"
            hide-details
            density="compact"
            rounded="lg">
            <template #append-inner>
              <v-icon
                :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                class="me-2" 
                @click="showPassword = !showPassword"/>
            </template>
          </v-text-field>
        </v-form>  
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
        :disabled="isLoginDisabled || isLoading"
        @click="handleLogin"
      >
        로그인 하기
      </v-btn>

      <div class="links">
        <span @click="showFindEmail = true">아이디 찾기</span>
        <span class="divider">|</span>
        <RouterLink to="/find-password">비밀번호 찾기</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/register">회원가입 하기</RouterLink>
      </div>
    </div>
    <FindEmailModal v-model="showFindEmail" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { login } from "@/api/auth";
import FindEmailModal from '@/views/auth/FindEmailModal.vue'

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const formRef = ref(null)
const showFindEmail = ref(false)

const emailRules = [
  v => !!v || '이메일을 입력해주세요.',
  v => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다.',
];

const isLoginDisabled = computed(() => !/.+@.+\..+/.test(email.value));

async function handleLogin() {
  errorMessage.value = "";
  const { valid } = await formRef.value.validate()  // 추가
  if (!valid) return  // 유효성 검사 실패하면 중단

  isLoading.value = true;

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
    const status = error.response?.status
    const message = error.response?.data?.message

    if (message === '탈퇴한 계정입니다.') {
      errorMessage.value = '탈퇴한 계정입니다.'
    } else if (status === 404 || status === 401) {
      errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    } else {
      errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center; /* 세로 방향 중앙 정렬 */
  min-height: 100vh;       /* 화면 전체 높이를 차지하게 함 */
  padding: 24px;           /* 상단 br 대신 적절한 패딩 */
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
  color: #ff5252;
  font-size: 13px;
  text-align: center;
  margin: 0;
}

:deep(.v-messages__message),
:deep(.v-field__message) {
  color: #ff5252 !important;
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

.links span {
  font-size: 13px;
  color: #757575;
  cursor: pointer;
}

.divider {
  color: #e0e0e0;
}

:deep(.v-field__input) {
  padding-left: 10px !important;
}

:deep(.v-field__append-inner) {
  padding-right: 16px !important;
  align-items: center;
}
</style>
