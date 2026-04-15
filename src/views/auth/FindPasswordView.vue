<template>
  <div class="find-password-container">

    <!-- 헤더 -->
    <div class="header">
      <v-icon class="back-icon" @click="router.push('/login')">mdi-arrow-left</v-icon>
      <h1 class="title">비밀번호 찾기</h1>
    </div>

    <!-- step 1: 이메일 입력 -->
    <div v-if="step === 1" class="step-section">
      <p class="subtitle">가입 시 등록한 이메일로<br>인증코드를 발송해드립니다.</p>

      <div class="input-group">
        <label>이메일</label>
        <div class="email-row">
          <div class="email-field">
            <v-text-field
              v-model="email"
              placeholder="이메일을 입력하세요"
              variant="solo"
              flat
              bg-color="#f0f0f0"
              density="compact"
              rounded="lg"
              hide-details="auto"
              :rules="emailRules"
            />
          </div>
          <v-btn
            color="primary"
            rounded="lg"
            :loading="isLoading"
            :disabled="!isValidEmail || attempts >= maxAttempts"
            @click="handleSendCode"
          >발송</v-btn>
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- step 2: 인증코드 입력 -->
    <div v-if="step === 2" class="step-section">
      <p class="subtitle">{{ email }}로<br>인증코드를 발송했습니다.</p>

      <div class="input-group">
        <label>인증코드</label>
        <v-text-field
          v-model="code"
          placeholder="인증코드를 입력하세요"
          variant="solo"
          flat
          bg-color="#f0f0f0"
          density="compact"
          rounded="lg"
          hide-details>
        <template #append-inner>
            <span class="timer-inner" :class="{ expired: timeLeft === 0 }">
            {{ timeLeft > 0 ? formattedTime : '만료' }}
            </span>
        </template>
        </v-text-field>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>

      <v-btn
        color="primary"
        block
        rounded="lg"
        :loading="isLoading"
        :disabled="!code || codeBlocked || timeLeft === 0"
        @click="handleVerifyCode"
      >확인</v-btn>

      <p
        class="resend"
        :class="{ disabled: attempts >= maxAttempts }"
        @click="attempts < maxAttempts && handleSendCode()"
      >
        인증코드 재발송 ({{ attempts }}/{{ maxAttempts }})
      </p>
    </div>

    <!-- step 3: 새 비밀번호 입력 -->
    <div v-if="step === 3" class="step-section">
      <p class="subtitle">새로운 비밀번호를 입력해주세요.</p>

      <v-form ref="formRef">
        <div class="input-group">
          <label>새 비밀번호</label>
          <v-text-field
            v-model="newPassword"
            placeholder="새 비밀번호를 입력하세요"
            :type="showPassword ? 'text' : 'password'"
            variant="solo"
            flat
            bg-color="#f0f0f0"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :rules="passwordRules"
          >
            <template #append-inner>
              <v-icon @click="showPassword = !showPassword">
                {{ showPassword ? 'mdi-eye' : 'mdi-eye-off' }}
              </v-icon>
            </template>
          </v-text-field>
        </div>

        <div class="input-group" style="margin-top: 12px">
          <label>새 비밀번호 확인</label>
          <v-text-field
            v-model="confirmPassword"
            placeholder="새 비밀번호를 다시 입력하세요"
            :type="showConfirmPassword ? 'text' : 'password'"
            variant="solo"
            flat
            bg-color="#f0f0f0"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :rules="confirmPasswordRules"
          >
            <template #append-inner>
              <v-icon @click="showConfirmPassword = !showConfirmPassword">
                {{ showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off' }}
              </v-icon>
            </template>
          </v-text-field>
        </div>
      </v-form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <v-btn
        color="primary"
        block
        rounded="lg"
        :loading="isLoading"
        @click="handleResetPassword"
      >비밀번호 변경</v-btn>
    </div>

    <!-- step 4: 완료 -->
    <div v-if="step === 4" class="step-section complete-section">
      <v-icon class="complete-icon">mdi-check-circle</v-icon>
      <p class="complete-text">비밀번호가 변경됐습니다.</p>
      <v-btn color="primary" rounded="lg" @click="router.push('/login')">
        로그인 하러 가기
      </v-btn>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendPasswordResetCode, verifyCode, resetPassword } from '@/api/auth'

const router = useRouter()

const step = ref(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const formRef = ref(null)
const attempts = ref(0)
const maxAttempts = ref(5)
const codeBlocked = ref(false)
const timeLeft = ref(0)
let timer = null

watch(email, () => {
  errorMessage.value = ''
})


function startTimer() {
  timeLeft.value = 300  // 5분 = 300초
  clearInterval(timer)  // 기존 타이머 초기화
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const isValidEmail = computed(() => /.+@.+\..+/.test(email.value))

const emailRules = [
  v => !!v || '이메일을 입력해주세요.',
  v => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다.',
]

const passwordRules = [
  v => !!v || '비밀번호를 입력해주세요.',
  v => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/.test(v) || '비밀번호는 8~16자, 영문/숫자/특수문자를 포함해야 합니다.'
]

const confirmPasswordRules = [
  v => !!v || '비밀번호를 다시 입력해주세요.',
  v => v === newPassword.value || '비밀번호가 일치하지 않습니다.',
]

async function handleSendCode() {
  codeBlocked.value = false
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await sendPasswordResetCode(email.value)
    const result = response.data.result
    maxAttempts.value = result.maxAttempts
    attempts.value++
    step.value = 2
    startTimer()
  } catch (error) {
    const status = error.response?.status
    const message = error.response?.data?.message
    if (message === '탈퇴한 계정입니다.') {
      errorMessage.value = '탈퇴한 계정입니다.'
    } else if (status === 404) {
      errorMessage.value = '가입되지 않은 이메일입니다.'
    } else if (status === 429) {
      errorMessage.value = '인증코드 발송 횟수를 초과했습니다.'
    } else {
      errorMessage.value = '이메일 발송에 실패했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleVerifyCode() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await verifyCode(email.value, code.value)
    step.value = 3
  } catch (error) {
    const status = error.response?.status
    if (status === 429) {
      codeBlocked.value = true
      errorMessage.value = '인증 시도 횟수를 초과했습니다. 재발송 해주세요.'
    } else {
      errorMessage.value = error.response?.data?.message || '인증코드가 올바르지 않습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleResetPassword() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isLoading.value = true
  errorMessage.value = ''
  try {
    await resetPassword(email.value, newPassword.value)
    step.value = 4
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '비밀번호 변경에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.find-password-container {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 32px;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-icon {
  cursor: pointer;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #9e9e9e;
  line-height: 1.6;
  margin: 0;
}

.step-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.email-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.email-row .v-text-field {
  flex: 1;
}
.email-field {
  flex: 1;
}

.error-message {
  color: #FF5252;
  font-size: 13px;
  margin: 0;
}

.resend {
  font-size: 13px;
  color: #9e9e9e;
  text-align: center;
  cursor: pointer;
  text-decoration: underline;
  margin: 0;
}

.resend.disabled {
  color: #e0e0e0;
  cursor: default;
  text-decoration: none;
}

.complete-icon {
  font-size: 64px;
  color: var(--color-primary);
}

.complete-text {
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0;
}

:deep(.v-field__input) {
  padding-left: 10px !important;
}

:deep(.v-messages__message) {
  color: #FF5252 !important;
}

:deep(.v-field--error .v-field__outline__start),
:deep(.v-field--error .v-field__outline__notch),
:deep(.v-field--error .v-field__outline__end) {
  border-color: #FF5252 !important;
}

:deep(.v-field__append-inner) {
  padding-right: 12px !important;
  align-items: center;
}

.timer-inner {
  font-size: 13px;
  color: var(--color-primary);
  text-align: center;
  margin: 0;
}

.timer-inner.expired {
  color: #FF5252;
}

.complete-section {
  flex: 1;                 /* 중요: 화면의 남은 세로 공간을 모두 차지하게 함 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 차지한 공간의 딱 정중앙에 배치 */
  gap: 16px;               /* 요소 사이의 간격을 좁게 설정 (작아 보이는 효과) */
  padding-bottom: 10vh;    /* 시각적으로 완벽한 중앙을 위해 살짝 위로 올림 (선택사항) */
}

.complete-icon {
  font-size: 56px;         /* 아이콘 크기를 약간 줄임 */
  color: #6C63FF;          /* 성공을 의미하는 초록색 계열 추천 */
  margin-bottom: 8px;
}

.complete-text {
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 12px;
}

.complete-section .v-btn {
  width: 180px !important; /* 버튼 가로 길이를 제한하여 '작게' 만듦 */
  height: 48px;
}
</style>