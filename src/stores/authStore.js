import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 나 store 만들게요 하고 Pinia한테 등록하는 것
// auth: 이 store의 이름표
export const useAuthStore = defineStore('auth', () => {
    // 상태
    // 처음엔 둘 다 null (로그인 전)
    // 로그인 후 받는 Access Token 문자열
    const token = ref(localStorage.getItem('token') || null)
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)

    // 계산값
    const isLoggedIn = computed(() => !!token.value)
    // !!: 값을 boolean으로 변환
    // ex)  !!null  : false  (로그인 안 됨)
    //      !!"abc" : true   (로그인 됨)

    // 함수
    function setToken(accessToken) {
        token.value = accessToken // 로그인 성공 시 토큰 저장
        localStorage.setItem('token', accessToken);
    }

    function setUser(userInfo) {
        user.value = userInfo   // 유저 정보 저장
        localStorage.setItem('user', JSON.stringify(userInfo))  // 추가
    }

    function logout() {
        token.value = null     // 토큰 지우기
        user.value = null      // 유저 정보 지우기
        localStorage.removeItem('token')   // 추가
        localStorage.removeItem('user')    // 추가
    }

    return { token, user, isLoggedIn, setToken, setUser, logout }
})
