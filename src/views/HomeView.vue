<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieStore } from '../stores/movieStore';

const router = useRouter();
const store = useMovieStore();

const localQuery = ref('');

const handleSearch = () => {
  if (localQuery.value.trim() !== '') {
    // 엔터를 치는 순간에 전역 스토어(movieStore)의 searchQuery로 값을 전송
    store.searchQuery = localQuery.value;
    // 전송 후 영화 목록 페이지로 이동
    router.push('/movies');
  }
};
</script>

<template>
  <main class="page">
    <h1>우리만의 영화 리뷰 사이트</h1>
    <p>최종 프로젝트의 메인 페이지입니다. 환영합니다!</p>

    <div class="home-search-zone">
      <input 
        v-model="localQuery" 
        @keydown.enter="handleSearch"
        type="text" 
        placeholder="원하는 영화 제목을 입력하고 엔터를 누르세요..." 
        class="search-input"
      />
    </div>
  </main>
</template>

<style scoped>
.page{
  padding: 40px;
  text-align: center;
}

.home-search-zone {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
.search-input {
  width: 100%;
  max-width: 500px;
  padding: 14px 20px;
  font-size: 16px;
  border: 2px solid #ced4da;
  border-radius: 30px;
  outline: none;
  transition: border-color 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.search-input:focus {
  border-color: #ff4757;
}
</style>