const API_KEY = '63cc06aab334a7339bd5dd3ceeb4b086';
const API_LANG = 'pt-br';
const BASE_URL_IMAGE = {
    original: 'https://image.tmdb.org/t/p/original',
    small: 'https://image.tmdb.org/t/p/w500'
};
const MOVIES_LOCAL_STORAGE = 'moviesList';

const movies = [];
let movieActive = '';
const moviesElement = document.getElementById('movies');

function getUrlMovie(movieId) {
    return `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=${API_LANG}`;
};

function getUrlMovieWatchProvider(movieId) {
    return `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}&language=${API_LANG}`;
};

function changeButtonMenu() {
    const button = document.querySelector('.button_menu');
    const navigation = document.querySelector('.navigation');

    button.classList.toggle('active');
    navigation.classList.toggle('active');
};


function setFeaturedMovie(movie) {
    const appImage = document.querySelector('.app_image img');
    const rating = document.querySelector('.rating strong');
    const info = document.querySelector('.feature_movie span');
    const title = document.querySelector('.feature_movie h1');
    const description = document.querySelector('.feature_movie p');
    const watch_button = document.querySelector('.feature_movie button');

    rating.innerHTML = movie.vote_average;
    info.innerHTML = `${movie.realease} - ${movie.genre} - Movie`;
    title.innerHTML = movie.title;
    description.innerHTML = movie.overview;
    watch_button.setAttribute('onclick', `window.open('${movie.watch}', '_blank')`)

    appImage.setAttribute('src', movie.image.original);

};

function createImageMovie(movieImage, movieTitle) {
    const divImageMovie = document.createElement('div');
    divImageMovie.classList.add('movie_image');

    const image = document.createElement('img');

    image.setAttribute('src', movieImage);
    image.setAttribute('alt', `Imagem do filme ${movieTitle}`);
    image.setAttribute('loading', 'lazy');

    divImageMovie.appendChild(image);

    return divImageMovie;
};

function changeActiveMovieInList(newActiveMovie) {
    const currentActiveMovie = document.getElementById(movieActive);
    currentActiveMovie.classList.remove('active-movie');

    const newActiveMovieLi = document.getElementById(newActiveMovie);
    newActiveMovieLi.classList.add('active-movie');

    movieActive = newActiveMovie;
};

function changeMainMovie(movieId) {
    const movie = movies.find(movie => movie.id === movieId);

    if (movie?.id) {
        changeActiveMovieInList(movieId);
        setFeaturedMovie(movie);
        changeButtonMenu();
    } else {
        alert('Não foi possivel achar o filme com o id', movieId)
    };

};

function addMovieInList(movie) {
    const movieElement = document.createElement('li');
    movieElement.classList.add('movie');
    movieElement.setAttribute('id', movie.id);
    movieElement.onclick = () => {
        changeMainMovie(movie.id);
    }

    movieElement.innerHTML = `<span>${movie.genre}</span>` +
        `<strong>${movie.title}</strong>` +
        `<button type="button"><img src="./assets/img/icon-play-button.png" alt="Icone play botão"></button>`;

    movieElement.appendChild(createImageMovie(movie.image.small, movie.title));

    moviesElement.appendChild(movieElement)
};

async function getMovieData(movieId) {
    const isMovieInList = movies.findIndex(movie => movie.id === movieId);

    if (isMovieInList === -1) {
        try {
            let data = await fetch(getUrlMovie(movieId));
            data = await data.json();

            let watchProviderData = await fetch(getUrlMovieWatchProvider(movieId));
            watchProviderData = await watchProviderData.json();

            const movieData = {
                id: movieId,
                title: data.title,
                overview: data.overview,
                vote_average: data.vote_average,
                genre: data.genres[0].name,
                realease: data.release_date.split('-')[0],
                image: {
                    original: BASE_URL_IMAGE.original.concat(data.backdrop_path),
                    small: BASE_URL_IMAGE.small.concat(data.backdrop_path),
                },
                watch: data.homepage !== '' ? data.homepage : watchProviderData.results.BR.link,
            };

            movies.push(movieData)

            return movieData;
        } catch (error) {
            alert('Não foi possivel adicionar este filme a lista')
        };
    };

    return null;
};

function loadMovies() {
    let MOVIES_LIST = localStorage.getItem(MOVIES_LOCAL_STORAGE);
    MOVIES_LIST = JSON.parse(MOVIES_LIST);

    MOVIES_LIST.map(async (movie, index) => {
        const movieData = await getMovieData(movie);

        addMovieInList(movieData);

        if (index === 0) {
            setFeaturedMovie(movieData);

            movieActive = movieData.id;

            const newActiveMovieLi = document.getElementById(movieActive);
            newActiveMovieLi.classList.add('active-movie');
        };
    });
};

const formAddMovie = document.getElementById('add_movie');

function formattedMovieId(movieId) {
    if (movieId.includes('https://m.imdb.com/title/')) {
        const id = movieId.split('/')[4];

        return id;
    };

    return movieId;
};

function initalStoreData() {
    const INITIAL_MOVIES = [
        'tt2953050', 'tt8097030',
    ];

    const storage = localStorage.getItem(MOVIES_LOCAL_STORAGE);

    if (!storage) {
        localStorage.setItem(MOVIES_LOCAL_STORAGE, JSON.stringify(INITIAL_MOVIES))
    };
}

function storeNewMovie(movieId) {
    const storage = JSON.parse(localStorage.getItem(MOVIES_LOCAL_STORAGE));
    storage.push(movieId);

    localStorage.setItem(MOVIES_LOCAL_STORAGE, JSON.stringify(storage))
}

formAddMovie.addEventListener('submit', async function (event) {
    event.preventDefault();

    const newMovieId = formattedMovieId(event.target['movie'].value);
    const newMovie = await getMovieData(newMovieId);

    if (newMovie?.id) {
        addMovieInList(newMovie);
        storeNewMovie(newMovie.id)
    }

    event.target['movie'].value = '';
});

initalStoreData();
loadMovies();
