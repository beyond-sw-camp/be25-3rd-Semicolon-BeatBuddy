<template>
  <div class="group-view">
    <!-- 그룹 선택 바 -->
    <div class="group-tabs" v-if="groupStore.groups.length">
      <div
        v-for="group in groupStore.groups"
        :key="group.id"
        :class="['group-chip', { active: groupStore.currentGroupId === group.id }]"
        @click="selectGroup(group.id)"
      >{{ group.name }}</div>
    </div>

    <!-- 추천 멤버 영역 -->
    <div class="recommend-section" v-if="groupStore.currentGroupId">
      <div v-if="loading" class="center-box">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="groupStore.recommendations.length === 0" class="empty-box">
        <span class="mdi mdi-account-search empty-icon" />
        <p>추천할 새 친구가 없어요</p>
        <p class="sub">나중에 다시 확인해 보세요!</p>
      </div>
      <div v-else class="card-stack">
        <!-- 현재 추천 카드 -->
        <div class="member-card">
          <div class="card-avatar">
            <img
              v-if="currentMember.profileImage"
              :src="currentMember.profileImage"
              class="avatar-img"
            />
            <span v-else class="mdi mdi-account avatar-icon" />
          </div>
          <h3 class="member-name">{{ currentMember.name }}</h3>
          <p class="member-email">{{ currentMember.email }}</p>
          <div class="taste-chips" v-if="currentMember.topSongs?.length">
            <v-chip
              v-for="song in currentMember.topSongs.slice(0, 3)"
              :key="song.id"
              size="small"
              color="primary"
              variant="tonal"
              class="ma-1"
            >{{ song.title }}</v-chip>
          </div>
          <div class="similarity-badge" v-if="currentMember.similarity">
            <span class="mdi mdi-heart" />
            취향 유사도 {{ Math.round(currentMember.similarity * 100) }}%
          </div>
          <div class="card-actions">
            <v-btn
              icon="mdi-close"
              color="grey"
              variant="tonal"
              size="large"
              class="mr-4"
              @click="skip"
            />
            <v-btn
              icon="mdi-account-plus"
              color="primary"
              size="large"
              :loading="requestLoading"
              @click="sendRequest"
            />
          </div>
          <div class="action-labels">
            <span>넘기기</span>
            <span>친구 신청</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 그룹 없을 때 -->
    <div v-else class="empty-box">
      <span class="mdi mdi-account-group empty-icon" />
      <p>아직 속한 그룹이 없어요</p>
      <p class="sub">그룹에 참여하면 친구를 추천받을 수 있어요!</p>
    </div>

    <!-- 하단 FAB -->
    <div class="fab-area">
      <v-btn icon="mdi-plus" color="primary" size="large" @click="showGroupDialog = true" />
    </div>

    <!-- 그룹 생성/참가 다이얼로그 -->
    <v-dialog v-model="showGroupDialog" max-width="360">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="dialog-title">그룹 참여</v-card-title>
        <v-card-text>
          <v-tabs v-model="groupTab" color="primary" class="mb-4">
            <v-tab value="join">초대 코드로 가입</v-tab>
            <v-tab value="create">새 그룹 만들기</v-tab>
          </v-tabs>
          <div v-if="groupTab === 'join'">
            <v-text-field
              v-model="groupCode"
              label="초대 코드"
              variant="outlined"
              prepend-inner-icon="mdi-key-outline"
              color="primary"
            />
          </div>
          <div v-else>
            <v-text-field
              v-model="newGroupName"
              label="그룹 이름"
              variant="outlined"
              prepend-inner-icon="mdi-account-group"
              color="primary"
            />
          </div>
          <p class="error-msg" v-if="dialogError">{{ dialogError }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showGroupDialog = false">취소</v-btn>
          <v-btn color="primary" :loading="dialogLoading" @click="handleGroupAction">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group'
import { useFriendStore } from '@/stores/friend'

const groupStore = useGroupStore()
const friendStore = useFriendStore()

const loading = ref(false)
const requestLoading = ref(false)
const showGroupDialog = ref(false)
const groupTab = ref('join')
const groupCode = ref('')
const newGroupName = ref('')
const dialogLoading = ref(false)
const dialogError = ref('')

const currentMember = computed(() => groupStore.recommendations[0] || {})

onMounted(async () => {
  loading.value = true
  try {
    await groupStore.fetchGroups()
    if (groupStore.currentGroupId) {
      await groupStore.fetchRecommendations(groupStore.currentGroupId)
    }
  } finally {
    loading.value = false
  }
})

async function selectGroup(groupId) {
  groupStore.setCurrentGroup(groupId)
  loading.value = true
  try {
    await groupStore.fetchRecommendations(groupId)
  } finally {
    loading.value = false
  }
}

async function skip() {
  if (!currentMember.value?.userId) return
  await groupStore.skipMember(currentMember.value.userId)
}

async function sendRequest() {
  if (!currentMember.value?.userId) return
  requestLoading.value = true
  try {
    await friendStore.sendRequest(currentMember.value.userId)
    await groupStore.skipMember(currentMember.value.userId)
  } finally {
    requestLoading.value = false
  }
}

async function handleGroupAction() {
  dialogError.value = ''
  dialogLoading.value = true
  try {
    if (groupTab.value === 'join') {
      await groupStore.joinGroup(groupCode.value)
    } else {
      await groupStore.createGroup({ name: newGroupName.value })
    }
    showGroupDialog.value = false
    groupCode.value = ''
    newGroupName.value = ''
  } catch (e) {
    dialogError.value = e.response?.data?.message || '처리에 실패했습니다.'
  } finally {
    dialogLoading.value = false
  }
}
</script>

<style scoped>
.group-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.group-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
}

.group-chip {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: #e0e0e0;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.group-chip.active {
  background: #6C63FF;
  color: #fff;
}

.recommend-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-stack {
  width: 100%;
  max-width: 340px;
}

.member-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(108, 99, 255, 0.15);
}

.card-avatar {
  width: 90px;
  height: 90px;
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

.member-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.member-email {
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
}

.taste-chips {
  margin-bottom: 12px;
}

.similarity-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ede9ff;
  color: #6C63FF;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

.card-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
}

.action-labels {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  color: #aaa;
  padding: 0 32px;
}

.empty-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bbb;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.sub {
  font-size: 13px;
  color: #ccc;
  margin-top: 4px;
}

.center-box {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.fab-area {
  position: fixed;
  bottom: 80px;
  right: calc(50% - 215px);
}

.dialog-card {
  padding: 8px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  padding: 16px 16px 0;
}

.error-msg {
  color: #FF5252;
  font-size: 13px;
  margin-top: 4px;
}
</style>
