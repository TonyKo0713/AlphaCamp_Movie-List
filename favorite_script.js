const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const baseURL = 'https://movie-list.alphacamp.io'
const index = baseURL + '/api/v1/movies/'
const poster = baseURL + '/posters/'
const dataPanel = document.querySelector('#data-panel')

function renderMovieList(data) {
  let htmlContent = ''
  // processing
  data.forEach(item => {
    htmlContent += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src=${poster + item['image']}
              class="card-img-top" alt="poster img">
            <div class="card-body">
              <h5 class="card-title">${item['title']}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-showDetail" data-bs-toggle="modal"
                data-bs-target="#exampleModal" data-id=${item['id']}>More...</button>
              <button class="btn btn-danger btn-removeFavorite" data-id=${item['id']}>X</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  // render results
  dataPanel.innerHTML = htmlContent
}

function showMovieInfo(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImg = document.querySelector('#movie-modal-image')
  const movieReleaseDate = document.querySelector('#movie-madal-releaseDate')
  const movieDescription = document.querySelector('#movie-modal-description')
  axios.get(index + id).then(Response => {
    const data = Response.data.results
    movieTitle.innerText = data.title
    movieReleaseDate.innerText = 'Release Date: ' + data.release_date
    movieDescription.innerText = data.description
    movieImg.innerHTML = `
    <img src=${poster + data.image} class="card-img-top" alt="poster img">
    `
  })
}


function removeFromFavorite(id) {
  const removeMovieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(removeMovieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}


renderMovieList(movies)

// 顯示電影細節資訊
dataPanel.addEventListener('click', function clickOnPanel() {
  if (event.target.matches('.btn-showDetail')) {
    showMovieInfo(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-removeFavorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

