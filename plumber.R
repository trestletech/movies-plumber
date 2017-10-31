
library(dplyr)
library(readr)
library(tidyr)
library(ggplot2)
library(recommenderlab)

movies <- readr::read_csv("ml-latest-small/movies.csv")
ratings <- readr::read_csv("ml-latest-small/ratings.csv")
links <- readr::read_csv("ml-latest-small/links.csv") %>% 
  mutate(imdb = paste0("http://www.imdb.com/title/tt", imdbId, "/"),
         tmdb = paste0("https://www.themoviedb.org/movie/", tmdbId),
         movielens = paste0("https://movielens.org/movies/", movieId)) %>% 
  select(-tmdbId, -imdbId)

ratedMovies <- ratings %>% 
  group_by(movieId) %>% 
  summarize(avgRating = mean(rating), votes = n()) %>% 
  left_join(movies, by="movieId") %>% 
  left_join(links, by="movieId")

#' Get the top 10 ranked movies
#' @get /api/movies/top
function(){
  ratedMovies %>% 
    filter(votes > 50) %>% # Minimum of 10 votes
    arrange(desc(avgRating)) %>% 
    head(10)
}

#' Return info about a particular move
#' @get /api/movies/<id:int>
#' @serializer unboxedJSON
function(id){
  mov <- ratedMovies %>% filter(movieId == id)
    
  as.list(mov)
}

#' Search for a movie by title
#' @post /api/search
function(q){
  # Alphanumeric and spaces only
  query <- gsub("[^\\w ]", "", q, perl=TRUE)
  movies %>% filter(grepl(toupper(query), toupper(title), fixed=TRUE))
}

#' Histogram of ratings for a particular movie
#' @png
#' @get /api/movies/<id:int>/ratings
function(id){
  plot <- ratings %>% 
    filter(movieId == id) %>% 
    select(rating) %>% 
    ggplot(aes(rating)) + ggplot2::geom_histogram(binwidth = .5)
  print(plot) # Must print ggplot2
}

# Build the recommender
library(reshape2)
mat <- acast(ratings, userId ~ movieId, value.var = "rating")

#' Get recommendations given a set of favorites
#' @post /api/movies/recommend
recom <- function(likes, dislikes){
  if (missing(likes)){
    likes <- c()
  }
  
  if (missing(dislikes)){
    dislikes <- c()
  }
  if (length(likes) == 0 && length(dislikes) == 0){
    # We don't have anything to go off of, so just return the global list.
    return(top())
  }
  
  # Create a full matrix of this user's ratings with NAs for all values not provided
  prefs <- rep(NA, ncol(mat))
  names(prefs) <- colnames(mat)
  
  # Sanitize since we expect only numerical IDs, but colnames are chars so we need to convert back
  likes <- as.character(as.integer(likes))
  dislikes <- as.character(as.integer(dislikes))
  # Give all favorited movies 5s and all disliked 0s
  prefs[likes] <- 5
  prefs[dislikes] <- 0
  
  # Replace the last user's data with this user's preferences
  # We do lose one row of data, but it saves us from having to reallocate the matrix
  thisMat <- rbind(mat, prefs)
  
  user_movie <- as(thisMat, "realRatingMatrix")
  rec <- Recommender(user_movie,method="SVD")
  
  prefs <- user_movie[nrow(user_movie)] # The last row is this user
  
  recom <- predict(rec, prefs, n=10)
  recs <- as.numeric(unlist(as(recom, "list")))
 
  ratedMovies %>% 
    filter(movieId %in% recs)
}

#' Serve the core HTML file for any request for a page
#' @get /
function(res){
  plumber::include_html("./public/index.html", res)
}

#' Serve the core HTML file for any request for a page
#' TODO: collapse into a single endpoint once https://github.com/trestletech/plumber/issues/191
#' @get /movies/<id>
function(res){
  plumber::include_html("./public/index.html", res)
}

#' @assets ./public
list()
