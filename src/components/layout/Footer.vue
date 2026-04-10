<template>
    <nav class="tab-bar">
        <RouterLink to="/" class="tab-item">
            <span class="mdi mdi-account-group"></span>
            <span>그룹</span>
        </RouterLink>
        <RouterLink to="/friend" class="tab-item">
            <span class="mdi mdi-account-multiple"></span>
            <span>친구</span>
        </RouterLink>
        <RouterLink to="/music" class="tab-item">
            <span class="mdi mdi-music"></span>
            <span>음악</span>
        </RouterLink>
        <RouterLink to="/chat" class="tab-item">
            <span class="mdi mdi-chat"></span>
            <span>채팅</span>
        </RouterLink>
        <RouterLink to="/mypage" class="tab-item">
            <span class="mdi mdi-account"></span>
            <span>마이페이지</span>
        </RouterLink>
    </nav>
</template>

<style scoped>
.tab-bar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    height: 72px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: linear-gradient(135deg, #8B9FE8, #A78FD8, #C87DB8);
    border-top: 1px solid #eee;
    z-index: 100;
}

.tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-decoration: none;
    color: #333;
    font-size: 12px;
}

.tab-item .mdi {
    font-size: 26px;
}

.tab-item.router-link-active {
    color: #fff;
}
</style>