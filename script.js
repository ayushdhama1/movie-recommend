const API_KEY = "9fbb0a2075dc43df0b65986ea3f66201";
const BASE_URL = "https://api.themoviedb.org/3";
const TRENDING_URL = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
const GENRES_URL = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
const SEARCH_URL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`;

// Theme detection
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark-theme');
} else {
  document.body.classList.add('light-theme');
}

// Fetch utility
async function fetchData(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error("Network error");
    return await res.json();
  }catch(e){
    console.error("Fetch error:", e);
    return null;
  }
}

// Trending
async function fetchTrendingMovies(){
  const data = await fetchData(TRENDING_URL);
  if(data) displayMovies(data.results,'trending-list');
}

// Recommended (simple: random from trending)
async function fetchRecommendedMovies(){
  const data = await fetchData(TRENDING_URL);
  if(data){
    const shuffled = [...data.results].sort(()=>0.5-Math.random());
    displayMovies(shuffled.slice(0,10),'recommended-list');
  }
}

// Genres
async function fetchGenres(){
  const data = await fetchData(GENRES_URL);
  if(data) displayGenres(data.genres);
}
function displayGenres(genres){
  const container=document.getElementById('genres');
  container.innerHTML="<h2>🎭 Genres</h2>";
  genres.forEach(g=>{
    const div=document.createElement('div');
    div.classList.add('genre-section');
    div.innerHTML=`
      <h3>${g.name}</h3>
      <div class="slider-container" role="region" aria-label="${g.name} Movies">
        <button class="scroll-left" type="button" onclick="scrollLeft('${g.id}-list')">◀</button>
        <div class="movie-list" id="${g.id}-list"><p class="empty-message">Loading...</p></div>
        <button class="scroll-right" type="button" onclick="scrollRight('${g.id}-list')">▶</button>
      </div>`;
    container.appendChild(div);
    fetchMoviesByGenre(g.id);
  });
}
async function fetchMoviesByGenre(id){
  const data=await fetchData(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}`);
  if(data) displayMovies(data.results,`${id}-list`);
}

// Display Movies
function displayMovies(movies, listId) {
  const list = document.getElementById(listId);
  list.innerHTML = "";
  if (!movies || movies.length === 0) {
    list.innerHTML = "<p>No movies available.</p>";
    return;
  }
  movies.forEach(m => {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <h4>${m.title}</h4>
      <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}"/>
      <button onclick='addToWatchlist(${JSON.stringify(m)})'>❤️</button>
    `;
    list.appendChild(card);
  });
}

// Scroll buttons
function scrollLeft(listId){
  const el=document.getElementById(listId);
  if(el) el.scrollBy({left:-300,behavior:'smooth'});
}
function scrollRight(listId){
  const el=document.getElementById(listId);
  if(el) el.scrollBy({left:300,behavior:'smooth'});
}

// Search
async function searchMovies(query){
  if(!query) return;
  const data = await fetchData(SEARCH_URL + encodeURIComponent(query));
  const resultsSection = document.getElementById('search-results');
  const resultsList = document.getElementById('search-results-list');

  if(data && data.results.length > 0){
    resultsSection.style.display = 'block'; // dikhaye search section
    displayMovies(data.results, 'search-results-list');
    resultsSection.scrollIntoView({behavior: "smooth"}); // search results tak scroll kare
  } else {
    resultsSection.style.display = 'block';
    resultsList.innerHTML = "<p>No movies found.</p>";
  }
}


// Auth
function showLoginForm(){
  document.getElementById('login-modal').style.display='block';
}
function showSignupForm(){
  document.getElementById('signup-modal').style.display='block';
}
function closeAuthForm(){
  document.getElementById('login-modal').style.display='none';
  document.getElementById('signup-modal').style.display='none';
}
function validateEmail(email) {
  // Simple email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function login(){
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();

  if(!email || !pass){
    alert("❌ Please fill in all fields.");
    return;
  }
  if(!validateEmail(email)){
    alert("❌ Invalid email format.");
    return;
  }

  localStorage.setItem('user', email);
  closeAuthForm();
  alert('✅ Logged in successfully!');
}

function signup(){
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-password').value.trim();

  if(!email || !pass){
    alert("❌ Please fill in all fields.");
    return;
  }
  if(!validateEmail(email)){
    alert("❌ Invalid email format.");
    return;
  }

  localStorage.setItem('user', email);
  closeAuthForm();
  alert('✅ Account created!');
}


// Favorites
let favoriteMovies=JSON.parse(localStorage.getItem('favorites'))||[];
function toggleFavorite(id){
  const idx=favoriteMovies.indexOf(id);
  if(idx>-1){favoriteMovies.splice(idx,1);} else {favoriteMovies.push(id);}
  localStorage.setItem('favorites',JSON.stringify(favoriteMovies));
}

// Event Listeners
document.getElementById('theme-button').addEventListener('click',()=>{
  document.body.classList.toggle('light-theme');
  document.body.classList.toggle('dark-theme');
});
document.getElementById('search-button').addEventListener('click',()=>{
  searchMovies(document.getElementById('search-bar').value);
});

// Watchlist
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

// Add to watchlist
function addToWatchlist(movie) {
  // Check agar movie pehle se watchlist me hai
  if (!watchlist.find(m => m.id === movie.id)) {
    watchlist.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    renderWatchlist();
  } else {
    alert("Already in Watchlist!");
  }
}

// Render Watchlist
function renderWatchlist() {
  const list = document.getElementById("watchlist-list");
  list.innerHTML = "";

  if (watchlist.length === 0) {
    list.innerHTML = "<p>No movies in Watchlist.</p>";
    return;
  }

  watchlist.forEach(m => {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <h4>${m.title}</h4>
      <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}"/>
      <button onclick="removeFromWatchlist(${m.id})">🗑️</button>
    `;
    list.appendChild(card);
  });
}

// Remove from Watchlist
function removeFromWatchlist(id) {
  watchlist = watchlist.filter(m => m.id !== id);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchTrendingMovies();
  fetchRecommendedMovies();
  fetchGenres();
  renderWatchlist(); // watchlist load karega
});
