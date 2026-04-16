# ![header](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20&height=200&animation=twinkling&section=header&text=BeatBuddy&fontSize=80&fontAlign=75&fontAlignY=36)

# BeatBuddy - 음악 취향 기반 친목 커뮤니티 서비스

## 👀 목차
1. [👥 팀원](#팀원)
2. [📚 프로젝트 개요](#프로젝트-개요)
3. [🔧 시스템 아키텍처](#시스템-아키텍처)
---

### 👥 팀원

| 팀원1 | 팀원2 | 팀원3 | 팀원4 | 팀원5 | 팀원6 |
| --- | --- | --- | --- | --- | --- |
| 김예지 | 박하얀 | 방지혁 | 이다윗 | 허진호 | 황희수

## 📌 프로젝트 개요

### 📘 프로젝트 소개

**BeatBuddy**는 소속 집단 구성원들의 음악적 취향 데이터를 분석하여 정서적 공감대가 높은 동료를 연결해 주는 팀 빌딩 지원 플랫폼입니다.

가입 시 최애곡 10곡을 선택하면, 곡의 음악적 특성을 분석하여 16차원 취향 벡터를 생성합니다. 같은 그룹에 속한 멤버들과 유클리드 거리를 계산해 취향이 비슷한 사람을 추천받고, 마음에 드는 상대에게 친구 신청을 보내 1:1 채팅으로 대화할 수 있습니다.

---

### ✅ 배경: 왜 이 서비스가 필요한가?

**취향 기반 연결의 필요성**

기존 소셜 서비스는 외형이나 조건 중심의 매칭으로 인해 실제 깊이 있는 정서적 교감을 기대하기 어렵고, 이는 곧 대화의 단절과 관계 유지를 위한 심리적 피로감으로 이어집니다.

**음악이 가진 연결의 힘**

음악 취향은 성격, 감성, 라이프스타일과 높은 상관관계를 가집니다. 같은 곡을 좋아한다는 사실만으로도 대화의 물꼬를 트기 쉬워집니다.

**그룹 기반 안전한 만남**

그룹 안에서만 추천이 이루어지므로, 불특정 다수와의 무작위 연결이 아닌 신뢰할 수 있는 환경에서 친구를 사귈 수 있습니다.

---

## 📑 요구사항 분석

### 🎵 1. 음악 취향 분석
- 최애곡 10곡 선택 (Spotify API 연동)
- 곡별 음악 특성 수집 (SoundNet API)
- 16차원 취향 벡터 생성 및 저장
- 취향 프로필 조회 및 수정

### 👤 2. 사용자 기능
- 이메일 회원가입 / 로그인 (JWT)
- 이메일 인증 (Gmail SMTP)
- 비밀번호 찾기 / 변경
- 프로필 관리 및 회원탈퇴

### 👥 3. 그룹 기능
- 그룹 생성
- 초대 코드 기반 그룹 가입
- 그룹 내 취향 기반 친구 추천 (유클리드 거리)
- 추천 프로필 조회 (넘기기 / 친구 신청)

### 🤝 4. 친구 기능
- 친구 신청 / 수락 / 거절
- 친구 목록 조회 및 검색
- 친구 프로필 및 최애곡 확인
- 친구 삭제

### 💬 5. 채팅
- 1:1 실시간 채팅 (WebSocket)
- 채팅방 목록 및 안읽은 메시지 수 표시
- 채팅방 나가기

### 🔔 6. 알림
- 친구 신청 / 수락 알림

---

## 🔧 시스템 아키텍처

> <img width="6337" height="3477" alt="Web App Reference Architecture" src="https://github.com/user-attachments/assets/aa12a9b9-0a6d-4915-9db9-c88309f9b282" />

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | ![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white) |
| Backend | ![SpringBoot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) |
| Database | ![MariaDB](https://img.shields.io/badge/MariaDB(MySQL)-003545?style=for-the-badge&logo=mariadb&logoColor=white) |
| ORM | ![MyBatis](https://img.shields.io/badge/MyBatis-000000?style=for-the-badge) |
| 인증 | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) |
| 이메일 | ![Gmail](https://img.shields.io/badge/GmailSMTP-EA4335?style=for-the-badge&logo=gmail&logoColor=white) |
| 실시간 채팅 | ![WebSocket](https://img.shields.io/badge/WebSocket(STOMP)-010101?style=for-the-badge) |
| 외부 API | ![Spotify](https://img.shields.io/badge/SpotifyAPI-1DB954?style=for-the-badge&logo=spotify&logoColor=white)&nbsp;![RapidAPI](https://img.shields.io/badge/RapidAPI-0055DA?style=for-the-badge&logo=rapid&logoColor=white) |


---

### 회고록

#### 팀원1
> 회고 작성 예정

#### 팀원2
> 회고 작성 예정

#### 팀원3
> 회고 작성 예정

#### 팀원4
> 회고 작성 예정

#### 팀원5
> 회고 작성 예정

#### 팀원6
> 회고 작성 예정

![footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20&height=100&section=footer)
