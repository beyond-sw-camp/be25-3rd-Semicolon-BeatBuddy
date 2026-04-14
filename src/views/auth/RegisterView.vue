<template>
  <div class="register-container">

    <!-- 헤더 -->
    <div class="header">
      <v-icon class="back-icon" @click="handleBack">mdi-arrow-left</v-icon>
      <h1 class="title">{{ step <= 2 ? '회원가입' : '추가 정보 입력' }}</h1>
    </div>

    <!-- step 1: 이메일 입력 + 인증 -->
    <div v-if="step === 1" class="step-section">
      <div class="input-group">
        <label>이메일 <span class="required">*</span></label>
        <div class="email-row">
          <div class="email-field">
            <v-text-field
              v-model="email"
              placeholder="example@email.com"
              variant="solo"
              flat
              bg-color="#f0f0f0"
              density="compact"
              rounded="lg"
              hide-details="auto"
              :rules="emailRules"
              :disabled="emailVerified"
            />
          </div>
          <v-btn
            color="primary"
            rounded="lg"
            :loading="isLoading"
            :disabled="!isValidEmail || emailVerified || sendAttempts >= maxSendAttempts"
            @click="handleSendCode"
          >{{ codeSent ? '재발송' : '인증요청' }}</v-btn>
        </div>

        <!-- 인증코드 입력 -->
        <div v-if="codeSent && !emailVerified" class="code-row">
          <v-text-field
            v-model="code"
            placeholder="인증코드 6자리"
            variant="solo"
            flat
            bg-color="#f0f0f0"
            density="compact"
            rounded="lg"
            hide-details
          >
            <template #append-inner>
              <span class="timer-inner" :class="{ expired: timeLeft === 0 }">
                {{ timeLeft > 0 ? formattedTime : '만료' }}
              </span>
            </template>
          </v-text-field>
          <v-btn
            color="primary"
            rounded="lg"
            :loading="isVerifyLoading"
            :disabled="!code || timeLeft === 0 || verifyBlocked"
            @click="handleVerifyCode"
          >확인</v-btn>
        </div>

        <!-- 인증 완료 -->
        <p v-if="emailVerified" class="success-message">
          <v-icon size="14">mdi-check-circle</v-icon>
          이메일 인증이 완료됐습니다.
        </p>
        <p v-if="codeErrorMessage" class="error-message">{{ codeErrorMessage }}</p>
      </div>

      <div class="input-group">
        <label>비밀번호 <span class="required">*</span></label>
        <v-text-field
          v-model="password"
          placeholder="8~16자리, 영문/숫자/특수문자"
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

      <div class="input-group">
        <label>비밀번호 확인 <span class="required">*</span></label>
        <v-text-field
          v-model="confirmPassword"
          placeholder="비밀번호를 다시 입력"
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

      <v-btn
        color="primary"
        block
        rounded="lg"
        size="large"
        :disabled="!emailVerified"
        @click="goToStep2"
      >다음 단계로</v-btn>
    </div>

    <!-- step 2: 추가 정보 -->
    <div v-if="step === 2" class="step-section">
      <p class="subtitle">더 나은 친구 매칭을 위해<br>추가 정보를 입력해주세요.</p>

      <!-- 프로필 사진 -->
      <div class="profile-section">
        <label class="profile-label">프로필 사진 <span class="optional">(선택)</span></label>
        <div class="profile-image-wrapper" @click="triggerFileInput">
          <img v-if="previewUrl" :src="previewUrl" class="profile-preview" />
          <v-icon v-else class="profile-placeholder">mdi-account</v-icon>
          <div class="upload-btn">
            <v-icon size="16" color="white">mdi-upload</v-icon>
          </div>
        </div>
        <p class="profile-hint">5MB 이하의 이미지 파일만 가능합니다</p>
        <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="handleFileChange" />
      </div>

      <v-form ref="formRef">
        <!-- 닉네임 -->
        <div class="input-group">
          <label>닉네임 <span class="required">*</span></label>
          <v-text-field
            v-model="nickname"
            placeholder="닉네임을 입력하세요"
            variant="solo"
            flat
            bg-color="#f0f0f0"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :rules="nicknameRules"
          />
        </div>

        <!-- 성별 -->
        <div class="input-group" style="margin-top: 12px">
          <label>성별 <span class="required">*</span></label>
          <div class="gender-row">
            <v-btn
              :color="gender === 'MALE' ? 'primary' : ''"
              :variant="gender === 'MALE' ? 'flat' : 'outlined'"
              rounded="lg"
              style="flex: 1"
              @click="gender = 'MALE'"
            >남성</v-btn>
            <v-btn
              :color="gender === 'FEMALE' ? 'primary' : ''"
              :variant="gender === 'FEMALE' ? 'flat' : 'outlined'"
              rounded="lg"
              style="flex: 1"
              @click="gender = 'FEMALE'"
            >여성</v-btn>
          </div>
        </div>

        <!-- 출생연도 -->
        <div class="input-group" style="margin-top: 12px">
          <label>출생연도 <span class="required">*</span></label>
          <v-text-field
            v-model="birthYear"
            placeholder="1923"
            type="number"
            variant="solo"
            flat
            bg-color="#f0f0f0"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :rules="birthYearRules"
          />
        </div>
      </v-form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <v-btn
        color="primary"
        block
        rounded="lg"
        size="large"
        :loading="isLoading"
        @click="handleSignup"
      >회원가입 완료</v-btn>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { sendVerificationCode, verifyCode, signup } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)

// 이메일 인증
const email = ref('')
const code = ref('')
const codeSent = ref(false)
const emailVerified = ref(false)
const sendAttempts = ref(0)
const maxSendAttempts = ref(5)
const verifyBlocked = ref(false)
const timeLeft = ref(0)
const isLoading = ref(false)
const isVerifyLoading = ref(false)
const codeErrorMessage = ref('')
let timer = null

// 비밀번호
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 추가 정보
const nickname = ref('')
const gender = ref('')
const birthYear = ref('')
const profileImage = ref(null)
const previewUrl = ref(null)
const fileInputRef = ref(null)
const formRef = ref(null)
const errorMessage = ref('')

// 타이머
function startTimer() {
  timeLeft.value = 300
  clearInterval(timer)
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

// rules
const emailRules = [
  v => !!v || '이메일을 입력해주세요.',
  v => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다.',
]

const passwordRules = [
  v => !!v || '비밀번호를 입력해주세요.',
  v => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/.test(v) || '비밀번호는 8~16자, 영문/숫자/특수문자를 포함해야 합니다.',
]

const confirmPasswordRules = [
  v => !!v || '비밀번호를 다시 입력해주세요.',
  v => v === password.value || '비밀번호가 일치하지 않습니다.',
]

const nicknameRules = [
  v => !!v || '닉네임을 입력해주세요.',
  v => v.length >= 2 || '2자 이상 입력해주세요.',
]

const birthYearRules = [
  v => !!v || '출생연도를 입력해주세요.',
  v => (v >= 1900 && v <= new Date().getFullYear()) || '올바른 출생연도를 입력해주세요.',
]

// 이메일 인증코드 발송
async function handleSendCode() {
  isLoading.value = true
  codeErrorMessage.value = ''
  try {
    const response = await sendVerificationCode(email.value)
    const result = response.data.result
    maxSendAttempts.value = result.maxAttempts
    sendAttempts.value++
    codeSent.value = true
    startTimer()
  } catch (error) {
    const message = error.response?.data?.message
    codeErrorMessage.value = message || '이메일 발송에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 인증코드 확인
async function handleVerifyCode() {
  isVerifyLoading.value = true
  codeErrorMessage.value = ''
  try {
    await verifyCode(email.value, code.value)
    emailVerified.value = true
    clearInterval(timer)
  } catch (error) {
    const status = error.response?.status
    if (status === 429) {
      verifyBlocked.value = true
      codeErrorMessage.value = '인증 시도 횟수를 초과했습니다. 재발송 해주세요.'
    } else {
      codeErrorMessage.value = error.response?.data?.message || '인증코드가 올바르지 않습니다.'
    }
  } finally {
    isVerifyLoading.value = false
  }
}

// 다음 단계로
function goToStep2() {
  step.value = 2
}

// 파일 선택
function triggerFileInput() {
  fileInputRef.value.click()
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = '5MB 이하의 이미지만 업로드 가능합니다.'
    return
  }
  profileImage.value = file
  previewUrl.value = URL.createObjectURL(file)
}

// 뒤로가기
function handleBack() {
  if (step.value === 2) {
    step.value = 1
  } else {
    router.push('/login')
  }
}

// 회원가입
async function handleSignup() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  if (!gender.value) {
    errorMessage.value = '성별을 선택해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = {
      email: email.value,
      password: password.value,
      nickname: nickname.value,
      gender: gender.value,
      birthYear: parseInt(birthYear.value),
    }

    const response = await signup(data, profileImage.value)
    const result = response.data.result

    authStore.setToken(result.accessToken)
    authStore.setUser({
      userId: result.userId,
      email: result.email,
      nickname: result.nickname,
    })

    router.push('/onboarding')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '회원가입에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
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

.required {
  color: #FF5252;
}

.optional {
  color: #9e9e9e;
  font-weight: 400;
}

.email-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.email-field {
  flex: 1;
}

.code-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.code-row .v-text-field {
  flex: 1;
}

.success-message {
  color: #4CAF50;
  font-size: 13px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message {
  color: #FF5252;
  font-size: 13px;
  margin: 0;
}

.gender-row {
  display: flex;
  gap: 8px;
}

/* 프로필 사진 */
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.profile-label {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  align-self: flex-start;
}

.profile-image-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: visible;
}

.profile-preview {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-placeholder {
  font-size: 48px;
  color: #bdbdbd;
}

.upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-hint {
  font-size: 12px;
  color: #9e9e9e;
  margin: 0;
}

.timer-inner {
  font-size: 13px;
  color: var(--color-primary);
}

.timer-inner.expired {
  color: #FF5252;
}

:deep(.v-field__input) {
  padding-left: 10px !important;
}

:deep(.v-field__append-inner) {
  padding-right: 12px !important;
  align-items: center;
}

:deep(.v-messages__message) {
  color: #FF5252 !important;
}
</style>