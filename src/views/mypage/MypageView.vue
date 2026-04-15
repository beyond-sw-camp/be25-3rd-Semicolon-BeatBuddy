<template>
  <section class="mypage">
    <v-alert
      v-if="userStore.errorMessage"
      class="mb-4"
      type="error"
      variant="tonal"
    >
      {{ userStore.errorMessage }}
    </v-alert>

    <v-alert
      v-if="successMessage"
      class="mb-4"
      type="success"
      variant="tonal"
    >
      {{ successMessage }}
    </v-alert>

    <v-card class="section-card profile-card" elevation="0">
      <v-card-text class="profile">
        <div class="profile-image-wrap">
          <v-avatar size="72">
            <v-img
              v-if="resolvedProfileImage"
              :src="resolvedProfileImage"
              alt="프로필 이미지"
              cover
            />
            <v-icon v-else icon="mdi-account" size="42" />
          </v-avatar>
          <v-btn
            class="profile-edit-button"
            icon="mdi-pencil"
            size="x-small"
            variant="flat"
            aria-label="프로필 이미지 변경"
            :loading="savingProfileImage"
            @click="openProfileImageDialog"
          />
        </div>

        <div class="profile-text">
          <strong>{{ displayName }}</strong>
          <span>{{ profileEmail }}</span>
          <span v-if="profile.birthYear || profile.gender">
            {{ profile.birthYear || '-' }}년생 · {{ profile.gender || '-' }}
          </span>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="profileImageDialog" max-width="360">
      <v-card class="section-card" elevation="0">
        <v-card-title>프로필 이미지 변경</v-card-title>
        <v-card-text>
          <input
            ref="profileImageInput"
            class="hidden-file-input"
            type="file"
            accept="image/*"
            @change="handleProfileImageSelected"
          />
          <div v-if="profileImagePreview" class="image-preview">
            <v-img
              :src="profileImagePreview"
              alt="프로필 이미지 미리보기"
              aspect-ratio="1"
              cover
            />
          </div>
          <v-btn
            variant="outlined"
            color="primary"
            block
            @click="openProfileImagePicker"
          >
            사진 선택
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="profileImageDialog = false">
            취소
          </v-btn>
          <v-btn
            color="primary"
            :loading="savingProfileImage"
            @click="handleUpdateProfileImage"
          >
            변경
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class="section-card notification-card" elevation="0">
      <v-card-title>그룹 닉네임</v-card-title>
      <v-card-text>
        <v-list v-if="groupNicknames.length" class="group-list">
          <v-list-item
            v-for="group in groupNicknames"
            :key="group.groupId"
            class="group-item"
            :ripple="false"
            @click="startEditGroupNickname(group)"
          >
            <template #prepend>
              <v-avatar size="40">
                <v-img
                  v-if="group.groupImageUrl"
                  :src="group.groupImageUrl"
                  alt="그룹 이미지"
                />
                <v-icon v-else icon="mdi-account-group" />
              </v-avatar>
            </template>

            <template #title>
              <div v-if="editingGroupId === group.groupId" class="nickname-edit" @click.stop>
                <strong class="editing-group-name">
                  {{ group.groupName || `그룹 ${group.groupId}` }}
                </strong>
                <div class="nickname-edit-row">
                  <v-text-field
                    v-model="groupNicknameInputs[group.groupId]"
                    label="새 닉네임"
                    variant="outlined"
                    density="compact"
                    hide-details
                    autofocus
                    @keyup.enter="handleUpdateGroupNickname(group)"
                  />
                  <v-btn
                    class="nickname-save-button"
                    size="small"
                    color="primary"
                    :loading="savingGroupNickname"
                    @click="handleUpdateGroupNickname(group)"
                  >
                    저장
                  </v-btn>
                </div>
              </div>
              <span v-else>{{ group.groupName || `그룹 ${group.groupId}` }}</span>
            </template>

            <template #subtitle>
              <span v-if="editingGroupId !== group.groupId">
                현재 닉네임: {{ group.groupNickname || '-' }}
              </span>
            </template>

            <template #append>
              <v-btn
                v-if="editingGroupId !== group.groupId"
                icon="mdi-chevron-right"
                size="small"
                variant="text"
                aria-label="그룹 닉네임 변경"
                class="group-edit-button"
                :ripple="false"
                @click.stop="startEditGroupNickname(group)"
              />
            </template>
          </v-list-item>
        </v-list>
        <p v-else class="empty-text">그룹 닉네임이 없습니다.</p>
      </v-card-text>
    </v-card>

    <v-card class="section-card" elevation="0">
      <v-card-title>알림 설정</v-card-title>
      <v-card-text>
        <div class="notification-list">
          <div class="notification-row">
            <span class="notification-label">
              <span class="notification-icon chat-icon">💬</span>
              <span class="notification-copy">
                <strong>채팅 알림</strong>
                <small>새 메시지 수신시</small>
              </span>
            </span>
            <v-switch
              v-model="allowPushChat"
              color="primary"
              hide-details
              aria-label="채팅 알림"
              @update:model-value="handleUpdateChatNotification"
            />
          </div>

          <div class="notification-row">
            <span class="notification-label">
              <span class="notification-icon social-icon">👥</span>
              <span class="notification-copy">
                <strong>친구/소셜 알림</strong>
                <small>친구요청, 수락알림</small>
              </span>
            </span>
            <v-switch
              v-model="allowPushSocial"
              color="primary"
              hide-details
              aria-label="친구/소셜 알림"
              @update:model-value="handleUpdateSocialNotification"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="section-card account-card" elevation="0">
      <v-card-title>계정관리</v-card-title>
      <v-card-text>
        <button class="account-row password-row" type="button" @click="openPasswordDialog">
          <span class="account-row-label">
            <span class="account-icon password-icon">
              <v-icon icon="mdi-lock-reset" size="20" />
            </span>
            <span>비밀번호 변경</span>
          </span>
          <v-icon
            icon="mdi-chevron-right"
            size="22"
          />
        </button>

        <div class="account-actions">
          <button class="account-row" type="button" @click="openLogoutDialog">
            <span class="account-row-label">
              <span class="account-icon logout-icon">
                <v-icon icon="mdi-door-open" size="19" />
                <v-icon class="logout-arrow" icon="mdi-arrow-right" size="12" />
              </span>
              <span>로그아웃</span>
            </span>
            <v-icon icon="mdi-chevron-right" size="22" />
          </button>

          <button
            class="account-row account-danger-row"
            type="button"
            @click="openWithdrawDialog"
          >
            <span class="account-row-label">
              <span class="account-icon withdraw-icon">
                <v-icon icon="mdi-account-outline" size="19" />
                <span class="withdraw-x">×</span>
              </span>
              <span>회원탈퇴</span>
            </span>
            <v-icon icon="mdi-chevron-right" size="22" />
          </button>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="passwordDialog"
      max-width="420"
      scrim="rgba(0, 0, 0, 0.62)"
    >
      <v-card class="dialog-card password-dialog-card" elevation="0">
        <v-card-title>비밀번호 변경</v-card-title>
        <v-card-text>
          <div class="password-input-group">
            <label class="password-field-label" for="current-password">
              현재 비밀번호
            </label>
            <v-text-field
              id="current-password"
              v-model="passwordForm.currentPassword"
              class="password-input"
              placeholder="현재 비밀번호"
              :type="showCurrentPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
              hide-details="auto"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
            />

            <label class="password-field-label" for="new-password">
              새 비밀번호
            </label>
            <p class="password-rule">
              8~16자의 영문, 숫자, 특수문자를 포함해야 합니다.
            </p>
            <v-text-field
              id="new-password"
              v-model="passwordForm.newPassword"
              class="password-input"
              placeholder="새 비밀번호"
              :type="showNewPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
              hide-details="auto"
              @click:append-inner="showNewPassword = !showNewPassword"
            />

            <label class="password-field-label" for="new-password-confirm">
              새 비밀번호 확인
            </label>
            <v-text-field
              id="new-password-confirm"
              v-model="passwordForm.newPasswordConfirm"
              class="password-input"
              placeholder="새 비밀번호 확인"
              :type="showNewPasswordConfirm ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :append-inner-icon="showNewPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
              hide-details="auto"
              @click:append-inner="showNewPasswordConfirm = !showNewPasswordConfirm"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="dialog-cancel-button" variant="flat" @click="closePasswordDialog">
            취소
          </v-btn>
          <v-btn
            class="password-save-button"
            variant="flat"
            :loading="savingPassword"
            @click="handleChangePassword"
          >
            저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="logoutDialog" max-width="360" scrim="rgba(0, 0, 0, 0.62)">
      <v-card class="dialog-card" elevation="0">
        <v-card-title>로그아웃</v-card-title>
        <v-card-text>
          <p class="dialog-text">로그아웃 하시겠습니까?</p>
          <p class="dialog-sub-text">현재 세션이 종료됩니다.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="dialog-cancel-button" variant="flat" @click="logoutDialog = false">
            취소
          </v-btn>
          <v-btn class="logout-confirm-button" variant="flat" @click="handleLogout">
            로그아웃
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="withdrawDialog" max-width="380" scrim="rgba(0, 0, 0, 0.62)">
      <v-card class="dialog-card" elevation="0">
        <v-card-title>회원탈퇴</v-card-title>
        <v-card-text>
          <div class="withdraw-warning">
            <div class="warning-title">
              <span class="warning-icon">⚠️</span>
              <strong>경고</strong>
            </div>
            <ul class="warning-list">
              <li>모든 개인 정보가 영구적으로 삭제됩니다</li>
              <li>가입한 그룹 정보가 모두 삭제됩니다</li>
              <li>친구 목록 및 채팅 기록이 삭제됩니다</li>
              <li>탈퇴 후 데이터 복구가 불가능합니다</li>
            </ul>
          </div>

          <p class="dialog-sub-text">
            정말로 탈퇴하시려면 아래에
            <strong class="withdraw-confirm-word">"회원탈퇴"</strong>를 입력해주세요
          </p>

          <v-text-field
            v-model="withdrawConfirmText"
            class="withdraw-confirm-input"
            :label="withdrawConfirmLabel"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            @focus="withdrawConfirmFocused = true"
            @blur="withdrawConfirmFocused = false"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="dialog-cancel-button"
            variant="flat"
            @click="closeWithdrawDialog"
          >
            취소
          </v-btn>
          <v-btn
            class="withdraw-confirm-button"
            color="error"
            :disabled="!canWithdraw"
            :loading="withdrawing"
            @click="handleWithdraw"
          >
            회원탈퇴
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { logout } from '@/api/auth'
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const profileImageInput = ref(null)
const profileImageUrl = ref('')
const profileImageFile = ref(null)
const allowPushChat = ref(false)
const allowPushSocial = ref(false)
const groupNicknameInputs = reactive({})
const savingProfileImage = ref(false)
const savingPassword = ref(false)
const savingGroupNickname = ref(false)
const withdrawing = ref(false)
const successMessage = ref('')
const profileImageDialog = ref(false)
const editingGroupId = ref(null)
const passwordDialog = ref(false)
const logoutDialog = ref(false)
const withdrawDialog = ref(false)
const withdrawConfirmText = ref('')
const withdrawConfirmFocused = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordConfirm = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
})

const profile = computed(() => userStore.profile || {})
const notificationSetting = computed(() => userStore.notificationSetting || {})
const groupNicknames = computed(() => userStore.groupNicknames || [])

const displayName = computed(() => profile.value.nickname || '내 프로필')
const profileEmail = computed(() => profile.value.email || '')
const profileImage = computed(() => {
  return profile.value.profileImageUrl || profile.value.profileImage || profile.value.imageUrl || ''
})
const resolvedProfileImage = computed(() => resolveImageUrl(profileImage.value))
const profileImagePreview = computed(() => {
  return profileImageUrl.value
    ? resolveImageUrl(profileImageUrl.value)
    : resolveImageUrl(profileImage.value)
})
const canWithdraw = computed(() => withdrawConfirmText.value === '회원탈퇴')
const withdrawConfirmLabel = computed(() => {
  return withdrawConfirmFocused.value || withdrawConfirmText.value
    ? '회원탈퇴 입력'
    : '회원탈퇴'
})

const resolveImageUrl = (url) => {
  if (!url) {
    return ''
  }

  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin
  return new URL(url, baseUrl).toString()
}

watch(profileImage, (value) => {
  if (!profileImageDialog.value) {
    profileImageUrl.value = value
  }
})

const openProfileImagePicker = () => {
  if (profileImageInput.value) {
    profileImageInput.value.value = ''
    profileImageInput.value.click()
  }
}

const handleProfileImageSelected = (event) => {
  const selectedFile = event.target.files?.[0] || null
  profileImageFile.value = selectedFile

  if (selectedFile) {
    const reader = new FileReader()

    reader.onload = () => {
      profileImageUrl.value = reader.result
    }

    reader.onerror = () => {
      profileImageUrl.value = ''
      userStore.errorMessage = '이미지 파일을 읽지 못했습니다.'
    }

    reader.readAsDataURL(selectedFile)
  } else {
    profileImageUrl.value = ''
  }
}

watch(notificationSetting, (value) => {
  allowPushChat.value = Boolean(value.allowPushChat)
  allowPushSocial.value = Boolean(value.allowPushSocial)
})

watch(groupNicknames, (groups) => {
  groups.forEach((group) => {
    if (group.groupId && !groupNicknameInputs[group.groupId]) {
      groupNicknameInputs[group.groupId] = group.groupNickname || ''
    }
  })
})

const loadMypage = async () => {
  try {
    await Promise.all([
      userStore.fetchMyProfile(),
      userStore.fetchMyNotificationSetting(),
      userStore.fetchMyGroupNicknames(),
    ])
  } catch {
    // userStore.errorMessage is rendered in the alert above.
  }
}

const openProfileImageDialog = () => {
  profileImageUrl.value = profileImage.value
  profileImageFile.value = null
  profileImageDialog.value = true
  successMessage.value = ''
  userStore.errorMessage = ''
}

const handleUpdateProfileImage = async () => {
  if (!profileImageUrl.value.trim()) {
    userStore.errorMessage = '프로필 이미지를 먼저 선택해 주세요.'
    return
  }

  savingProfileImage.value = true
  successMessage.value = ''
  userStore.errorMessage = ''

  try {
    await userStore.updateMyProfileImage({
      profileImageUrl: profileImageUrl.value.trim(),
    })
    profileImageFile.value = null
    profileImageUrl.value = ''
    profileImageDialog.value = false
    successMessage.value = '프로필 이미지가 변경되었습니다.'
  } catch {
    successMessage.value = ''
    // userStore.errorMessage is rendered in the alert above.
  } finally {
    savingProfileImage.value = false
  }
}

const handleUpdateChatNotification = async (enabled) => {
  await userStore.updateChatNotification({
    allowPushChat: enabled,
  })
}

const handleUpdateSocialNotification = async (enabled) => {
  await userStore.updateSocialNotification({
    allowPushSocial: enabled,
  })
}

const startEditGroupNickname = (group) => {
  editingGroupId.value = group.groupId
  groupNicknameInputs[group.groupId] = group.groupNickname || ''
  successMessage.value = ''
  userStore.errorMessage = ''
}

const handleUpdateGroupNickname = async (group) => {
  savingGroupNickname.value = true
  successMessage.value = ''
  userStore.errorMessage = ''

  try {
    await userStore.updateNickname(group.groupId, {
      groupNickname: groupNicknameInputs[group.groupId],
    })
    editingGroupId.value = null
    successMessage.value = '그룹 닉네임이 변경되었습니다.'
  } catch {
    successMessage.value = ''
    // userStore.errorMessage is rendered in the alert above.
  } finally {
    savingGroupNickname.value = false
  }
}

const openPasswordDialog = () => {
  passwordDialog.value = true
  successMessage.value = ''
  userStore.errorMessage = ''
}

const closePasswordDialog = () => {
  passwordDialog.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.newPasswordConfirm = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showNewPasswordConfirm.value = false
}

const handleChangePassword = async () => {
  savingPassword.value = true
  successMessage.value = ''
  userStore.errorMessage = ''

  try {
    await userStore.changeMyPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      newPasswordConfirm: passwordForm.newPasswordConfirm,
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.newPasswordConfirm = ''
    showCurrentPassword.value = false
    showNewPassword.value = false
    showNewPasswordConfirm.value = false
    passwordDialog.value = false
    successMessage.value = '비밀번호가 변경되었습니다.'
  } catch {
    successMessage.value = ''
    // userStore.errorMessage is rendered in the alert above.
  } finally {
    savingPassword.value = false
  }
}

const openLogoutDialog = () => {
  logoutDialog.value = true
  successMessage.value = ''
  userStore.errorMessage = ''
}

const handleLogout = async () => {
  try {
    await logout()             // 1. 서버 호출 - 쿠키 삭제 응답 받음
  } catch (e) {
    // 서버 에러나도 어차피 로그아웃은 시켜야 함
  }
  authStore.logout()           // 2. localStorage 정리
  router.replace('/auth')
}

const openWithdrawDialog = () => {
  withdrawDialog.value = true
  withdrawConfirmText.value = ''
  successMessage.value = ''
  userStore.errorMessage = ''
}

const closeWithdrawDialog = () => {
  withdrawDialog.value = false
  withdrawConfirmText.value = ''
}

const handleWithdraw = async () => {
  if (!canWithdraw.value) {
    return
  }

  withdrawing.value = true

  try {
    await userStore.withdrawMe()
    closeWithdrawDialog()
    router.push('/auth')
  } finally {
    withdrawing.value = false
  }
}

onMounted(loadMypage)
</script>

<style scoped>
.mypage {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 18px 10px 24px;
}

.section-card {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(51, 51, 51, 0.06);
}

.dialog-card {
  border-radius: 16px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
}

.dialog-card :deep(.v-card-title) {
  padding: 20px 20px 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.dialog-card :deep(.v-card-text) {
  padding: 14px 20px 18px;
}

.dialog-card :deep(.v-card-actions) {
  padding: 0 20px 18px;
}

.password-dialog-card :deep(.v-card-title) {
  padding: 24px 24px 10px;
  font-size: 20px;
}

.password-dialog-card :deep(.v-card-text) {
  padding: 18px 24px 22px;
}

.password-dialog-card :deep(.v-card-actions) {
  padding: 0 24px 24px;
}

.section-card :deep(.v-card-title) {
  padding: 18px 14px 8px;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.section-card :deep(.v-card-text) {
  padding: 14px 14px 18px;
}

.profile-card :deep(.v-card-text) {
  padding: 20px 14px;
}

.account-card :deep(.v-card-title) {
  padding-left: 10px;
  padding-right: 10px;
}

.account-card :deep(.v-card-text) {
  padding-left: 8px;
  padding-right: 8px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-image-wrap {
  position: relative;
  flex: 0 0 auto;
}

.profile-edit-button {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 30px;
  height: 30px;
  min-width: 30px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #ffffff;
  color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(51, 51, 51, 0.22);
}

.profile-edit-button:hover {
  background: #f7f6ff;
  transform: translateY(-1px);
}

.profile-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  color: var(--color-text-primary);
}

.profile-text strong {
  font-size: 18px;
  line-height: 1.35;
}

.profile-text span {
  color: var(--color-text-secondary);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.image-preview {
  width: 120px;
  height: 120px;
  margin: 12px 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: #ffffff;
}

.hidden-file-input {
  display: none;
}

.notification-list {
  display: grid;
  gap: 14px;
}

.notification-row {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.notification-row :deep(.v-switch) {
  flex: 0 0 auto;
}

.notification-label {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  flex: 1 1 auto;
  min-width: 0;
  color: var(--color-text-primary);
  font-weight: 600;
}

.notification-icon {
  width: 33px;
  height: 33px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(108, 99, 255, 0.14);
  background: rgba(108, 99, 255, 0.09);
  font-size: 19px;
  flex: 0 0 auto;
  filter: saturate(0.78) opacity(0.9);
}

.notification-copy {
  display: inline-flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1.3;
}

.notification-copy strong {
  font-size: 15px;
  font-weight: 700;
}

.notification-copy small {
  color: #666666;
  font-size: 12px;
  font-weight: 500;
}

.chat-icon {
  background: rgba(108, 99, 255, 0.09);
}

.social-icon {
  background: rgba(108, 99, 255, 0.09);
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  background: transparent;
}

.group-item {
  cursor: pointer;
  min-height: 72px;
  padding: 12px 10px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: #fbfbfb;
  box-shadow: 0 2px 8px rgba(51, 51, 51, 0.05);
}

.group-edit-button {
  color: var(--color-text-secondary);
}

.nickname-edit {
  width: 100%;
  min-width: 250px;
  display: grid;
  gap: 8px;
  padding: 4px 0;
}

.nickname-edit-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px;
  gap: 8px;
  align-items: center;
}

.nickname-edit :deep(.v-field) {
  min-height: 36px;
}

.nickname-edit :deep(.v-field__input) {
  min-height: 36px;
  padding-inline-start: 13px;
  padding-top: 6px;
  padding-bottom: 6px;
}

.nickname-save-button {
  min-width: 56px;
  height: 36px;
}

.editing-group-name {
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.35;
}

.empty-text {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.account-row {
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: 16px;
  background: #ffffff;
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  line-height: 1.4;
  padding: 0 14px;
  text-align: left;
  white-space: nowrap;
}

.account-row-label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.account-icon {
  width: 33px;
  height: 33px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: #e6e6e6;
  color: var(--color-text-primary);
  font-size: 17px;
}

.logout-icon {
  position: relative;
  background: #e9edf2;
  border-color: #dde3ea;
  color: #4b5563;
}

.password-icon {
  background: rgba(49, 95, 189, 0.09);
  border-color: rgba(49, 95, 189, 0.16);
  color: #315fbd;
}

.logout-arrow {
  position: absolute;
  right: 4px;
  top: 10px;
}

.withdraw-icon {
  position: relative;
  background: #f2d8d8;
  border-color: #e7bcbc;
  color: #d32f2f;
}

.withdraw-icon :deep(.v-icon) {
  transform: translateX(-2px);
}

.withdraw-x {
  position: absolute;
  right: 6px;
  top: 6px;
  color: #d32f2f;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.password-row {
  background: #f2f7ff;
  color: #315fbd;
}

.password-form {
  padding: 12px 0 10px;
}

.password-input-group {
  padding: 16px 14px;
  border: 1px solid #e8ecf5;
  border-radius: 16px;
  background: #f8faff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.password-field-label {
  display: block;
  margin: 16px 0 8px;
  color: #315fbd;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.password-field-label:first-child {
  margin-top: 0;
}

.password-input {
  width: calc(100% + 2px);
  margin-top: 0;
  margin-left: -1px;
}

.password-input :deep(.v-field) {
  --v-field-padding-start: 13px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(49, 95, 189, 0.06);
}

.password-input :deep(.v-field__input) {
  padding-inline-start: 13px;
}

.password-input :deep(.v-field__append-inner) {
  transform: translateX(-4px);
}

.password-rule {
  margin: -2px 0 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.account-actions {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.account-danger-row {
  background: #fff3f3;
  color: #d32f2f;
}

.dialog-text {
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

.dialog-sub-text {
  margin-top: 8px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.withdraw-warning {
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid #e7bcbc;
  border-radius: 16px;
  background: #fff3f3;
  color: var(--color-text-primary);
  box-shadow: 0 3px 12px rgba(211, 47, 47, 0.08);
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #d32f2f;
}

.warning-title strong {
  font-size: 16px;
}

.warning-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f2d8d8;
  line-height: 1;
  padding-bottom: 2px;
}

.withdraw-confirm-word {
  color: #c54a4a;
  font-weight: 700;
}

.dialog-cancel-button {
  min-width: 72px;
  height: 36px;
  border-radius: 12px;
  background: #eeeaff;
  color: #6c63ff;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(108, 99, 255, 0.12);
}

.logout-confirm-button {
  min-width: 82px;
  height: 36px;
  border-radius: 12px;
  background: #e9edf2;
  color: #4b5563;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(75, 85, 99, 0.12);
}

.password-save-button {
  min-width: 72px;
  height: 36px;
  border-radius: 12px;
  background: #e5efff;
  color: #315fbd;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(49, 95, 189, 0.12);
}

.withdraw-confirm-button {
  min-width: 88px;
  height: 36px;
  border-radius: 12px;
  background: #f5dada;
  color: #c54a4a;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(197, 74, 74, 0.12);
}

.withdraw-confirm-input {
  margin-left: 5px;
  width: calc(100% - 5px);
}

.withdraw-confirm-input :deep(.v-field) {
  --v-field-padding-start: 13px;
}

.withdraw-confirm-input :deep(.v-field__input) {
  padding-inline-start: 13px !important;
}

.withdraw-confirm-input :deep(.v-field__input input) {
  padding-inline-start: 0;
}

.withdraw-confirm-input :deep(.v-field-label) {
  max-width: none;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.withdraw-confirm-input :deep(.v-field-label:not(.v-field-label--floating)) {
  margin-inline-start: 5px;
}

.withdraw-confirm-input :deep(.v-field-label--floating) {
  max-width: none;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.warning-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
  color: #4a2f2f;
  font-size: 14px;
  line-height: 1.45;
}

@media (max-width: 360px) {
  .profile {
    align-items: flex-start;
  }

  .nickname-edit {
    min-width: 210px;
  }
}

</style>
