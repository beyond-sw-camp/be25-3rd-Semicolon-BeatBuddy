<template>
  <div class="login-container">
    <div class="logo-section">
      <div class="logo-icon">
        <span class="mdi mdi-music-note-eighth"></span>
      </div>
      <h1 class="logo-title">BeatBuddy</h1>
      <p class="logo-subtitle">음악 취향으로 만나는 친구</p>
    </div>

    <v-form ref="formRef" class="form-section" @submit.prevent="handleLogin">
      <div class="input-group">
        <label>이메일</label>
        <v-text-field
          v-model="email"
          placeholder="이메일을 입력하세요"
          :rules="emailRules"
          hide-details="auto"
          variant="solo"
          flat
          bg-color="#f0f0f0"
          density="compact"
          rounded="lg"
        />
      </div>

      <div class="input-group">
        <label>비밀번호</label>
        <v-text-field
          v-model="password"
          placeholder="비밀번호를 입력하세요"
          :rules="passwordRules"
          :type="showPassword ? 'text' : 'password'"
          hide-details="auto"
          variant="solo"
          flat
          bg-color="#f0f0f0"
          density="compact"
          rounded="lg"
        >
          <template #append-inner>
            <v-icon
              :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="me-2"
              @click="showPassword = !showPassword"
            />
          </template>
        </v-text-field>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <v-btn
        color="primary"
        block
        size="large"
        rounded="lg"
        class="login-btn"
        type="submit"
        :loading="isLoading"
        :disabled="isLoading"
      >
        로그인하기
      </v-btn>

      <div class="links">
        <span @click="showFindEmail = true">이메일 찾기</span>
        <span class="divider">|</span>
        <RouterLink to="/find-password">비밀번호 찾기</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/register">회원가입</RouterLink>
      </div>
    </v-form>

    <FindEmailModal v-model="showFindEmail" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { login } from '@/api/auth'
import FindEmailModal from '@/views/auth/FindEmailModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const formRef = ref(null)
const showFindEmail = ref(false)

const emailRules = [
  (value) => !!value || '이메일을 입력해주세요.',
  (value) => /.+@.+\..+/.test(value) || '올바른 이메일 형식이 아닙니다.',
]

const passwordRules = [
  (value) => !!value || '비밀번호를 입력해주세요.',
]

async function handleLogin() {
  errorMessage.value = ''

  const validation = await formRef.value?.validate()
  if (!validation?.valid) return

  isLoading.value = true

  try {
    const response = await login(email.value, password.value)
    const result = response.data?.result

    if (!result?.accessToken) {
      throw new Error('로그인 응답에 access token이 없습니다.')
    }

    authStore.setToken(result.accessToken)
    authStore.setUser({
      userId: result.userId,
      email: result.email,
      nickname: result.nickname,
    })

    await router.replace('/')
  } catch (error) {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (message === '탈퇴한 계정입니다.') {
      errorMessage.value = message
    } else if (status === 404 || status === 401) {
      errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    } else {
      errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }

    console.error('Login failed', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
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
  color: #ffffff;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
}

.logo-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
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
  color: var(--color-text-primary);
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

.links a,
.links span {
  font-size: 13px;
  color: #757575;
  text-decoration: none;
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
