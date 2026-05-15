const API_URL = import.meta.env.VITE_API_URL || 'https://maxschulte-api.maxwschulte.workers.dev'

async function getMovies() {
  const res = await fetch(`${API_URL}/api/movies`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

function thumbUrl(id) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
}

function cleanup() {
  if (window.__pageCleanup) {
    window.__pageCleanup()
    window.__pageCleanup = null
  }
  document.body.style.overflow = ''
}

export async function renderVideos(params = {}) {
  cleanup()

  // Retorna skeleton imediatamente
  const skeletonHtml = `
    <div class="movies-page">
      <div class="movies-hero movies-hero--skeleton">
        <div class="skeleton-block" style="width:100%;height:100%"></div>
        <div class="movies-hero__content">
          <div class="skeleton-line" style="width:80px"></div>
          <div class="skeleton-line" style="width:320px;height:40px;margin-top:8px"></div>
          <div class="skeleton-line" style="width:260px;margin-top:8px"></div>
          <div class="skeleton-line" style="width:100px;height:44px;margin-top:16px"></div>
        </div>
      </div>
      <div class="movies-section">
        <div class="skeleton-line" style="width:80px;margin-bottom:24px"></div>
        <div class="movies-row">
          ${[1,2,3].map(() => `
            <div class="movie-thumb">
              <div class="skeleton-block" style="aspect-ratio:16/9;width:300px"></div>
              <div class="skeleton-line" style="width:180px;margin-top:8px"></div>
              <div class="skeleton-line" style="width:80px;margin-top:4px"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `

  let movies = []
  try {
    movies = await getMovies()
  } catch {
    return `<div class="empty-page" style="padding:4rem;text-align:center">Failed to load movies.</div>`
  }

  if (!movies.length) return `<div class="empty-page" style="padding:4rem;text-align:center">No movies yet.</div>`

  const hero = movies[0]

  const html = `
    <div class="movies-page">

      <div class="movies-hero">
        <div class="movies-hero__bg">
          <img src="${thumbUrl(hero.id)}" alt="${hero.title}"
               onerror="this.style.display='none'" />
          <div class="movies-hero__gradient"></div>
        </div>
        <div class="movies-hero__content">
          <div class="movies-hero__meta">
            ${hero.location ? `<span>${hero.location}</span><span class="movies-dot">·</span>` : ''}
            <span>${hero.year || ''}</span>
          </div>
          <h1 class="movies-hero__title">${hero.title}</h1>
          <p class="movies-hero__desc">${hero.description}</p>
          <button class="movies-hero__play" data-index="0" aria-label="Play ${hero.title}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            <span>Play</span>
          </button>
          <div class="movies-hero-dots"></div>
        </div>
      </div>

      <div class="movies-section">
        <h2 class="movies-section__title">All Films</h2>
        <div class="movies-row">
          ${movies.map((m, i) => `
            <div class="movie-thumb" data-index="${i}">
              <div class="movie-thumb__img">
                <img src="${thumbUrl(m.id)}" alt="${m.title}" loading="lazy"
                     onerror="this.parentElement.style.background='#111'" />
                <div class="movie-thumb__overlay">
                  <div class="movie-thumb__play">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="movie-thumb__info">
                <p class="movie-thumb__title">${m.title}</p>
                <p class="movie-thumb__meta">${[m.location, m.year].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="movie-player" aria-hidden="true">
        <div class="movie-player__backdrop"></div>
        <div class="movie-player__container">
          <button class="movie-player__close" aria-label="Close">✕</button>
          <div class="movie-player__info">
            <p class="movie-player__meta"></p>
            <h2 class="movie-player__title"></h2>
            <p class="movie-player__desc"></p>
          </div>
          <div class="movie-player__frame">
            <iframe id="movieIframe" src="" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen></iframe>
          </div>
        </div>
      </div>

    </div>
  `

  requestAnimationFrame(() => initMovies(movies))
  return html
}

function initMovies(movies) {
  const player   = document.querySelector('.movie-player')
  const iframe   = document.querySelector('#movieIframe')
  const closeBtn = document.querySelector('.movie-player__close')
  const backdrop = document.querySelector('.movie-player__backdrop')
  const pMeta    = document.querySelector('.movie-player__meta')
  const pTitle   = document.querySelector('.movie-player__title')
  const pDesc    = document.querySelector('.movie-player__desc')

  if (!player || !iframe) return

  // Hero elements
  const heroBg    = document.querySelector('.movies-hero__bg img')
  const heroMeta  = document.querySelector('.movies-hero__meta')
  const heroTitle = document.querySelector('.movies-hero__title')
  const heroDesc  = document.querySelector('.movies-hero__desc')
  const heroBtn   = document.querySelector('.movies-hero__play')

  let heroIndex   = 0
  let heroTimer   = null
  let isHovered   = false

  function updateHero(index, animate = true) {
    const m = movies[index]
    if (!m) return

    const hero = document.querySelector('.movies-hero')
    if (animate) hero?.classList.add('movies-hero--transitioning')

    setTimeout(() => {
      if (heroBg)    heroBg.src = thumbUrl(m.id)
      if (heroTitle) heroTitle.textContent = m.title
      if (heroDesc)  heroDesc.textContent  = m.description
      if (heroBtn)   heroBtn.dataset.index = index
      if (heroMeta)  heroMeta.innerHTML = [
        m.location ? `<span>${m.location}</span><span class="movies-dot">·</span>` : '',
        `<span>${m.year || ''}</span>`
      ].join('')

      hero?.classList.remove('movies-hero--transitioning')
    }, animate ? 400 : 0)

    heroIndex = index

    // Atualiza dots
    document.querySelectorAll('.movies-hero-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })
  }

  function nextHero() {
    const next = (heroIndex + 1) % movies.length
    updateHero(next)
  }

  function startTimer() {
    heroTimer = setInterval(nextHero, 9000)
  }

  function stopTimer() {
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null }
  }

  // Dots
  const dotsContainer = document.querySelector('.movies-hero-dots')
  if (dotsContainer) {
    dotsContainer.innerHTML = movies.map((_, i) => `
      <button class="movies-hero-dot ${i === 0 ? 'active' : ''}"
              data-hero-index="${i}" aria-label="Go to film ${i + 1}"></button>
    `).join('')

    dotsContainer.querySelectorAll('.movies-hero-dot').forEach(dot => {
      dot.addEventListener('click', e => {
        e.stopPropagation()
        stopTimer()
        updateHero(Number(dot.dataset.heroIndex))
        startTimer()
      })
    })
  }

  // Pause on hover
  const hero = document.querySelector('.movies-hero')
  hero?.addEventListener('mouseenter', () => { isHovered = true; stopTimer() })
  hero?.addEventListener('mouseleave', () => { isHovered = false; startTimer() })

  startTimer()

  // Player
  function open(index) {
    const movie = movies[index]
    if (!movie) return
    stopTimer()
    iframe.src = `https://www.youtube.com/embed/${movie.id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`
    pTitle.textContent = movie.title
    pDesc.textContent  = movie.description
    pMeta.textContent  = [movie.location, movie.year].filter(Boolean).join(' · ')
    player.classList.add('open')
    player.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
  }

  function close() {
    iframe.src = ''
    player.classList.remove('open')
    player.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    if (!isHovered) startTimer()
  }

  // Swipe to close
  let touchStartY = 0
  player.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY }, { passive: true })
  player.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - touchStartY > 80) close()
  }, { passive: true })

  const onKeydown = e => {
    if (e.key === 'Escape' && player.classList.contains('open')) close()
  }

  document.querySelectorAll('.movies-hero__play').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      open(Number(btn.dataset.index))
    })
  })

  document.querySelectorAll('.movie-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => open(Number(thumb.dataset.index)))
  })

  closeBtn.addEventListener('click', close)
  backdrop.addEventListener('click', close)
  window.addEventListener('keydown', onKeydown)

  window.__pageCleanup = () => {
    close()
    stopTimer()
    window.removeEventListener('keydown', onKeydown)
  }
}