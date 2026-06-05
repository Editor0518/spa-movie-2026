import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MoviesView from '../views/MoviesView.vue'
import MovieDetailView from '../views/MovieDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', //기본주소 (로컬호스트 5173)
      name: 'home',
      component: HomeView, //이 주소로 오면 HomeView를 띄움
    },
    {
      path: '/movies', //localhost:5173/movies
      name: 'movies',
      component: MoviesView
    },
    {
      path: '/movies/:id', //localhost:5173/movies/1
      name: 'movie-detail',
      component: MovieDetailView
    }
  ],
})

export default router
