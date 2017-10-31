new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js!',
    movies: []
  }, computed: {
    currentMovie: function() {
      const movieRe = /^\/movie\/(\d+)$/
      const curRoute = window.location.pathname
      if (!movieRe.test(curRoute)){
        return null
      }
      return curRoute.replace(movieRe, '$1')
    } 
  
  }
})