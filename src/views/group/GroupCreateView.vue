<template>
    <div class="create-page">
        <div class="image-upload">
            <v-avatar size="100" color="surface-variant">
                <v-img v-if="previewImage" :src="previewImage" cover />
                <v-icon v-else icon="mdi-account-group" size="48" color="secondary" />
            </v-avatar>
            <v-btn @click="triggerFileInput"
                icon="mdi-camera"
                size="small"
                color="primary"
                class="camera-btn"
            />
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageChange"
            />
            <p class="image-hint">5MB 이하의 이미지 파일만 가능합니다</p>
        </div>

        <v-form ref="formRef">
            <div style="margin-bottom: 20px">
                <v-text-field
                    ref="groupNameField"
                    v-model="form.groupName"
                    label="그룹명 *"
                    placeholder="중복되지 않는 그룹 명칭 (최대 20자)"
                    maxlength="20"
                    counter
                    variant="outlined"
                    density="comfortable"
                    persistent-placeholder
                    :rules="groupNameRules"
                    @blur="checkGroupNameDuplicate"
                />
            </div>
            <div style="margin-bottom: 20px">
                <v-text-field
                    v-model="form.groupNickname"
                    label="닉네임 *"
                    placeholder="그룹 내에서 사용할 닉네임 (최대 20자)"
                    maxlength="20"
                    counter
                    variant="outlined"
                    density="comfortable"
                    persistent-placeholder
                    :rules="nicknameRules"
                />
            </div>
            <div style="margin-bottom: 20px">
                <v-text-field
                    v-model="form.description"
                    label="한 줄 소개"
                    placeholder="그룹 메인에 노출될 소개글 (최대 50자)"
                    maxlength="50"
                    counter
                    variant="outlined"
                    density="comfortable"
                    persistent-placeholder
                />
            </div>
            <div style="margin-bottom: 25px">
                <v-text-field
                    ref="inviteCodeField"
                    v-model="form.inviteCode"
                    label="초대 코드 *"
                    placeholder="그룹 초대 코드 (최대 20자)"
                    maxlength="20"
                    counter
                    variant="outlined"
                    density="comfortable"
                    persistent-placeholder
                    :rules="inviteCodeRules"
                    @blur="checkInviteCodeDuplicate"
                />
            </div>
            <v-btn
                block
                color="primary"
                rounded="lg"
                height="52"
                @click="handleCreate"
                :disabled="!isFormValid"
            >
                그룹 개설하기
            </v-btn>
        </v-form>

        <!-- 그룹 생성 성공 모달 -->
        <v-dialog v-model="showSuccessDialog" max-width="320">
            <v-card rounded="xl">
                <v-card-title class="d-flex justify-space-between align-center" style="padding: 24px 24px 8px">
                    그룹 생성 완료
                    <v-btn icon="mdi-close" variant="text" size="small" @click="goHome" />
                </v-card-title>
                <v-card-text style="padding: 8px 24px 16px">
                    <p style="font-size: 15px; color: var(--color-text-primary);">
                        <span style="color: var(--color-primary); font-weight: 700;">{{ groupName }}</span>
                        그룹이 성공적으로 생성되었습니다.
                    </p>
                </v-card-text>
                <v-card-actions style="padding: 0 24px 24px">
                    <v-btn
                        block
                        color="primary"
                        variant="flat"
                        rounded="lg"
                        height="48"
                        @click="goHome"
                    >
                        확인
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 그룹 생성 실패 모달 -->
        <v-dialog v-model="showErrorDialog" max-width="320">
            <v-card rounded="xl">
                <v-card-title class="d-flex justify-space-between align-center" style="padding: 24px 24px 8px">
                    그룹 생성 실패
                    <v-btn icon="mdi-close" variant="text" size="small" @click="showErrorDialog = false" />
                </v-card-title>
                <v-card-text style="padding: 8px 24px 16px">
                    <p style="font-size: 15px; color: var(--color-text-primary);">{{ errorMessage }}</p>
                </v-card-text>
                <v-card-actions style="padding: 0 24px 24px">
                    <v-btn
                        block
                        color="primary"
                        variant="flat"
                        rounded="lg"
                        height="48"
                        @click="showErrorDialog = false"
                    >
                        확인
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 이미지 용량 초과 모달 -->
        <v-dialog v-model="showImageErrorDialog" max-width="320">
            <v-card rounded="xl">
                <v-card-title class="d-flex justify-space-between align-center" style="padding: 24px 24px 8px">
                    이미지 업로드 실패
                    <v-btn icon="mdi-close" variant="text" size="small" @click="showImageErrorDialog = false" />
                </v-card-title>
                <v-card-text style="padding: 8px 24px 16px">
                    <p style="font-size: 15px; color: var(--color-text-primary);">5MB 이하의 이미지만 업로드할 수 있습니다.</p>
                </v-card-text>
                <v-card-actions style="padding: 0 24px 24px">
                    <v-btn
                        block
                        color="primary"
                        variant="flat"
                        rounded="lg"
                        height="48"
                        @click="showImageErrorDialog = false"
                    >
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
import { createGroup, checkGroupName, checkInviteCode } from '@/api/group.js'

const router = useRouter()
const formRef = ref(null)
const fileInput = ref(null)
const previewImage = ref(null)
const imageFile = ref(null)
const groupNameField = ref(null)
const inviteCodeField = ref(null)
const showSuccessDialog = ref(false)
const showErrorDialog = ref(false)
const showImageErrorDialog = ref(false)
const groupName = ref('')
const errorMessage = ref('')

const form = ref({
    groupName: '',
    groupNickname: '',
    description: '',
    inviteCode: '',
})

const groupNameError = ref(null)
const nicknameError = ref(null)
const inviteCodeError = ref(null)

const groupNameRules = [
    v => !!v?.trim() || '그룹명을 입력해주세요.',
    () => groupNameError.value ?? true,
]

const nicknameRules = [
    v => !!v?.trim() || '닉네임을 입력해주세요.',
    () => nicknameError.value ?? true,
]

const inviteCodeRules = [
    v => !!v?.trim() || '초대 코드를 입력해주세요.',
    v => /^[A-Z0-9]+$/.test(v) || '초대코드는 영문 대문자와 숫자만 가능합니다.',
    () => inviteCodeError.value ?? true,
]

const isFormValid = computed(() => {
    return (
        !!form.value.groupName.trim() &&
        !!form.value.groupNickname.trim() &&
        !!form.value.inviteCode.trim()
    )
})

const triggerFileInput = () => {
    fileInput.value.click()
}

// 그룹명 중복 체크
const checkGroupNameDuplicate = async () => {
    if (!form.value.groupName.trim()) return
    try {
        const res = await checkGroupName(form.value.groupName)
        if (res.data.result === true) {
            groupNameError.value = '이미 존재하는 그룹명입니다.'
        } else {
            groupNameError.value = null
        }
        await groupNameField.value.validate()
    } catch (e) {
        console.error('그룹명 중복 체크 실패', e)
    }
}

// 초대코드 중복 체크
const checkInviteCodeDuplicate = async () => {
    if (!form.value.inviteCode.trim()) return
    try {
        const res = await checkInviteCode(form.value.inviteCode)
        if (res.data.result === true) {
            inviteCodeError.value = '이미 사용 중인 초대 코드입니다.'
        } else {
            inviteCodeError.value = null
        }
        await inviteCodeField.value.validate()
    } catch (e) {
        console.error('초대코드 중복 체크 실패', e)
    }
}

const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
        showImageErrorDialog.value = true
        return
    }
    imageFile.value = file
    previewImage.value = URL.createObjectURL(file)
}

const handleCreate = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    try {
        const formData = new FormData()
        formData.append('data', new Blob([JSON.stringify(form.value)], { type: 'application/json' }))
        if (imageFile.value) {
            formData.append('groupImage', imageFile.value)
        }
        await createGroup(formData)
        groupName.value = form.value.groupName
        showSuccessDialog.value = true
    } catch (e) {
        console.error('그룹 만들기 실패', e)
        const status = e.response?.status
        const msg = e.response?.data?.message ?? ''

        if (status === 400) {
            if (msg.includes('그룹명')) {
                groupNameError.value = msg
            } else if (msg.includes('닉네임')) {
                nicknameError.value = msg
            } else if (msg.includes('초대')) {
                inviteCodeError.value = msg
            }
            await formRef.value.validate()
        } else {
            errorMessage.value = msg || '그룹 생성에 실패했습니다.'
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
.create-page {
    padding: 24px 16px;
}

.image-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 28px;
    position: relative;
}

.camera-btn {
    position: absolute;
    bottom: 28px;
    right: calc(50% - 58px);
    cursor: pointer;
}

.image-hint {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-top: 8px;
}
</style>