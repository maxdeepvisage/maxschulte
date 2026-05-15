import { getPhotos, getEnsaios, imageUrl } from '../services/cloudinary.js'
import { push } from '../router.js'

export async function renderGaleria(params = {}) {
  const { cat, ensaio } = params

  const [photos, ensaios] = await Promise.all([
    getPhotos(cat, ensaio),
    getEnsaios(cat),
  ])

  if (!photos || !photos.length) {
    return `<div class="empty-page" style="padding:4rem;text-align:center">No photos found.</div>`
  }

  photos.sort((a, b) => (a.order || 999) - (b.order || 999))

  const catName    = cat.replace(/-/g, ' ').toUpperCase()
  const ensaioName = ensaio.charAt(0).toUpperCase() + ensaio.slice(1)

  const html = `
    <div class="galeria-wrap">

      <aside class="galeria-sidebar">
        <div class="galeria-sidebar__cat" data-link="/work/${cat}">← ${catName}</div>
        <div class="galeria-sidebar__list">
          ${ensaios.map(e => `
            <button class="galeria-sidebar__item ${e.slug === ensaio ? 'active' : ''}"
                    data-slug="${e.slug}">
              ${e.name}
            </button>
          `).join('')}
        </div>
      </aside>

      <div class="galeria-page">
        <div class="mobile-album-nav">
          ${ensaios.map(e => `
            <button class="mobile-album-nav__item ${e.slug === ensaio ? 'active' : ''}"
                    data-slug="${e.slug}">
              ${e.name}
            </button>
          `).join('')}
        </div>

        <header class="galeria-header">
          <h1 class="galeria-title">${ensaioName}</h1>
        </header>

        <main class="galeria-main">
          <div class="masonry">
            ${photos.map((p, i) => `
              <div class="masonry-item" data-index="${i}">
                <img
                  loading="lazy"
                  alt="${ensaioName} ${i + 1}"
                  src="${imageUrl(p.publicId, 'grid')}"
                  data-full="${imageUrl(p.publicId, 'lightbox')}"
                />
              </div>
            `).join('')}
          </div>
        </main>
      </div>

      <div class="lightbox" aria-hidden="true">
        <button class="lightbox__close" aria-label="Close">✕</button>
        <button class="lightbox__nav prev" aria-label="Previous">←</button>
        <div class="lightbox__stage">
          <img class="lightbox__img" src="" alt="" />
        </div>
        <button class="lightbox__nav next" aria-label="Next">→</button>
        <div class="lightbox__counter">
          <span class="lightbox__current">1</span> // <span class="lightbox__total">${photos.length}</span>
        </div>
      </div>

    </div>
  `

  requestAnimationFrame(() => requestAnimationFrame(() => initGaleria(photos, ensaios, ensaio, cat, ensaioName)))

  return html
}

function initGaleria(photos, ensaios, currentEnsaio, cat, ensaioName) {
  const items    = document.querySelectorAll('.masonry-item')
  const lightbox = document.querySelector('.lightbox')
  const lbImg    = document.querySelector('.lightbox__img')
  const closeBtn = document.querySelector('.lightbox__close')
  const prevBtn  = document.querySelector('.lightbox__nav.prev')
  const nextBtn  = document.querySelector('.lightbox__nav.next')
  const counter  = document.querySelector('.lightbox__current')

  let current = 0

  function open(index) {
    current = index
    lbImg.src = imageUrl(photos[current].publicId, 'lightbox')
    lbImg.alt = `${ensaioName} ${current + 1}`
    if (counter) counter.textContent = current + 1
    lightbox.setAttribute('aria-hidden', 'false')
    lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  function close() {
    lightbox.setAttribute('aria-hidden', 'true')
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
    lbImg.src = ''
  }

  function next() { open((current + 1) % photos.length) }
  function prev() { open((current - 1 + photos.length) % photos.length) }

  items.forEach(item => {
    item.addEventListener('click', () => open(Number(item.dataset.index)))
  })

  closeBtn.addEventListener('click', close)
  nextBtn.addEventListener('click', next)
  prevBtn.addEventListener('click', prev)

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close()
  })

  window.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  })

  // Sidebar navigation
  document.querySelectorAll('.galeria-sidebar__item').forEach(item => {
    item.addEventListener('click', () => push(`/work/${cat}/${item.dataset.slug}`))
  })

  document.querySelector('.galeria-sidebar__cat')?.addEventListener('click', () => {
    push(`/work/${cat}`)
  })

  // Mobile album navigation
  document.querySelectorAll('.mobile-album-nav__item').forEach(item => {
    item.addEventListener('click', () => push(`/work/${cat}/${item.dataset.slug}`))
  })

  // Swipe support
  let touchStartX = 0
  let touchStartY = 0

  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }, { passive: true })

  lightbox.addEventListener('touchend', e => {
    if (!lightbox.classList.contains('open')) return
    const dx = e.changedTouches[0].clientX - touchStartX
    const dy = e.changedTouches[0].clientY - touchStartY
    if (Math.abs(dx) < Math.abs(dy)) return // scroll vertical — ignora
    if (Math.abs(dx) < 50) return // movimento muito pequeno — ignora
    dx < 0 ? next() : prev()
  }, { passive: true })
}