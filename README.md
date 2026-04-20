# ![header](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20&height=200&animation=twinkling&section=header&text=BeatBuddy&fontSize=80&fontAlign=75&fontAlignY=36)

# BeatBuddy - 음악 취향 기반 친목 커뮤니티 서비스

## 👀 목차
1. [👥 팀원](#팀원)
2. [📚 프로젝트 개요](#프로젝트-개요)
3. [🔧 시스템 아키텍처](#시스템-아키텍처)
4. [🖥 화면 및 기능 설계서](#화면-및-기능-설계서)
5. [🧪 테스트 계획 및 결과 보고서](#테스트-계획-및-결과-보고서)
---

### 👥 팀원

| 팀원1 | 팀원2 | 팀원3 | 팀원4 | 팀원5 | 팀원6 |
| --- | --- | --- | --- | --- | --- |
| 김예지 | 박하얀 | 방지혁 | 이다윗 | 허진호 | 황희수

## 📌 프로젝트 개요

### 📘 프로젝트 소개

**BeatBuddy**는 소속 집단 구성원들의 음악적 취향 데이터를 분석하여 정서적 공감대가 높은 동료를 연결해 주는 팀 빌딩 지원 플랫폼입니다.

가입 시 최애곡 10곡을 선택하면, 곡의 음악적 특성을 분석하여 16차원 취향 벡터를 생성합니다. 같은 그룹에 속한 멤버들과 코사인 유사도를 계산해 취향이 비슷한 사람을 추천받고, 마음에 드는 상대에게 친구 신청을 보내 1:1 채팅으로 대화할 수 있습니다.

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
- 그룹 내 취향 기반 친구 추천 (코사인 유사도)
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

## 🖥 화면 및 기능 설계서

> [화면 및 기능 설계서](https://www.figma.com/board/daSTynfA5bNxs7zU00zo6I/flow-chart?t=ePHmKATAdPWGXzb6-1)

<details>
<summary>회원 관리</summary>
<img width="4482" height="2642" alt="BeatBuddy 화면설계서 (1)" src="https://github.com/user-attachments/assets/c681f270-19f1-4081-8cd7-a404a28fc52d" />
</details>

<details>
<summary>그룹</summary>
<img width="4482" height="2794" alt="BeatBuddy 화면설계서 (2)" src="https://github.com/user-attachments/assets/272c93a9-c80b-44a8-b915-2b49d9bd7e37" />
</details>

<details>
<summary>음악</summary>
<img width="4490" height="3077" alt="BeatBuddy 화면설계서 (3)" src="https://github.com/user-attachments/assets/9010f5a6-956e-44a4-8c29-872238c08078" />
</details>

<details>
<summary>친구</summary>
<img width="3474" height="2650" alt="BeatBuddy 화면설계서 (4)" src="https://github.com/user-attachments/assets/f9d4605f-c5c7-464b-a614-2b55f7086f1f" />
</details>

<details>
<summary>채팅</summary>
<img width="3474" height="1411" alt="BeatBuddy 화면설계서 (5)" src="https://github.com/user-attachments/assets/aa5284f3-6278-4508-a853-e18171991d07" />
</details>

<details>
<summary>마이페이지</summary>
<img width="3474" height="4465" alt="BeatBuddy 화면설계서 (6)" src="https://github.com/user-attachments/assets/a9fbde85-5a8f-4237-bc21-8a0594b51ea1" />
</details>





---

## 🧪 테스트 계획 및 결과 보고서

  > [테스트 계획 및 결과 보고서](https://docs.google.com/spreadsheets/d/1_pKygK3_dZ3CGeiM8Y9sOOe0t-kFvco2/edit?gid=424294998#gid=424294998)

---


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

#### 김예지
> 프론트엔드 작업을 진행하면서 사실 백엔드보다 더 어렵게 느껴졌습니다. Axios나 Pinia를 처음 사용해보다 보니 생소한 부분이 많았고, 특히 Pinia store에서 토큰을 가져와 Axios 인터셉터에 붙이는 과정이나 백엔드 API와 실제로 연결하는 작업이 쉽지 않았습니다. 시간적인 여유가 없었던 탓에 완성도 면에서 아쉬움이 남지만, 백과 프론트를 직접 연결해보는 경험 자체는 많은 것을 배울 수 있었던 시간이었습니다.

#### 박하얀
> 이번 프로젝트를 통해 프론트엔드 개발이 단순히 화면을 만드는 작업만은 아니라는 것을 느꼈습니다. Vue를 사용해 화면을 구성하고, 버튼을 누르거나 데이터를 입력했을 때 자연스럽게 동작하도록 만드는 과정이 생각보다 세밀하고 어렵게 느껴졌습니다. 화면이 보이는 것과 실제로 잘 작동하는 것은 다르다는 점도 많이 느꼈습니다. 특히 백엔드 API와 연결해서 데이터를 받아오고, 그 데이터를 화면에 보여주는 과정에서 작은 오류 하나로도 기능이 제대로 동작하지 않는 경우가 많아 여러 번 수정과 테스트를 반복했습니다. 제가 맡은 음악 기능에서도 곡 검색, 선택, 저장 같은 흐름을 구현하면서 테스트 했을 때, 불편한 점이 생기면 어떻게 개선을 해야 할지 많은 고민을 하기도 했습니다. 이번 프로젝트를 통해 프론트엔드를 구현하면서 더 디테일하게 구현하지 못한 것이 좀 아쉽습니다.

#### 방지혁
> 가장 당황스러웠던 건 Axios 인터셉터 문제였습니다. 토큰 갱신이 왜 안 되지 싶었는데, /auth/ 경로를 인터셉터에서 통째로 스킵하도록 짜놓은 탓에 refresh 엔드포인트까지 제외되고 있었습니다. 코드 몇 줄의 실수가 전체 인증 흐름을 망가뜨릴 수 있다는 걸 직접 디버깅하면서 배웠습니다.

#### 이다윗
> 이번 프로젝트에서 저는 프론트엔드의 친구, 친구 추천, 알림, 음악 취향 선택 화면을 담당했습니다. 친구 목록과 알림 화면을 구현하고, 그룹 추천 화면에서 추천 사용자를 카드 형태로 보여주며 친구 요청과 스킵 기능을 연결했습니다. 문제 해결 과정에서는
  추천 사용자 이름이 그룹 닉네임으로 표시되지 않는 문제가 있었습니다.
  백엔드 응답의 groupNickname 필드를 확인한 뒤, groupNickname이 있으면 우선 표시하고 없을 때만 일반 nickname을 보여주도록 수정했습니다. 또한 기존 취향을 수정할 때도 최초 저장 API가 호출되어 오류가 발생하는 문제가 있었습니다.
  이를 해결하기 위해 저장 직전에 기존 취향 여부를 조회하고, 기존 데이터가 있으면 PUT 요청을, 없으면 POST 요청을 보내도록 분기했습니다.
  이번 프로젝트를 통해 프론트엔드는 화면 구현뿐 아니라 API 응답 구조, 상태 관리, 예외 상황까지 함께 고려해야 한다는 점을 배웠습니다.


#### 허진호
> 백엔드에 이어 프론트엔드 프로젝트까지 참여하며, 우리가 평소 아무렇지 않게 사용하는 서비스들이 결코 쉽게 만들어지는 것이 아니라는 점을 직접 느낄 수 있었습니다. 화면에 보이는 기능 하나에도 많은 고민과 노력, 그리고 수많은 과정이 담겨 있다는 것을 알게 되었고, 프로젝트를 진행할수록 개발이 얼마나 섬세하고 협업이 중요한 일인지 깨닫게 되었습니다. 이번 경험을 통해 아직 제가 많이 부족하다는 것도 느꼈지만, 그만큼 더 많이 배우고 꾸준히 공부해야겠다는 다짐을 하게 되었습니다. 부족한 저를 이끌어주시고 함께 프로젝트를 진행해주신 조장님과 팀원분들께 진심으로 감사드립니다.

#### 황희수
> 초기에 프론트엔드 환경 설정과 라이브러리 활용에 익숙해지는 데 많은 시간을 할애하다 보니, 전체적인 UI/UX 흐름을 설계하는 부분에 더 많은 시간을 쏟지 못한 점이 아쉽습니다. 하지만 환경 세팅부터 Axios, Vue Router, Pinia 등 각 라이브러리가 전체 아키텍처에서 어떤 역할을 수행하는지 직접 부딪히며 이해할 수 있었습니다. 또한, 작성한 로직이 눈에 보이는 즉각적인 결과물로 변환된다는 점이 백엔드와는 또 다른 재미로 다가왔고 사용자 입장에서 생각하는 습관을 기를 수 있어서 좋은 경험이었습니다.

![footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20&height=100&section=footer)
