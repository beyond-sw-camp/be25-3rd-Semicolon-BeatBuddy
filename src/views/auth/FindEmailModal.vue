<template>
  <v-dialog v-model="show" max-width="320" rounded="lg">
    <v-card rounded="lg" class="modal-card">

      <div class="modal-content">
        <h2 class="title">아이디 찾기</h2>
        <p class="subtitle">가입 시 등록한 이메일을 입력하시면<br>가입 여부를 확인할 수 있습니다.</p>

        <!-- 입력 전 -->
        <template v-if="result === null">
          <v-text-field
            v-model="email"
            placeholder="가입 이메일을 입력하세요"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :rules="emailRules"
            rounded="lg"
          />
          <div class="btn-group">
            <v-btn variant="outlined" rounded="lg" @click="handleClose">취소</v-btn>
            <v-btn color="primary" rounded="lg" :loading="isLoading" @click="handleCheck">확인</v-btn>
          </div>
        </template>

        <!-- 결과 표시 -->
        <template v-else>
          <div :class="['result-message', result ? 'success' : 'error']">
            <p v-if="result">가입된 이메일입니다.</p>
            <p v-else>가입되지 않은 이메일입니다.</p>
          </div>
          <v-btn color="primary" block rounded="lg" @click="handleClose">확인</v-btn>
        </template>
      </div>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { checkEmail } from '@/api/auth'

const props = defineProps({
  modelValue: Boolean  // v-model로 열고 닫기
})
const emit = defineEmits(['update:modelValue'])

const show = ref(props.modelValue)
const email = ref('')
const isLoading = ref(false)
const result = ref(null)

// 부모에서 v-model 바뀌면 동기화
watch(() => props.modelValue, (val) => {
  show.value = val
  if (val) {
    email.value = ''
    result.value = null
  }
})

// 모달 닫힐 때 부모한테 알려줌
watch(show, (val) => {
  emit('update:modelValue', val)
})

const emailRules = [
  v => !!v || '이메일을 입력해주세요.',
  v => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다.',
]

function handleClose() {
  show.value = false
}

async function handleCheck() {
  if (!/.+@.+\..+/.test(email.value)) return

  isLoading.value = true
  try {
    const response = await checkEmail(email.value)
    result.value = response.data.result.registered
  } catch (error) {
    result.value = false
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-card {
  padding: 0;
}

.modal-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0;
}

.subtitle {
  font-size: 13px;
  color: #9e9e9e;
  margin: 0;
  line-height: 1.6;
}

.btn-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.result-message {
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.result-message p {
  margin: 0;
}

.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.error {
  background: #ffebee;
  color: #FF5252;
}

:deep(.v-field__input) {
  padding-left: 10px !important;
}

:deep(.v-field--error .v-field__outline) {
  color: #FF5252 !important;
}

</style>