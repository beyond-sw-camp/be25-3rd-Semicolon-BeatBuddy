<template>
    <div class="group-page">
        <v-toolbar flat color="transparent">
            <v-toolbar-title class="section-title">내 그룹</v-toolbar-title>
            <v-spacer />
            <v-btn variant="text" color="primary" @click="editMode = !editMode">
                {{ editMode ? '완료' : '편집' }}
            </v-btn>
        </v-toolbar>

        <GroupList
            :groups="groups"
            :loading="loading"
            :edit-mode="editMode"
            @leave="handleLeaveGroup"
        />

        <div class="bottom-buttons">
            <v-btn block color="primary" rounded="lg" height="52" class="mb-4" @click="router.push('/group/create')">
                + 새 그룹 만들기
            </v-btn>
            <v-btn block variant="outlined" color="primary" rounded="lg" height="52" class="mt-2" @click="router.push('/group/join')">
                초대 코드로 가입하기
            </v-btn>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyGroups, leaveGroup } from '@/api/group.js'
import GroupList from './components/GroupList.vue'

const router = useRouter()
const groups = ref([])
const loading = ref(false)
const editMode = ref(false)

const fetchGroups = async () => {
    loading.value = true
    try {
        const res = await getMyGroups()
        console.log(res.data)
        groups.value = res.data.result ?? res.data.data ?? []
    } catch (e) {
        console.error('그룹 목록 불러오기 실패', e)
        groups.value = []
    } finally {
        loading.value = false
    }
}

const handleLeaveGroup = async (groupId) => {
    try {
        await leaveGroup(groupId)
        await fetchGroups()
    } catch (e) {
        console.error('그룹 나가기 실패', e)
    }
}

onMounted(() => {
    fetchGroups()
})
</script>

<style scoped>
.group-page {
    padding: 8px 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #333;
}

.bottom-buttons {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>