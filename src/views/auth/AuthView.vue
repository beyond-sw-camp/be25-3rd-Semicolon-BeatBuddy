<template>
  <div class="auth-wrap">
    <!-- 탭: 로그인 / 회원가입 -->
    <div class="auth-tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'login' }]"
        @click="activeTab = 'login'"
      >로그인</button>
      <button
        :class="['tab-btn', { active: activeTab === 'register' }]"
        @click="activeTab = 'register'"
      >회원가입</button>
    </div>

    <!-- 로그인 -->
    <div v-if="activeTab === 'login'" class="form-section">
      <h2 class="form-title">🎵 BeatBuddy에 오신 걸 환영해요!</h2>
      <v-text-field
        v-model="loginForm.email"
        label="이메일"
        type="email"
        variant="outlined"
        prepend-inner-icon="mdi-email-outline"
        color="primary"
        class="mb-2"
      />
      <v-text-field
        v-model="loginForm.password"
        label="비밀번호"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        color="primary"
        class="mb-2"
      />
      <v-btn
        block
        color="primary"
        size="large"
        :loading="loading"
        class="mb-3"
        @click="handleLogin"
      >로그인</v-btn>
      <p class="forgot-link" @click="activeTab = 'forgot'">비밀번호를 잊으셨나요?</p>
      <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
    </div>

    <!-- 비밀번호 찾기 -->
    <div v-else-if="activeTab === 'forgot'" class="form-section">
      <h2 class="form-title">🔑 비밀번호 찾기</h2>
      <p class="form-desc">가입한 이메일로 임시 비밀번호를 보내드립니다.</p>
      <v-text-field
        v-model="forgotEmail"
        label="이메일"
        type="email"
        variant="outlined"
        prepend-inner-icon="mdi-email-outline"
        color="primary"
        class="mb-3"
      />
      <v-btn block color="primary" :loading="loading" @click="handleForgot">임시 비밀번호 발송</v-btn>
      <p class="back-link" @click="activeTab = 'login'">← 로그인으로 돌아가기</p>
      <v-alert v-if="forgotSuccess" type="success" class="mt-3">이메일을 확인해 주세요!</v-alert>
      <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
    </div>

    <!-- 회원가입 (스텝) -->
    <div v-else class="form-section">
      <!-- Step 1: 기본 정보 -->
      <div v-if="step === 1">
        <h2 class="form-title">📝 기본 정보</h2>
        <v-text-field
          v-model="registerForm.name"
          label="닉네임"
          variant="outlined"
          prepend-inner-icon="mdi-account-outline"
          color="primary"
          class="mb-2"
        />
        <div class="email-row">
          <v-text-field
            v-model="registerForm.email"
            label="이메일"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            color="primary"
            class="mb-2 flex-grow"
          />
          <v-btn
            color="primary"
            variant="outlined"
            class="ml-2 email-btn"
            :loading="sendingCode"
            @click="sendEmailCode"
          >인증코드 발송</v-btn>
        </div>
        <v-text-field
          v-if="codeSent"
          v-model="registerForm.code"
          label="인증 코드"
          variant="outlined"
          prepend-inner-icon="mdi-shield-check-outline"
          color="primary"
          class="mb-2"
        />
        <v-btn
          v-if="codeSent"
          variant="tonal"
          color="primary"
          size="small"
          class="mb-3"
          :loading="verifyingCode"
          @click="verifyCode"
        >코드 확인</v-btn>
        <v-alert v-if="emailVerified" type="success" density="compact" class="mb-2">이메일 인증 완료!</v-alert>
        <v-text-field
          v-model="registerForm.password"
          label="비밀번호"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          color="primary"
          class="mb-2"
        />
        <v-text-field
          v-model="registerForm.passwordConfirm"
          label="비밀번호 확인"
          type="password"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          color="primary"
          class="mb-3"
        />
        <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
        <v-btn block color="primary" :disabled="!emailVerified" @click="goStep2">다음</v-btn>
      </div>

      <!-- Step 2: 그룹 코드 -->
      <div v-else-if="step === 2">
        <h2 class="form-title">👥 그룹 코드 입력</h2>
        <p class="form-desc">그룹 초대 코드가 있다면 입력하세요. 나중에도 입력할 수 있어요.</p>
        <v-text-field
          v-model="registerForm.groupCode"
          label="초대 코드 (선택)"
          variant="outlined"
          prepend-inner-icon="mdi-key-outline"
          color="primary"
          class="mb-3"
        />
        <div class="step-nav">
          <v-btn variant="text" @click="step = 1">이전</v-btn>
          <v-btn color="primary" @click="step = 3">다음</v-btn>
        </div>
      </div>

      <!-- Step 3: 최애곡 선택 -->
      <div v-else-if="step === 3">
        <h2 class="form-title">🎵 최애곡 10곡 선택</h2>
        <p class="form-desc">좋아하는 곡을 {{ selectedSongs.length }}/10곡 선택했어요.</p>
        <div class="search-row">
          <v-text-field
            v-model="songQuery"
            label="곡 검색"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            color="primary"
            density="compact"
            @keyup.enter="searchSongs"
          />
        </div>
        <!-- 검색 결과 -->
        <div class="song-list" v-if="musicStore.searchResults.length">
          <div
            v-for="song in musicStore.searchResults"
            :key="song.id"
            class="song-item"
            :class="{ selected: isSelected(song) }"
            @click="toggleSong(song)"
          >
            <img :src="song.albumCover" :alt="song.title" class="album-cover" />
            <div class="song-info">
              <p class="song-title">{{ song.title }}</p>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
            <span class="mdi" :class="isSelected(song) ? 'mdi-check-circle' : 'mdi-plus-circle-outline'" />
          </div>
        </div>
        <!-- 선택된 곡 -->
        <div v-if="selectedSongs.length" class="selected-songs">
          <p class="selected-label">선택된 곡:</p>
          <div class="song-chips">
            <v-chip
              v-for="song in selectedSongs"
              :key="song.id"
              closable
              color="primary"
              @click:close="removeSong(song)"
              class="ma-1"
            >{{ song.title }}</v-chip>
          </div>
        </div>
        <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
        <div class="step-nav mt-3">
          <v-btn variant="text" @click="step = 2">이전</v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="selectedSongs.length < 10"
            @click="handleRegister"
          >가입 완료</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMusicStore } from '@/stores/music'
import { authApi } from '@/api/auth'

const authStore = useAuthStore()
const musicStore = useMusicStore()

const activeTab = ref('login')
const step = ref(1)
const loading = ref(false)
const errorMsg = ref('')

// 로그인
const showPassword = ref(false)
const loginForm = ref({ email: '', password: '' })
async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(loginForm.value)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 비밀번호 찾기
const forgotEmail = ref('')
const forgotSuccess = ref(false)
async function handleForgot() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authApi.forgotPassword(forgotEmail.value)
    forgotSuccess.value = true
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '이메일 발송에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 회원가입
const registerForm = ref({
  name: '', email: '', code: '', password: '', passwordConfirm: '', groupCode: ''
})
const codeSent = ref(false)
const sendingCode = ref(false)
const verifyingCode = ref(false)
const emailVerified = ref(false)
const songQuery = ref('')
const selectedSongs = ref([])

async function sendEmailCode() {
  errorMsg.value = ''
  sendingCode.value = true
  try {
    await authApi.sendEmailCode(registerForm.value.email)
    codeSent.value = true
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '코드 발송에 실패했습니다.'
  } finally {
    sendingCode.value = false
  }
}

async function verifyCode() {
  errorMsg.value = ''
  verifyingCode.value = true
  try {
    await authApi.verifyEmailCode({ email: registerForm.value.email, code: registerForm.value.code })
    emailVerified.value = true
  } catch {
    errorMsg.value = '인증 코드가 올바르지 않습니다.'
  } finally {
    verifyingCode.value = false
  }
}

function goStep2() {
  errorMsg.value = ''
  if (!registerForm.value.name) { errorMsg.value = '닉네임을 입력해주세요.'; return }
  if (!registerForm.value.password) { errorMsg.value = '비밀번호를 입력해주세요.'; return }
  if (registerForm.value.password !== registerForm.value.passwordConfirm) {
    errorMsg.value = '비밀번호가 일치하지 않습니다.'; return
  }
  step.value = 2
}

async function searchSongs() {
  if (!songQuery.value.trim()) return
  await musicStore.searchSongs(songQuery.value)
}

function isSelected(song) {
  return selectedSongs.value.some((s) => s.id === song.id)
}

function toggleSong(song) {
  if (isSelected(song)) {
    removeSong(song)
  } else if (selectedSongs.value.length < 10) {
    selectedSongs.value.push(song)
  }
}

function removeSong(song) {
  selectedSongs.value = selectedSongs.value.filter((s) => s.id !== song.id)
}

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true
  try {
    const payload = {
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      groupCode: registerForm.value.groupCode || null,
      songIds: selectedSongs.value.map((s) => s.id),
    }
    await authApi.register(payload)
    // 회원가입 후 자동 로그인
    await authStore.login({ email: payload.email, password: payload.password })
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '회원가입에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-wrap {
  width: 100%;
  max-width: 480px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 24px 20px;
  background: #f5f5f5;
}

.auth-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: #e0e0e0;
  color: #888;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #6C63FF;
  color: #fff;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.form-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
}

.email-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.email-btn {
  margin-top: 4px;
  white-space: nowrap;
}

.flex-grow {
  flex: 1;
}

.step-nav {
  display: flex;
  justify-content: space-between;
}

.search-row {
  margin-bottom: 8px;
}

.song-list {
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.song-item:hover {
  background: #f5f0ff;
}

.song-item.selected {
  background: #ede9ff;
}

.album-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
}

.song-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.song-artist {
  font-size: 12px;
  color: #888;
}

.song-item .mdi {
  font-size: 22px;
  color: #6C63FF;
}

.selected-songs {
  margin-top: 8px;
}

.selected-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.song-chips {
  display: flex;
  flex-wrap: wrap;
}

.forgot-link, .back-link {
  text-align: center;
  font-size: 13px;
  color: #6C63FF;
  cursor: pointer;
  margin-top: 8px;
}

.error-msg {
  color: #FF5252;
  font-size: 13px;
  margin-top: 4px;
  text-align: center;
}
</style>
