import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useMovieStore = defineStore('movies', () => {
    // state
    const movies = ref([]);

    // session storage
    const favorites = ref(JSON.parse(sessionStorage.getItem('favorites')) || []);

    //ux and exception handling
    const isLoading = ref(false);
    const errorMessage = ref('');

    const selectedMovie = ref(null);

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

            //async session storage update
            fetchedMovies.forEach(movie => {
                const isAlreadyFavorite = favorites.value.some(fav => fav.id === movie.id);
                movie.isFavorite = isAlreadyFavorite;
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
    
    //찜하기 토글과 세션 스토리지 반영 로직
    const toggleFavorite = (movieId) => {
        const movie = movies.value.find(m => m.id === movieId);
        if (movie) {
            movie.isFavorite = !movie.isFavorite;

            //하트 활성화 시 전역 찜 목록 금고 배열에 현재 영화 객체 추가
            if (movie.isFavorite) {
                favorites.value.push(movie);
            } else {
                favorites.value = favorites.value.filter(m => m.id !== movieId);
            }
            sessionStorage.setItem('favorites', JSON.stringify(favorites.value));
        }
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
