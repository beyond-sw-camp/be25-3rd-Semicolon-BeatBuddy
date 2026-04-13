<template>
  <div class="mypage-view">
    <div v-if="loading" class="center-box">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <template v-else>
      <!-- 프로필 카드 -->
      <div class="profile-card">
        <div class="avatar-wrap">
          <img v-if="authStore.user?.profileImage" :src="authStore.user.profileImage" class="avatar-img" />
          <span v-else class="mdi mdi-account avatar-icon" />
        </div>
        <h3 class="user-name">{{ authStore.user?.name }}</h3>
        <p class="user-email">{{ authStore.user?.email }}</p>
      </div>

      <!-- 메뉴 목록 -->
      <div class="menu-list">
        <div class="menu-item" @click="showEditProfile = true">
          <span class="mdi mdi-account-edit menu-icon" />
          <span>프로필 이미지 수정</span>
          <span class="mdi mdi-chevron-right ml-auto" />
        </div>
        <div class="menu-item" @click="showChangePwd = true">
          <span class="mdi mdi-lock-reset menu-icon" />
          <span>비밀번호 변경</span>
          <span class="mdi mdi-chevron-right ml-auto" />
        </div>
        <div class="menu-item text-error" @click="confirmLogout = true">
          <span class="mdi mdi-logout menu-icon" />
          <span>로그아웃</span>
        </div>
        <div class="menu-item text-error" @click="confirmWithdraw = true">
          <span class="mdi mdi-account-remove menu-icon" />
          <span>회원 탈퇴</span>
        </div>
      </div>
    </template>

    <!-- 프로필 수정 다이얼로그 -->
    <v-dialog v-model="showEditProfile" max-width="360">
      <v-card rounded="xl" class="pa-2">
        <v-card-title style="font-size:17px;font-weight:700;padding:16px 16px 0">프로필 이미지 수정</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editProfileImageUrl"
            label="프로필 이미지 URL"
            variant="outlined"
            prepend-inner-icon="mdi-account-outline"
            color="primary"
          />
          <p class="error-msg" v-if="editError">{{ editError }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditProfile = false">취소</v-btn>
          <v-btn color="primary" :loading="editLoading" @click="saveProfile">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 비밀번호 변경 다이얼로그 -->
    <v-dialog v-model="showChangePwd" max-width="360">
      <v-card rounded="xl" class="pa-2">
        <v-card-title style="font-size:17px;font-weight:700;padding:16px 16px 0">비밀번호 변경</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="pwdForm.current"
            label="현재 비밀번호"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock-outline"
            color="primary"
            class="mb-2"
          />
          <v-text-field
            v-model="pwdForm.newPwd"
            label="새 비밀번호"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock-outline"
            color="primary"
            class="mb-2"
          />
          <v-text-field
            v-model="pwdForm.confirm"
            label="새 비밀번호 확인"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock-outline"
            color="primary"
          />
          <p class="error-msg" v-if="pwdError">{{ pwdError }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showChangePwd = false">취소</v-btn>
          <v-btn color="primary" :loading="pwdLoading" @click="changePassword">변경</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 로그아웃 확인 -->
    <v-dialog v-model="confirmLogout" max-width="300">
      <v-card rounded="xl">
        <v-card-title style="font-size:16px;font-weight:700;padding:16px 16px 0">로그아웃</v-card-title>
        <v-card-text>로그아웃 하시겠어요?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmLogout = false">취소</v-btn>
          <v-btn color="error" @click="doLogout">로그아웃</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 회원 탈퇴 확인 -->
    <v-dialog v-model="confirmWithdraw" max-width="300">
      <v-card rounded="xl">
        <v-card-title style="font-size:16px;font-weight:700;padding:16px 16px 0">회원 탈퇴</v-card-title>
        <v-card-text>정말로 탈퇴하시겠어요? 모든 데이터가 삭제되며 복구할 수 없어요.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmWithdraw = false">취소</v-btn>
          <v-btn color="error" :loading="withdrawLoading" @click="doWithdraw">탈퇴</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/user'

const authStore = useAuthStore()

const loading = ref(false)

// 프로필 수정
const showEditProfile = ref(false)
const editProfileImageUrl = ref('')
const editLoading = ref(false)
const editError = ref('')

// 비밀번호 변경
const showChangePwd = ref(false)
const pwdForm = ref({ current: '', newPwd: '', confirm: '' })
const pwdLoading = ref(false)
const pwdError = ref('')

// 로그아웃/탈퇴
const confirmLogout = ref(false)
const confirmWithdraw = ref(false)
const withdrawLoading = ref(false)

onMounted(async () => {
  if (!authStore.user) {
    loading.value = true
    try {
      await authStore.fetchMe()
    } finally {
      loading.value = false
    }
  }
  editProfileImageUrl.value = authStore.user?.profileImage || ''
})

async function saveProfile() {
  editError.value = ''
  editLoading.value = true
  try {
    await userApi.updateProfileImage(editProfileImageUrl.value)
    authStore.user.profileImage = editProfileImageUrl.value
    showEditProfile.value = false
  } catch (e) {
    editError.value = e.response?.data?.message || '수정에 실패했습니다.'
  } finally {
    editLoading.value = false
  }
}

async function changePassword() {
  pwdError.value = ''
  if (pwdForm.value.newPwd !== pwdForm.value.confirm) {
    pwdError.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }
  pwdLoading.value = true
  try {
    await userApi.changePassword({
      currentPassword: pwdForm.value.current,
      newPassword: pwdForm.value.newPwd,
      newPasswordConfirm: pwdForm.value.confirm,
    })
    showChangePwd.value = false
    pwdForm.value = { current: '', newPwd: '', confirm: '' }
  } catch (e) {
    pwdError.value = e.response?.data?.message || '비밀번호 변경에 실패했습니다.'
  } finally {
    pwdLoading.value = false
  }
}

function doLogout() {
  authStore.logout()
}

async function doWithdraw() {
  withdrawLoading.value = true
  try {
    await userApi.deleteMe()
    authStore.logout()
  } finally {
    withdrawLoading.value = false
  }
}
</script>

<style scoped>
.mypage-view {
  padding: 16px;
}

.profile-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(108, 99, 255, 0.12);
  margin-bottom: 16px;
}

.avatar-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #ede9ff;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 48px;
  color: #6C63FF;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.user-email {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}

.menu-list {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f9f9f9;
}

.menu-item.text-error, .text-error {
  color: #FF5252;
}

.menu-icon {
  font-size: 20px;
  color: #6C63FF;
}

.text-error .menu-icon {
  color: #FF5252;
}

.ml-auto {
  margin-left: auto;
}

.center-box {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.error-msg {
  color: #FF5252;
  font-size: 13px;
  margin-top: 4px;
}
</style>
