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

    <v-card class="section-card" elevation="0">
      <v-card-text class="profile">
        <v-avatar size="72">
          <v-img
            v-if="profileImage"
            :src="profileImage"
            alt="프로필 이미지"
          />
          <v-icon v-else icon="mdi-account" size="42" />
        </v-avatar>

        <div class="profile-text">
          <strong>{{ displayName }}</strong>
          <span>{{ profileEmail }}</span>
          <span v-if="profile.birthYear || profile.gender">
            {{ profile.birthYear || '-' }}년생 · {{ profile.gender || '-' }}
          </span>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="section-card" elevation="0">
      <v-card-title>프로필 이미지</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="profileImageUrl"
          label="이미지 URL"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
        <v-btn
          class="mt-3"
          block
          :loading="savingProfileImage"
          @click="handleUpdateProfileImage"
        >
          이미지 변경
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card class="section-card" elevation="0">
      <v-card-title>알림 설정</v-card-title>
      <v-card-text>
        <v-switch
          v-model="allowPushChat"
          color="primary"
          label="채팅 알림"
          hide-details
          @update:model-value="handleUpdateChatNotification"
        />
        <v-switch
          v-model="allowPushSocial"
          color="primary"
          label="친구/소셜 알림"
          hide-details
          @update:model-value="handleUpdateSocialNotification"
        />
      </v-card-text>
    </v-card>

    <v-card class="section-card" elevation="0">
      <v-card-title>그룹 닉네임</v-card-title>
      <v-card-text>
        <v-list v-if="groupNicknames.length" class="group-list">
          <v-list-item
            v-for="group in groupNicknames"
            :key="group.groupId"
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
              {{ group.groupName || `그룹 ${group.groupId}` }}
            </template>

            <template #subtitle>
              현재 닉네임: {{ group.groupNickname || '-' }}
            </template>

            <template #append>
              <div class="nickname-edit">
                <v-text-field
                  v-model="groupNicknameInputs[group.groupId]"
                  label="새 닉네임"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
                <v-btn
                  size="small"
                  @click="handleUpdateGroupNickname(group)"
                >
                  저장
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
        <p v-else class="empty-text">그룹 닉네임이 없습니다.</p>
      </v-card-text>
    </v-card>

    <v-card class="section-card" elevation="0">
      <v-card-title>비밀번호 변경</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="passwordForm.currentPassword"
          label="현재 비밀번호"
          type="password"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
        <v-text-field
          v-model="passwordForm.newPassword"
          class="mt-3"
          label="새 비밀번호"
          type="password"
          variant="outlined"
          density="comfortable"
          hint="8~16자의 영문, 숫자, 특수문자를 포함해야 합니다."
          persistent-hint
        />
        <v-text-field
          v-model="passwordForm.newPasswordConfirm"
          class="mt-3"
          label="새 비밀번호 확인"
          type="password"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
        <v-btn
          class="mt-3"
          block
          :loading="savingPassword"
          @click="handleChangePassword"
        >
          비밀번호 변경
        </v-btn>
      </v-card-text>
    </v-card>

    <v-btn
      class="withdraw-button"
      color="error"
      variant="tonal"
      block
      :loading="withdrawing"
      @click="handleWithdraw"
    >
      회원 탈퇴
    </v-btn>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const profileImageUrl = ref('')
const allowPushChat = ref(false)
const allowPushSocial = ref(false)
const groupNicknameInputs = reactive({})
const savingProfileImage = ref(false)
const savingPassword = ref(false)
const withdrawing = ref(false)

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
const profileImage = computed(() => profile.value.profileImageUrl || '')

watch(profileImage, (value) => {
  profileImageUrl.value = value
})

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

const handleUpdateProfileImage = async () => {
  savingProfileImage.value = true

  try {
    await userStore.updateMyProfileImage({
      profileImageUrl: profileImageUrl.value,
    })
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

const handleUpdateGroupNickname = async (group) => {
  await userStore.updateNickname(group.groupId, {
    groupNickname: groupNicknameInputs[group.groupId],
  })
}

const handleChangePassword = async () => {
  savingPassword.value = true

  try {
    await userStore.changeMyPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      newPasswordConfirm: passwordForm.newPasswordConfirm,
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.newPasswordConfirm = ''
  } finally {
    savingPassword.value = false
  }
}

const handleWithdraw = async () => {
  const confirmed = window.confirm('정말 탈퇴하시겠습니까?')

  if (!confirmed) {
    return
  }

  withdrawing.value = true

  try {
    await userStore.withdrawMe()
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
  gap: 16px;
  padding: 16px;
}

.section-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  color: var(--color-text-primary);
}

.profile-text span {
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}

.group-list {
  padding: 0;
}

.nickname-edit {
  display: grid;
  grid-template-columns: minmax(104px, 1fr) auto;
  gap: 8px;
  align-items: center;
  width: 180px;
}

.empty-text {
  color: var(--color-text-secondary);
}

.withdraw-button {
  margin-bottom: 16px;
}
</style>
