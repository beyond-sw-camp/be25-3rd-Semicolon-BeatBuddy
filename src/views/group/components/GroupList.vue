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
        >
            <div class="group-item">
                <v-img
                    v-if="group.groupImageUrl"
                    :src="`http://localhost:8088${group.groupImageUrl}`"
                    cover
                    class="group-img"
                />
                <v-icon v-else icon="mdi-account-group" color="primary" size="32" class="mx-3" />
                <div class="group-info">
                    <p class="group-name">{{ group.groupName }}</p>
                    <p class="group-desc">{{ group.description }}</p>
                    <v-chip size="x-small" color="primary" variant="tonal" class="mt-1">
                        멤버 {{ group.memberCount }}명
                    </v-chip>
                </div>
                <v-btn
                    v-if="editMode"
                    icon="mdi-exit-to-app"
                    variant="text"
                    color="red"
                    size="small"
                    class="ml-auto"
                    @click="confirmLeave(group)"
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
                <p style="font-size: 15px; color: #333;">정말 이 그룹에서 나가시겠습니까?</p>
                <p style="font-size: 13px; color: #aaa; margin-top: 6px;">나간 후에는 다시 초대 코드가 필요합니다.</p>
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
                <p style="font-size: 15px; color: #333;">이 그룹에서 나가면 그룹이 삭제됩니다. 정말 나가시겠습니까?</p>
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

defineProps({
    groups: {
        type: Array,
        default: () => []
    },
    loading: Boolean,
    editMode: Boolean,
})

const emit = defineEmits(['leave'])

const showLeaveDialog = ref(false)
const showLastMemberDialog = ref(false)
const selectedGroup = ref(null)

const confirmLeave = (group) => {
    selectedGroup.value = group
    if (group.memberCount <= 1) {
        showLastMemberDialog.value = true
    } else {
        showLeaveDialog.value = true
    }
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
    gap: 16px;
    margin-bottom: 24px;
}

.group-item {
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border-radius: 8px;
    height: 90px;
}

.group-img {
    flex-shrink: 0;
    min-width: 90px;
    max-width: 90px;
    height: 90px;
}

.group-info {
    flex: 1;
    padding: 12px;
    min-width: 0;
}

.group-name {
    font-size: 15px;
    font-weight: 700;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.group-desc {
    font-size: 13px;
    color: #888;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>