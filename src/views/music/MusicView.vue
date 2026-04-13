<template>
    <div class="music-page">
        <h1>내 음악 취향</h1>
        <p>최애곡 10곡을 선택하고 취향을 분석해보세요.</p>

        <button>최애곡 선택하기</button>
    </div>
</template>

<script setup>
</script>

<style scoped>
.music-page {
    padding: 30px;
}

h1 {
    font-size: 28px;
    margin-bottom: 10px;
}

p {
    margin-bottom: 20px;
    color: gray;
}

button {
    padding: 10px 16px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}
</style>
