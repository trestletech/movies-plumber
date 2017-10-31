
library(dplyr)
library(readr)
library(tidyr)

movies <- readr::read_csv("ml-latest-small/movies.csv")
ratings <- readr::read_csv("ml-latest-small/ratings.csv")
links <- readr::read_csv("ml-latest-small/links.csv") %>% 
  mutate(imdb = paste0("http://www.imdb.com/title/tt", imdbId, "/"),
         tmdb = paste0("https://www.themoviedb.org/movie/", tmdbId),
         movielens = paste0("https://movielens.org/movies/", movieId)) %>% 
  select(-tmdbId, -imdbId)

#' Get the top 10 ranked movies
#' @get /api/movies/top
function(){
  ratings %>% 
    group_by(movieId) %>% 
    summarize(avgRating = mean(rating), votes = n()) %>% 
    filter(votes > 50) %>% # Minimum of 10 votes
    arrange(desc(avgRating)) %>% 
    head(10) %>% 
    left_join(movies) %>% 
    left_join(links, by="movieId")
}

#' Return info about a particular move
#' @get /api/movies/<id:int>
function(id){
  mov <- movies %>% filter(movieId == id) %>% 
    left_join(links, by="movieId")
  unlist(mov)
}

#' Serve the core HTML file for any request for a page
#' @get /
function(res){
  plumber::include_html("./public/index.html", res)
}

#' Serve the core HTML file for any request for a page
#' TODO: collapse into a single endpoint once https://github.com/trestletech/plumber/issues/191
#' @get /movie/<id>
function(res){
  plumber::include_html("./public/index.html", res)
}

#' @assets ./public
list()