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

  function open(index) {
    const movie = movies[index]
    if (!movie) return
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
  }

  // Mobile swipe to close
  let touchStartY = 0
  const onTouchStart = e => {
    touchStartY = e.touches[0].clientY
  }
  const onTouchEnd = e => {
    const dy = e.changedTouches[0].clientY - touchStartY
    if (dy > 80) close()
  }
  player.addEventListener('touchstart', onTouchStart, { passive: true })
  player.addEventListener('touchend', onTouchEnd, { passive: true })

  const onKeydown = e => {
    if (e.key === 'Escape' && player.classList.contains('open')) close()
  }

  // Only play button opens player (not entire hero)
  const playBtns = document.querySelectorAll('[data-index]')
  const thumbs   = document.querySelectorAll('.movie-thumb')

  const playHandlers = new Map()
  const thumbHandlers = new Map()

  playBtns.forEach(btn => {
    const handler = e => {
      e.stopPropagation()
      open(Number(btn.dataset.index))
    }
    playHandlers.set(btn, handler)
    btn.addEventListener('click', handler)
  })

  thumbs.forEach(thumb => {
    const handler = () => open(Number(thumb.dataset.index))
    thumbHandlers.set(thumb, handler)
    thumb.addEventListener('click', handler)
  })

  closeBtn.addEventListener('click', close)
  backdrop.addEventListener('click', close)
  window.addEventListener('keydown', onKeydown)

  // Cleanup called by router before navigating
  window.__pageCleanup = () => {
    close()

    playHandlers.forEach((handler, btn) => {
      btn.removeEventListener('click', handler)
    })
    thumbHandlers.forEach((handler, thumb) => {
      thumb.removeEventListener('click', handler)
    })

    closeBtn.removeEventListener('click', close)
    backdrop.removeEventListener('click', close)
    window.removeEventListener('keydown', onKeydown)

    player.removeEventListener('touchstart', onTouchStart)
    player.removeEventListener('touchend', onTouchEnd)
  }
}