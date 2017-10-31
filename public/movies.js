const Home = { 
  template: '<div><div style="width: 50%; float: left;"><h2>Top 10 Movies</h2><ul><li v-for="m in movies"><router-link :to="m.link">{{ m.title }}</router-link></li></ul></div><search style="float: right; width: 45%;"></search></div>',
  data: function(){
    return {
      movies: []
    }
  }, mounted: function(){
    this.$http.get('/api/movies/top').then(function(res) {
      this.movies = res.data.map(m => {
        m.link = '/movies/' + m.movieId
        return m
      })
    }.bind(this), err => {
      console.log(err);
    })
  }
}

const Movie = { 
  path:'/movies/:id/', 
  template: '<div><h2>{{ movie.title }}</h2><img :src="ratingsImg" style="float: left; width: 33%;"></img><iframe width="65%" height="350px" :src="movie.imdb" style="float: right;"></iframe></div>',
  data: function(){
    return {
      movie: {},
    }
  }, mounted: function() {
    this.$http.get('/api/movies/' + this.$route.params.id).then(function(res) {
      this.movie = res.data;
    }.bind(this), err => {
      console.log(err);
    })
  }, computed: {
    ratingsImg: function(){
      if (!this.movie){
        return null
      }
      return '/api/movies/' + this.movie.movieId + '/ratings'
    }
  }
}

Vue.component('search', {
  template:'<div>Search: <input v-model="query"></input><button v-on:click="search">Search</button><ul><li v-for="r in results"><router-link :to="r.link">{{ r.title }}</router-link></li></ul></div>',
  data: function(){
    return { 
      query: '',
      results: []
    }
  },
  methods: {
    search: function(){
      this.$http.post('/api/search?q=' + this.query).then(function(res) {
        this.results = res.data.map(r => {
          r.link = '/movies/' + r.movieId
          return r
        });
      }.bind(this), err => {
        console.log(err);
      })
    }
  }
})

const routes = [
  { path: '/', component: Home },
  { path: '/movies/:id', component: Movie }
]

const router = new VueRouter({
  mode: 'history',
  routes: routes
})

const app = new Vue({
  router
}).$mount('#app')
