<script setup>
import {ref} from 'vue';
import { useFavoritesStore } from '../stores/favorites.js';

//중앙 금고
const favoritesStore = useFavoritesStore();

const movies = ref([
    { id: 1, title: '인셉션', rating: 9.5 },
    { id: 2, title: '어바웃 타임', rating: 9.2 },
    { id: 3, title: '인터스텔라', rating: 9.8 },
    { id: 4, title: '조커', rating: 8.9 }
])
</script>

<template>
    <main class="page">
        <div class="header-area">
            <h1>영화 목록</h1>
            <button @click="favoritesStore.clearAllFavorites" class="clear-btn">
                찜 목록 전체 비우기
            </button>
        </div>
        <ul>
            <li v-for="movie in movies" :key="movie.id" class="movie-item">
                <span class="movie-info">{{ movie.title }} (평점: {{ movie.rating }})</span>
                <button @click="favoritesStore.toggleFavorite(movie)" class="fav-btn">
                    {{ favoritesStore.favoriteMovies.some((m) => m.id === movie.id) ? '찜 취소' : '찜하기' }}
                </button>
            </li>
        </ul>
    </main>
</template>

<style scoped>
.page {padding: 40px;}
ul{
    list-style: none;
    padding: 0;
}
li{
    padding: 10px;
    border-bottom: 1px solid #ddd;
    font-size: 18px;
}
.page {padding: 40px; max-width: 800px; margin: 0 auto;}
.header-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.ul{
    list-style: none;
    padding: 0;
}
.movie-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #ddd;
    font-size: 18px;
}
.fav-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #ffdde1;
    font-weight: bold;
    transition: 0.2s;
}
.fav-btn:hover {
    background-color: #ffc0cb;
}
.clear-btn {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: white;
    background-color: #555;
    font-weight: bold;
}
.clear-btn:hover {
    background-color: #333;
}

</style>