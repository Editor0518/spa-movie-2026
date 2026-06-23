<script setup>
import { ref, computed } from 'vue';
import { useFavoritesStore } from '../stores/favorites.js';

const favoritesStore = useFavoritesStore();

/* ==========================================================
   [추가 미션 4] 찜 목록 전용 20개 구간 슬라이싱 페이지네이션
   ========================================================== */
const currentPage = ref(1);
const itemsPerPage = 20;

const totalPages = computed(() => {
    return Math.ceil(favoritesStore.favoriteMovies.length / itemsPerPage);
});

const paginatedFavorites = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // 1. 찜 목록을 역순으로 정렬하여 최신순으로 표시
    const reversedFavorites = [];
    const originalList = favoritesStore.favoriteMovies;

    // 2. 찜 목록 뒤집기 (최신순 정렬)
    for (let i = originalList.length - 1; i >= 0; i--) {
        // 맨 뒤에 있는 영화부터 새로운 배열에 push()로 밀어 넣습니다.
        reversedFavorites.push(originalList[i]);
    }
    
    // 3. 최신순으로 정렬된 새 배열에서 20개씩 슬라이싱하여 화면에 반환합니다.
    return reversedFavorites.slice(start, end);
});

</script>

<template>
    <main class="page">
        <div class="header-section">
            <h1>나의 찜 목록</h1>
            <p class="sub-title">관심 작품으로 등록하신 영화 보관함입니다.</p>
        </div>

        <div v-if="favoritesStore.favoriteMovies.length === 0" class="no-results">
            아직 찜한 영화가 없습니다. 영화 목록에서 마음에 드는 작품을 추가해 보세요!
        </div>

        <div v-else>
            <div class="movie-list">
                <div v-for="movie in paginatedFavorites" :key="movie.id" class="movie-card">
                    <img v-if="movie.poster_path" :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="movie.title" class="poster" />
                    <div class="card-content">
                        <h3 class="title">{{ movie.title }}</h3>
                        <p class="rating">평점: {{ movie.vote_average?.toFixed(1) }} / 10</p>
                        <button @click="favoritesStore.toggleFavorite(movie)" class="fav-btn active">찜 해제</button>
                    </div>
                    <RouterLink :to="`/movies/${movie.id}`" class="stretched-link"></RouterLink>
                </div>
            </div>

            <div v-if="totalPages > 1" class="pagination-container">
                <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn arrow-btn">이전</button>
                <button 
                    v-for="page in totalPages" 
                    :key="page" 
                    @click="currentPage = page"
                    :class="{ active: currentPage === page }"
                    class="page-btn num-btn"
                >
                    {{ page }}
                </button>
                <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-btn arrow-btn">다음</button>
            </div>
        </div>
    </main>
</template>

<style scoped>
.page { padding: 40px; background-color: #f8f9fa; min-height: 100vh; }
.header-section { margin-bottom: 30px; text-align: center; color: #2c3e50; }
.sub-title { font-size: 14px; color: #7f8c8d; margin-top: 5px; }
.movie-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 30px; }
.movie-card{
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    text-align: left;
    box-shadow: 0 4px 15px rgba(0,0.05);
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
}
.movie-card:hover {
    transform: translateY(-5px);
}
.poster {
    width: 100%;
    height: 380px;
    object-fit: cover;
}
.poster-placeholder {
    width: 100%;
    height: 380px;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    font-weight: bold;
}
.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.title {
    font-size: 18px;
    color: #333;
    margin: 0 0 6px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
}
.release-date {
    font-size: 13px;
    color: #f39c12;
    margin-bottom: 10px;
    font-size: 16px;
}
.rating {
    font-weight: bold;
    color: #f39c12;
    margin-bottom: 10px;
    font-size: 16px;
}
.overview{
    font-size: 13px;
    color: #555;
    line-height: 1.4;
    margin-bottom: 20px;
   flex-grow: 1;
}
.fav-btn{
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 12px;
    cursor: pointer;
    border: none;
    background: #ecf0f1;
    color: #333;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    transition: 0.3s;
    margin-top: auto;
}
.fav-btn.active{
    background: #ff4757;
    color: white;
}
.stretched-link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

/* [추가 미션 4] 하단 페이지네이션 컴포넌트 스타일링 */
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
    padding: 40px 0 20px 0;
}
.page-btn {
    padding: 8px 14px;
    font-size: 14px;
    font-weight: 700;
    border: 1px solid #dee2e6;
    background-color: #ffffff;
    color: #495057;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.page-btn:hover:not(:disabled) {
    background-color: #f1f2f6;
    border-color: #ced4da;
}
.page-btn.active {
    background-color: #ff4757;
    color: #ffffff;
    border-color: #ff4757;
    box-shadow: 0 4px 10px rgba(255, 71, 87, 0.2);
}
.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>