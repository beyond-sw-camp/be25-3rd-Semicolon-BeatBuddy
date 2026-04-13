<template>
  <div class="music-view">
    <!-- 내 취향 프로필 -->
    <div class="profile-section">
      <div class="taste-header">
        <span class="mdi mdi-music-note-outline taste-icon" />
        <div>
          <h3 class="taste-title">내 음악 취향</h3>
          <p class="taste-sub">최애곡을 기반으로 분석된 취향이에요</p>
        </div>
      </div>

      <!-- 취향 특성 바 -->
      <div v-if="musicStore.tasteVector.length" class="vector-bars">
        <div v-for="(val, idx) in displayVector" :key="idx" class="vector-row">
          <span class="vector-label">{{ vectorLabels[idx] }}</span>
          <div class="vector-bar-bg">
            <div class="vector-bar-fill" :style="{ width: `${val * 100}%` }" />
          </div>
          <span class="vector-val">{{ Math.round(val * 100) }}</span>
        </div>
      </div>
      <div v-else-if="loading" class="center-box">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else class="empty-box">
        <span class="mdi mdi-music-off empty-icon" />
        <p>취향 프로필이 없어요</p>
        <p class="sub">최애곡을 선택해 주세요!</p>
      </div>
    </div>

    <!-- 최애곡 목록 -->
    <div class="songs-section">
      <div class="section-header">
        <h3 class="section-title">💿 내 최애곡 {{ musicStore.favoriteSongs.length }}곡</h3>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          prepend-icon="mdi-pencil"
          @click="showEditDialog = true"
        >수정</v-btn>
      </div>
      <div class="song-list" v-if="musicStore.favoriteSongs.length">
        <div v-for="(song, i) in musicStore.favoriteSongs" :key="song.trackId" class="song-row">
          <span class="song-rank">{{ i + 1 }}</span>
          <img v-if="song.albumCover" :src="song.albumCover" class="song-cover" />
          <div class="song-info">
            <p class="song-title">{{ song.title }}</p>
            <p class="song-artist">{{ song.artist }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 수정 다이얼로그 -->
    <v-dialog v-model="showEditDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary" flat>
          <v-btn icon="mdi-close" @click="showEditDialog = false" />
          <v-toolbar-title>최애곡 수정</v-toolbar-title>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="editSelected.length !== 10"
            :loading="saving"
            @click="saveFavorites"
          >저장 ({{ editSelected.length }}/10)</v-btn>
        </v-toolbar>
        <v-card-text class="pa-4">
          <!-- 검색 -->
          <v-text-field
            v-model="songQuery"
            label="곡 검색"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            color="primary"
            density="compact"
            class="mb-3"
            @keyup.enter="searchSongs"
          />
          <!-- 검색 결과 -->
          <div v-if="musicStore.searchResults.length" class="search-list">
            <div
              v-for="song in musicStore.searchResults"
              :key="song.trackId"
              class="song-search-item"
              :class="{ selected: isSelected(song) }"
              @click="toggleSong(song)"
            >
              <img v-if="song.albumCover" :src="song.albumCover" class="song-cover" />
              <div class="song-info">
                <p class="song-title">{{ song.title }}</p>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
              <span class="mdi" :class="isSelected(song) ? 'mdi-check-circle' : 'mdi-plus-circle-outline'" />
            </div>
          </div>
          <!-- 선택된 곡 -->
          <div v-if="editSelected.length" class="selected-section">
            <p class="selected-label">선택된 곡 ({{ editSelected.length }}/10)</p>
            <div v-for="(song, i) in editSelected" :key="song.trackId" class="selected-item">
              <span class="song-rank">{{ i + 1 }}</span>
              <img v-if="song.albumCover" :src="song.albumCover" class="song-cover" />
              <div class="song-info flex-1">{{ song.title }}</div>
              <v-btn icon="mdi-close" size="x-small" variant="text" @click="removeSong(song)" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()

const loading = ref(false)
const showEditDialog = ref(false)
const saving = ref(false)
const songQuery = ref('')
const editSelected = ref([])

// 취향 벡터 16개 레이블 (음악 특성)
const vectorLabels = [
  'Danceability', 'Energy', 'Speechiness', 'Acousticness',
  'Instrumentalness', 'Liveness', 'Valence', 'Tempo',
  'Loudness', 'Mode', 'Key', 'Duration',
  'Time Signature', 'Popularity', 'Happiness', 'Intensity'
]

const displayVector = computed(() => musicStore.tasteVector.slice(0, 16))

onMounted(async () => {
  loading.value = true
  try {
    await musicStore.fetchMyProfile()
  } finally {
    loading.value = false
  }
})

async function searchSongs() {
  await musicStore.searchSongs(songQuery.value)
}

function isSelected(song) {
  return editSelected.value.some((s) => s.trackId === song.trackId)
}

function toggleSong(song) {
  if (isSelected(song)) {
    removeSong(song)
  } else if (editSelected.value.length < 10) {
    editSelected.value.push(song)
  }
}

function removeSong(song) {
  editSelected.value = editSelected.value.filter((s) => s.trackId !== song.trackId)
}

async function saveFavorites() {
  saving.value = true
  try {
    await musicStore.saveFavorites(editSelected.value)
    showEditDialog.value = false
    musicStore.clearSearch()
    editSelected.value = []
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.music-view {
  padding: 16px;
}

.profile-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.taste-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.taste-icon {
  font-size: 36px;
  color: #6C63FF;
}

.taste-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.taste-sub {
  font-size: 12px;
  color: #888;
}

.vector-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vector-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vector-label {
  font-size: 11px;
  color: #888;
  width: 110px;
  flex-shrink: 0;
}

.vector-bar-bg {
  flex: 1;
  height: 8px;
  background: #f0eeff;
  border-radius: 4px;
  overflow: hidden;
}

.vector-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6C63FF, #a78fdf);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.vector-val {
  font-size: 11px;
  color: #6C63FF;
  width: 24px;
  text-align: right;
}

.songs-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.song-list {
  display: flex;
  flex-direction: column;
}

.song-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.song-rank {
  font-size: 14px;
  font-weight: 700;
  color: #aaa;
  width: 20px;
  text-align: center;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.song-info {
  flex: 1;
}

.song-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.song-artist {
  font-size: 12px;
  color: #888;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  color: #bbb;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.sub {
  font-size: 12px;
  color: #ccc;
  margin-top: 4px;
}

.center-box {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.search-list {
  margin-bottom: 16px;
}

.song-search-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.song-search-item:hover { background: #f5f0ff; }
.song-search-item.selected { background: #ede9ff; }

.song-search-item .mdi {
  font-size: 22px;
  color: #6C63FF;
}

.selected-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.selected-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
}

.flex-1 {
  flex: 1;
  font-size: 13px;
  color: #333;
}
</style>
