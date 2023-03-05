const baseURL = 'https://movie-list.alphacamp.io'
const index = baseURL + '/api/v1/movies/'
const poster = baseURL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const formInput = document.querySelector('#formInput')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const movieNumPerPage = 12
let relativeMovies = []
// layoutswitch等於0 => 以資訊卡方式渲染頁面; layoutswitch等於1 => 以清單條列式方式渲染頁面
let layoutSwitch = 0
const switchButton = document.querySelector('#switchButton')
// currentpage用來記錄目前觀看的頁數, 在按siwtchbutton切換版面時,function會去抓currentpage確定使用者能夠在同一頁面上切換版面
let currentPage = 1

// 以卡片方式渲染電影資訊
function renderMovieCardVer(data) {
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
              <button class="btn btn-info btn-addFavorite" data-id=${item['id']}>+</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  // render results
  dataPanel.innerHTML = htmlContent
}

// 以條列方式渲染電影資訊
function renderMovieListVer(data) {
  let htmlContent = ``
  htmlContent += `
  <div class="row" id="data-panel">
  <ul class="list-group list-group-flush" id="movieListGroup">
  `
  // processing
  data.forEach(item => {
    htmlContent += `
      <li class="list-group-item">
          <div class="row align-items-center justify-content-between" id="list-body">
            <div class="list-title col-sm-6">${item['title']}</div>
            <div class="list-button col-sm-6 justify-content-end">
              <button class="btn btn-primary btn-showDetail" data-bs-toggle="modal"
                data-bs-target="#exampleModal" data-id=${item['id']}>More...</button>
              <button class="btn btn-info btn-addFavorite" data-id=${item['id']}>+</button>
            </div>
          </div>
        </li>
    `
  });

  htmlContent += `
  </ul>
  </div>
  `
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

function addToFavorite(id) {
  // 取得已存在的喜愛電影清單, 如果沒有以存在的清單, 就定義為空陣列
  const favoriteList = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // 用"find"檢查陣列中的每個元素的id是否與點選的id相同, 若有相同的則將該id的電影資訊存入movie中
  const movie = movies.find((movie) => movie.id === id)

  // 用"some"檢查陣列中的每個元素的id是否與點選的id相同, 若有相同則會回傳true的值
  if (favoriteList.some((favoriteMovie) => favoriteMovie.id === id)) {
    return alert('This movie have been added into your favorite.')
  }
  favoriteList.push(movie)
  console.log(favoriteList)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteList))
}

function rederPaginator(amount) {
  const pageIndex = Math.ceil(amount / movieNumPerPage)
  let rawHTML = ''
  for (let i = 1; i <= pageIndex; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page=${i} href="#">${i}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 根據頁數顯示出對應的12部電影
function moviesPerPage(page) {
  // page 1 -> movies index 0 - 11
  // page 2 -> movies index 12 - 23
  // page 3 -> movies index 24 - 35
  let data = []
  if (relativeMovies.length !== 0) {
    data = relativeMovies
    currentPage = 1
  } else {
    data = movies
  }
  const startIndex = (page - 1) * movieNumPerPage
  return data.slice(startIndex, startIndex + movieNumPerPage)
}

axios.get(index).then(Response => {
  // 第一種讓有80個資料的陣列存入"movies"的方法(展開運算子)
  // movies.push(...Response.data.results)
  // console.log(movies)

  // 第二種讓有80個資料的陣列存入"movies"的方法
  for (const movie of Response.data.results) {
    movies.push(movie)
  }
  rederPaginator(movies.length)
  renderMovieCardVer(moviesPerPage(1))
})


// 切換瀏覽版面
// 切換版面時能夠讀取到當前瀏覽的頁碼"currentpage", 在切換版面時能夠瀏覽相同的電影資訊
// 用layoutSwitch當作判斷要用哪種版面渲染網頁
switchButton.addEventListener('click', function clickOnSwitchButton() {

  if (event.target.matches('.cardSwitch')) {
    layoutSwitch = 0
    renderMovieCardVer(moviesPerPage(currentPage))
  } else if (event.target.matches('.listSwitch')) {
    layoutSwitch = 1
    renderMovieListVer(moviesPerPage(currentPage))
  }
})

// 顯示電影細節資訊或加入電影清單
dataPanel.addEventListener('click', function clickOnPanel() {
  if (event.target.matches('.btn-showDetail')) {
    showMovieInfo(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-addFavorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 用關鍵字搜尋電影
formInput.addEventListener('submit', function SubmitSearchValue() {
  event.preventDefault()
  const searchValue = searchInput.value.trim().toLowerCase()
  relativeMovies = []
  for (const movie of movies) {
    const movieTitle = movie.title.toLowerCase()
    if (movieTitle.includes(searchValue)) {
      relativeMovies.push(movie)
    }
  }
  if (relativeMovies.length === 0) {
    return alert(`Can not find the movies with keyword : ${searchValue}`)
  }
  console.log(relativeMovies)
  rederPaginator(relativeMovies.length)
  // 用layoutSwitch當作判斷當前要用哪種版面去渲染篩選出的電影
  if (layoutSwitch === 0) {
    renderMovieCardVer(moviesPerPage(1))
  } else if (layoutSwitch === 1) {
    renderMovieListVer(moviesPerPage(1))
  }
})

paginator.addEventListener('click', function clickOnPaginator() {
  if (event.target.matches('.page-link')) {
    const pageNumber = event.target.dataset.page
    // 按下分頁器的頁碼時, 同時將頁碼編號存入"currentpage", 讓使用者按下"siwtchbutton"切換版面時能夠讀取到當前瀏覽的頁碼, 在切換版面時能夠瀏覽相同的電影資訊
    currentPage = pageNumber
    // 用layoutSwitch當作判斷當前要用哪種版面去渲染篩選出的電影
    if (layoutSwitch === 0) {
      renderMovieCardVer(moviesPerPage(pageNumber))
    } else if (layoutSwitch === 1) {
      renderMovieListVer(moviesPerPage(pageNumber))
    }
  }
})