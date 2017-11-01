const Home = { 
  template: '<div><search style="float: right; width: 45%;"></search><div style="width: 50%"><h2>Recommended for you</h2><ol><li v-for="m in recommended"><router-link :to="m.link">{{ m.title }}</router-link></li></ol></div></div>',
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
    
    this.$http.post('/api/movies/recommend', {likes:likes, dislikes:dislikes}).then(function(res) {
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
let likes = [];
let dislikes = [];

const Movie = { 
  path:'/movies/:id/', 
  template: '<div><button v-on:click="like" style="float: right;" :disabled="likeDisabled">{{ likeText }}</button><button v-on:click="dislike" style="float: right;" :disabled="dislikeDisabled">{{ dislikeText }}</button><h2>{{ movie.title }}</h2><img :src="ratingsImg"></img></div>',
  data: function(){
    return {
      movie: {},
      likeText: '👍 Like',
      dislikeText: '👎 Dislike',
      dislikeDisabled: false
 ,
      likeDisabled: false,   }
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
    dislike: function() {
      dislikes.push(this.$route.params.id)
      this.dislikeText = 'Disiked!'
      this.dislikeDisabled = true;
      this.likeDisabled = true
   },
    like: function() {
      likes.push(this.$route.params.id)
      this.likeText = 'Liked!'
      this.likeDisabled = true
      this.dislikeDisabled = true
    }
  }
}

Vue.component('search', {
  template:'<div>Search: <input v-model="query" v-on:keyup.enter="search"></input><button v-on:click="search">Search</button><ul><li v-for="r in results"><router-link :to="r.link">{{ r.title }}</router-link></li></ul></div>',
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
