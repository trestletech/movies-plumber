const Home = { 
  template: '<div><search style="float: right; width: 45%;"></search><div style="width: 50%"><h2>Recommended for you</h2><ul><li v-for="m in recommended"><router-link :to="m.link">{{ m.title }}</router-link></li></ul></div></div>',
  data: function(){
    return {
      movies: [],
      recommended: []
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
    
    this.$http.post('/api/movies/recommend', {likes:favorites}).then(function(res) {
      this.recommended = res.data.map(m => {
        m.link = '/movies/' + m.movieId
        return m
      })
    }.bind(this), err => {
      console.log(err);
    })
  }
}

// TODO: This global is gross. 
//   Use proper nesting of these component and bind it to a nested property.
let favorites = [];

const Movie = { 
  path:'/movies/:id/', 
  template: '<div><button v-on:click="favorite" style="float: right;">{{ favText }}</button><h2>{{ movie.title }}</h2><img :src="ratingsImg"></img></div>',
  data: function(){
    return {
      movie: {},
      favText: 'Favorite'
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
  }, methods: {
    favorite: function() {
      favorites.push(this.$route.params.id)
      this.favText = 'Added!'
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
