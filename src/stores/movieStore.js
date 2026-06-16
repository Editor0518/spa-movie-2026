import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useFavoritesStore } from './favorites';

export const useMovieStore = defineStore('movies', () => {
    // state
    const movies = ref([]);

    //ux and exception handling
    const isLoading = ref(false);
    const errorMessage = ref('');

    const selectedMovie = ref(null);

    // 2. 외부 favorites 스토어 가져오기
    const favoritesStore = useFavoritesStore();

    const fetchMovies = async () => {
        isLoading.value = true;
        errorMessage.value = '';

        try {
            const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

            const movieParams = {
                api_key: API_KEY,
                language: 'ko-KR',
                region: 'KR',
                sort_by: 'popularity.desc',
                include_adult: false,
                release_date: '2025-01-01',
                with_release_type: '2|3',
                page:1
            };
            const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { 
                params: movieParams 
            });
            const fetchedMovies = response.data.results;

            // 3. favoritesStore에 저장된 목록과 비교하여 찜 상태 동기화
            fetchedMovies.forEach(movie => {
                movie.isFavorite = favoritesStore.favoriteMovies.some(fav => fav.id === movie.id);
            });

            movies.value = fetchedMovies;
        } catch (error) {
            errorMessage.value = '영화 정보 데이터를 불러오는 데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    };

    const fetchMovieDetail = async (movieId) => {
        isLoading.value = true;
        errorMessage.value = '';
        selectedMovie.value = null; //영화 목록 새로고침 시 상세보기 초기화

        try {
            const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
            const url = `https://api.themoviedb.org/3/movie/${movieId}`;

            const response = await axios.get(url, { 
                params: {
                    api_key: API_KEY,
                    language: 'ko-KR', 
                }
            });
            selectedMovie.value = response.data; //상세보기용 단일 영화 데이터 저장
        } catch (error) {
            if (error.response && error.response.status === 404) {
                errorMessage.value = '존재하지 않거나 삭제된 영화 정보입니다.';
            }
            else {
                errorMessage.value = '서버 통신 중 에러가 발생했습니다.';
            }
        } finally {
            isLoading.value = false;
        }
    };

    // 5. 찜하기 토글 시 favoritesStore의 액션을 호출하도록 변경
    const toggleFavorite = (movie) => {
        // 영화 목록 스토어 내부 상태 토글
        const targetMovie = movies.value.find(m => m.id === movie.id);
        if (targetMovie) {
            targetMovie.isFavorite = !targetMovie.isFavorite;
        }
        // 상세페이지 전용 상태 토글
        if (selectedMovie.value && selectedMovie.value.id === movie.id) {
            selectedMovie.value.isFavorite = !selectedMovie.value.isFavorite;
        }

        // 실제 로컬스토리지 저장 및 전역 관리는 favoritesStore에 위임
        // (favorites.js의 toggleFavorite은 영화 객체 전체를 인자로 받으므로 객체를 넘겨줍니다)
        favoritesStore.toggleFavorite(movie);
    };

    return {
        movies,
        favorites,
        isLoading,
        errorMessage,
        fetchMovies,
        toggleFavorite,
        selectedMovie,
        fetchMovieDetail
    };
});
