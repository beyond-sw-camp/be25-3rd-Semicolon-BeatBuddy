<template>
    <v-row v-if="loading" justify="center" class="py-10">
        <v-progress-circular indeterminate color="primary" />
    </v-row>

    <v-empty-state
        v-else-if="groups.length === 0"
        text="아직 가입한 그룹이 없어요"
        class="py-10"
    />

    <div v-else class="group-list">
        <v-card
            v-for="group in groups"
            :key="group.groupId"
            rounded="lg"
            border
            flat
            style="display: flex; overflow: hidden;"
            @click="selectGroup(group)"
        >
            <div class="group-item">
                <div class="group-img-wrapper">
                    <v-img
                        v-if="group.groupImageUrl"
                        :src="`${apiBaseUrl}${group.groupImageUrl}`"
                        cover
                    />
                    <v-icon v-else icon="mdi-account-group" color="primary" size="32" class="mx-3" />
                </div>
                <div class="group-info">
                    <p class="group-name">{{ group.groupName }}</p>
                    <p class="group-desc">{{ group.description }}</p>
                    <p class="group-memberCount">멤버 {{ group.memberCount }}명</p>
                    <p class="invite-code-toggle" @click.stop="toggleInviteCode(group.groupId)">
                        {{ visibleInviteCodes[group.groupId] ? group.inviteCode : '초대코드' }}
                    </p>
                </div>
                <v-btn
                    v-if="editMode"
                    icon="mdi-exit-to-app"
                    variant="text"
                    color="red"
                    size="small"
                    class="ml-auto"
                    @click.stop="confirmLeave(group)"
                />
            </div>
        </v-card>
    </div>

    <!-- 일반 나가기 확인 모달 -->
    <v-dialog v-model="showLeaveDialog" max-width="320">
        <v-card rounded="xl">
            <v-card-title class="d-flex justify-space-between align-center" style="padding: 24px 24px 8px">
                그룹 나가기
                <v-btn icon="mdi-close" variant="text" size="small" @click="showLeaveDialog = false" />
            </v-card-title>
            <v-card-text style="padding: 8px 24px 16px">
                <p style="font-size: 15px; color: var(--color-text-primary);">정말 이 그룹에서 나가시겠습니까?</p>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin-top: 6px;">나간 후에는 다시 초대 코드가 필요합니다.</p>
            </v-card-text>
            <v-card-actions style="padding: 0 24px 24px; gap: 12px">
                <v-btn
                    variant="tonal"
                    color="grey"
                    rounded="lg"
                    height="48"
                    style="flex: 1"
                    @click="showLeaveDialog = false"
                >취소</v-btn>
                <v-btn
                    color="red"
                    variant="flat"
                    rounded="lg"
                    height="48"
                    style="flex: 1"
                    @click="handleLeave"
                >나가기</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- 마지막 멤버 경고 모달 -->
    <v-dialog v-model="showLastMemberDialog" max-width="320">
        <v-card rounded="xl">
            <v-card-title class="d-flex justify-space-between align-center" style="padding: 24px 24px 8px">
                마지막 멤버 경고
                <v-btn icon="mdi-close" variant="text" size="small" @click="showLastMemberDialog = false" />
            </v-card-title>
            <v-card-text style="padding: 8px 24px 16px">
                <p style="font-size: 15px; color: var(--color-text-primary);">이 그룹에서 나가면 그룹이 삭제됩니다. 정말 나가시겠습니까?</p>
            </v-card-text>
            <v-card-actions style="padding: 0 24px 24px; gap: 12px">
                <v-btn
                    variant="tonal"
                    color="grey"
                    rounded="lg"
                    height="48"
                    style="flex: 1"
                    @click="showLastMemberDialog = false"
                >취소</v-btn>
                <v-btn
                    color="red"
                    variant="flat"
                    rounded="lg"
                    height="48"
                    style="flex: 1"
                    @click="handleLeave"
                >나가기</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    groups: {
        type: Array,
        default: () => []
    },
    loading: Boolean,
    editMode: Boolean,
})
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const emit = defineEmits(['leave', 'select'])

const showLeaveDialog = ref(false)
const showLastMemberDialog = ref(false)
const selectedGroup = ref(null)
const visibleInviteCodes = ref({})

const toggleInviteCode = (groupId) => {
    visibleInviteCodes.value[groupId] = !visibleInviteCodes.value[groupId]
}

const confirmLeave = (group) => {
    selectedGroup.value = group
    if (group.memberCount <= 1) {
        showLastMemberDialog.value = true
    } else {
        showLeaveDialog.value = true
    }
}

const selectGroup = (group) => {
    if (props.editMode) return
    emit('select', group.groupId)
}

const handleLeave = () => {
    emit('leave', selectedGroup.value.groupId)
    showLeaveDialog.value = false
    showLastMemberDialog.value = false
}
</script>

<style scoped>
.group-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 24px;
}

.group-item {
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 90px;
}

.group-img-wrapper {
    flex-shrink: 0;
    aspect-ratio: 1 / 1;
    align-self: stretch;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.group-info {
    flex: 1;
    padding: 12px;
    min-width: 0;
}

.group-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.group-desc {
    font-size: 13px;
    color: var(--color-text-primary);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 20px;
}

.group-memberCount {
    font-size: 12px;
    color: var(--color-text-primary);
    margin-top: 2px;
}

.invite-code-toggle {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-top: 4px;
    cursor: pointer;
    width: fit-content;
}
</style>