const apiKey = 'f531333d637d0c44abc85b3e74db2186';
const baseURL = 'https://api.themoviedb.org/3';
const imageBaseURL = 'https://image.tmdb.org/t/p/original';

let movies = [];
let moviesPerPage = 20; // Update the number of movies per page
let currentPage = 1;
let totalMovies = 0; // Total number of movies available from the API
let totalPages = 1; // Total number of pages you want to display
let sortBy = 'vote_average';
let sortAscending = false;
let currentTab = 'all';
let searchQuery = '';

// Store favorite movies in local storage
let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

function fetchMovies(pageNumber) {
    const url = `${baseURL}/movie/top_rated?api_key=${apiKey}&language=en-US&page=${pageNumber}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            movies = data.results;
            totalMovies = data.total_results; // Update totalMovies based on API response
            totalPages = Math.ceil(totalMovies / moviesPerPage); // Update totalPages based on totalMovies
            displayMovies();
        })
        .catch((error) => console.error(error));
}

function displayMovies() {
    const movieList = document.querySelector('.movie-list ul');
    movieList.innerHTML = '';

    let filteredMovies = movies;

    // Filter movies based on the current tab (All or Favorites)
    if (currentTab === 'favorites') {
        filteredMovies = movies.filter((movie) => favoriteMovies.includes(movie.id));
    }

    // Filter movies based on the search query
    if (searchQuery) {
        filteredMovies = filteredMovies.filter((movie) =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const startIndex = 0; // Always start from the beginning
    const endIndex = startIndex + moviesPerPage;
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

    paginatedMovies.forEach((movie) => {
        const movieCard = document.createElement('li');
        movieCard.classList.add('movie-card');

        // Create and display movie information
        const title = document.createElement('h2');
        title.textContent = movie.title;

        const voteCount = document.createElement('p');
        voteCount.textContent = `Vote Count: ${movie.vote_count}`;

        const voteAverage = document.createElement('p');
        voteAverage.textContent = `Vote Average: ${movie.vote_average}`;

        // Create and display movie poster
        const posterPath = movie.poster_path;
        const poster = document.createElement('img');
        poster.src = posterPath
            ? `${imageBaseURL}${posterPath}`
            : 'default-poster.jpg';

        // Create favorite button
        const favoriteButton = document.createElement('button');
        favoriteButton.textContent = favoriteMovies.includes(movie.id)
            ? 'Remove from Favorites'
            : 'Add to Favorites';

        favoriteButton.addEventListener('click', () => toggleFavorite(movie.id));

        movieCard.appendChild(poster);
        movieCard.appendChild(title);
        movieCard.appendChild(voteCount);
        movieCard.appendChild(voteAverage);
        movieCard.appendChild(favoriteButton);

        movieList.appendChild(movieCard);
    });

    updatePagination();
}

function toggleFavorite(movieId) {
    const index = favoriteMovies.indexOf(movieId);
    if (index === -1) {
        favoriteMovies.push(movieId);
    } else {
        favoriteMovies.splice(index, 1);
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));

    // Create a filtered movie list based on the current criteria (tab and search)
    let filteredMovies = movies;

    // Filter movies based on the current tab (All or Favorites)
    if (currentTab === 'favorites') {
        filteredMovies = movies.filter((movie) => favoriteMovies.includes(movie.id));
    }

    // Filter movies based on the search query
    if (searchQuery) {
        filteredMovies = filteredMovies.filter((movie) =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Call displayMovies with the filtered movie list
    displayMovies(filteredMovies);
}

function sortMovies() {
    movies.sort((a, b) => {
        if (sortBy === 'release_date') {
            const dateA = new Date(a.release_date);
            const dateB = new Date(b.release_date);
            return sortAscending ? dateA - dateB : dateB - dateA;
        } else if (sortBy === 'vote_average') {
            return sortAscending ? a.vote_average - b.vote_average : b.vote_average - a.vote_average;
        }
    });

    displayMovies();
}

function updatePagination() {
    const prevButton = document.getElementById('previous-button');
    const nextButton = document.getElementById('next-button');
    const currentPageSpan = document.getElementById('current-page');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    currentPageSpan.textContent = `Current Page: ${currentPage} of ${totalPages}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(currentPage);
});

document.getElementById('sort-date-button').addEventListener('click', () => {
    sortBy = 'release_date';
    sortAscending = !sortAscending;
    sortMovies();
});

document.getElementById('sort-rating-button').addEventListener('click', () => {
    sortBy = 'vote_average';
    sortAscending = !sortAscending;
    sortMovies();
});

document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.querySelector('.search-bar input');
    searchQuery = searchInput.value.trim();
    currentPage = 1; // Reset to the first page when searching
    fetchMovies(currentPage);
});

document.querySelector('.tabs').addEventListener('click', (event) => {
    if (event.target.classList.contains('tab')) {
        currentTab = event.target.textContent.toLowerCase();
        currentPage = 1; // Reset to the first page when changing tabs
        fetchMovies(currentPage);
    }
});

document.getElementById('previous-button').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies(currentPage);
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchMovies(currentPage);
    }
});

// Initial fetchMovies call
fetchMovies(currentPage);
