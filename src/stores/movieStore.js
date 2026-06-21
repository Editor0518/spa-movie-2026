import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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

    const searchQuery = ref('');

    const filteredMovies = computed(() => {
        if (!searchQuery.value.trim()) {
            return movies.value;
        }
        // 대소문자 구분을 없애고 영화 제목(title)에 검색어가 포함되었는지 판별
        return movies.value.filter(movie => 
            movie.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    });

    /* ==========================================================
       [추가 미션 3] 외부 라이브러리 없는 순수 JS 다중 정렬 로직
       ========================================================== */
    const sortKey = ref('');      // 현재 활성화된 정렬 기준 ('title', 'release_date', 'vote_average')
    const sortOrder = ref('asc');  // 차순 제어 상태값 ('asc' 또는 'desc')

    
    const changeSort = (key) => {
        if (sortKey.value === key) {
            // 1) 이미 활성화된 기준을 다시 누른 경우: 오름차순/내림차순 토글
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            // 2) 새로운 정렬 기준을 처음 클릭한 경우: 기준 등록 및 기본값 분기
            sortKey.value = key;
            
            if (key === 'title') {
                // 제목순은 가나다라(오름차순)가 기본이 되도록 설정
                sortOrder.value = 'asc';
            } else {
                // 개봉일순(최신순), 평점순(높은순)은 내림차순이 기본이 되도록 설정
                sortOrder.value = 'desc';
            }
        }
    };

    // 필터링이 끝난 데이터 위에 순수 자바스크립트 내장 메서드인 sort() 연산 적용
    const sortedAndFilteredMovies = computed(() => {
        // 원본 배열 데이터의 불변성을 보장하기 위해 얕은 복사본 생성 후 연산 진행
        const list = [...filteredMovies.value];
        
        if (!sortKey.value) return list;

        return list.sort((a, b) => {
            let valA = a[sortKey.value];
            let valB = b[sortKey.value];

            // 데이터 예외 처리 (값이 비어있는 경우)
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;

            // 1) 문자열 타입 정렬 연산 논리 (제목순, 개봉일순)
            if (typeof valA === 'string') {
                return sortOrder.value === 'asc'
                    ? valA.localeCompare(valB, 'ko')
                    : valB.localeCompare(valA, 'ko');
            }

            // 2) 숫자 타입 정렬 연산 논리 (평점순)
            return sortOrder.value === 'asc' ? valA - valB : valB - valA;
        });
    });


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
        isLoading,
        errorMessage,
        fetchMovies,
        toggleFavorite,
        selectedMovie,
        fetchMovieDetail,
        // 검색어 상태 및 필터링된 영화 목록 내보내기
        searchQuery,
        filteredMovies,
        // [추가] 정렬 관련 상태 및 유틸 메서드 내보내기
        sortKey,
        sortOrder,
        changeSort,
        sortedAndFilteredMovies
    };
});
