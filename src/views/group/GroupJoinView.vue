<template>
    <div class="join-page">
        <v-form ref="formRef">
            <div class="form-box">
                <div style="margin-bottom: 20px">
                    <v-text-field
                        ref="inviteCodeField"
                        v-model="inviteCode"
                        label="초대 코드 *"
                        variant="outlined"
                        bg-color="#f5f5f5"
                        density="comfortable"
                        persistent-placeholder
                        :rules="inviteCodeRules"
                        @blur="fetchGroupByCode"
                        class="custom-field"
                    />
                </div>
                <div style="margin-bottom: 20px">
                    <v-text-field
                        ref="nicknameField"
                        v-model="groupNickname"
                        label="닉네임"
                        placeholder="미설정 시, 유저 닉네임을 사용합니다"
                        variant="outlined"
                        bg-color="#f5f5f5"
                        density="comfortable"
                        persistent-placeholder
                        :rules="nicknameRules"
                        @blur="checkNicknameDuplicate"
                        class="custom-field"
                    />
                </div>
                <v-btn
                    block
                    color="primary"
                    rounded="lg"
                    height="52"
                    :disabled="!isFormValid"
                    @click="handleJoin"
                >
                    가입하기
                </v-btn>
            </div>
        </v-form>

        <div class="info-box">
            <div class="info-title">
                <span class="info-icon">🔑</span>
                <span>초대 코드란?</span>
            </div>
            <p class="info-desc">그룹 멤버로부터 받은 초대 코드를 입력하면 해당 그룹에 바로 가입할 수 있습니다.</p>
        </div>

        <!-- 가입 성공 모달 -->
        <v-dialog v-model="showSuccessDialog" max-width="320">
            <v-card rounded="xl">
                <v-card-title class="d-flex justify-space-between align-center" style="padding: 24px 24px 8px">
                    가입 성공!
                    <v-btn icon="mdi-close" variant="text" size="small" @click="goHome" />
                </v-card-title>
                <v-card-text style="padding: 8px 24px 16px">
                    <p style="font-size: 15px; color: var(--color-text-primary);">
                        <span style="color: var(--color-primary); font-weight: 700;">{{ groupName }}</span>
                        그룹에 성공적으로 가입되었습니다.
                    </p>
                </v-card-text>
                <v-card-actions style="padding: 0 24px 24px">
                    <v-btn block color="primary" variant="flat" rounded="lg" height="48" @click="goHome">
                        확인
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 가입 실패 모달 (이미 가입한 그룹) -->
        <v-dialog v-model="showErrorDialog" max-width="320">
            <v-card rounded="xl">
                <v-card-title class="d-flex justify-space-between align-center" style="padding: 24px 24px 8px">
                    가입 실패
                    <v-btn icon="mdi-close" variant="text" size="small" @click="showErrorDialog = false" />
                </v-card-title>
                <v-card-text style="padding: 8px 24px 16px">
                    <p style="font-size: 15px; color: #333;">{{ errorMessage }}</p>
                </v-card-text>
                <v-card-actions style="padding: 0 24px 24px">
                    <v-btn block color="primary" variant="flat" rounded="lg" height="48" @click="showErrorDialog = false">
                        확인
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getGroupByInviteCode, joinGroup, checkNickname } from '@/api/group.js'

const router = useRouter()
const formRef = ref(null)
const inviteCode = ref('')
const groupNickname = ref('')
const showSuccessDialog = ref(false)
const showErrorDialog = ref(false)
const groupName = ref('')
const errorMessage = ref('')
const foundGroupId = ref(null)  // 조회된 그룹 ID 저장용
const foundGroupName = ref('')
const inviteCodeField = ref(null)
const nicknameField = ref(null)

const inviteCodeError = ref(null)
const nicknameError = ref(null)

const inviteCodeRules = [
    v => !!v?.trim() || '초대 코드를 입력해주세요.',
    () => inviteCodeError.value ?? true,
]

const nicknameRules = [
    () => nicknameError.value ?? true,
]

const isFormValid = computed(() =>
    !!inviteCode.value.trim()
)

// 초대코드로 그룹 조회 (blur 시점)
const fetchGroupByCode = async () => {
    if (!inviteCode.value.trim()) return
    inviteCodeError.value = null
    try {
        const res = await getGroupByInviteCode(inviteCode.value)
        foundGroupId.value = res.data.result?.groupId ?? null
        foundGroupName.value = res.data.result?.groupName ?? ''
        inviteCodeError.value = null
    } catch (e) {
        foundGroupId.value = null
        const status = e.response?.status
        const msg = e.response?.data?.message ?? ''
        if (status === 404) {
            inviteCodeError.value = msg || '존재하지 않는 그룹입니다.'
        } else {
            inviteCodeError.value = '초대 코드를 확인해주세요.'
        }
    }
    await inviteCodeField.value.validate()
}

// 닉네임 중복 체크 (blur 시점)
const checkNicknameDuplicate = async () => {
    if (!groupNickname.value.trim() || !foundGroupId.value) return
    try {
        const res = await checkNickname(foundGroupId.value, groupNickname.value)
        if (res.data.result === true) {
            nicknameError.value = '이미 사용 중인 닉네임입니다.'
        } else {
            nicknameError.value = null
        }
    } catch (e) {
        console.error('닉네임 중복 체크 실패', e)
    }
    await nicknameField.value.validate()
}

const handleJoin = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    // 초대코드로 그룹 조회가 안 된 경우 방어
    if (!foundGroupId.value) {
        inviteCodeError.value = '초대 코드를 다시 확인해주세요.'
        await formRef.value.validate()
        return
    }

    try {
        await joinGroup(foundGroupId.value, {
            inviteCode: inviteCode.value,
            groupNickname: groupNickname.value,
        })
        groupName.value = foundGroupName.value
        showSuccessDialog.value = true
    } catch (e) {
        console.error('그룹 가입 실패', e)
        const status = e.response?.status
        const msg = e.response?.data?.message ?? ''

        if (status === 400) {
            if (msg.includes('초대코드') || msg.includes('초대 코드')) {
                inviteCodeError.value = msg
            } else if (msg.includes('닉네임')) {
                nicknameError.value = msg
            }
            await formRef.value.validate()
        } else if (status === 409) {
            if (msg.includes('닉네임')) {
                nicknameError.value = msg
                await formRef.value.validate()
            } else {
                errorMessage.value = msg || '이미 가입한 그룹입니다.'
                showErrorDialog.value = true
            }
        } else {
            errorMessage.value = msg || '가입에 실패했습니다. 다시 시도해주세요.'
            showErrorDialog.value = true
        }
    }
}

const goHome = () => {
    showSuccessDialog.value = false
    router.push('/')
}
</script>

<style scoped>
.join-page {
    min-height: calc(100vh - 136px);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    background: #fff;
}

.form-box {
    width: 100%;
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid var(--color-border);
}

.info-box {
    width: 100%;
    background: #E8F4FD;
    border-radius: 12px;
    padding: 16px;
}

.info-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 8px;
}

.info-icon {
    font-size: 16px;
}

.info-desc {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.custom-field :deep(input) {
    padding-left: 12px !important;
}
</style>
