import { getPhotos, imageUrl } from '../services/cloudinary.js'
import { push } from '../router.js'

export async function renderGaleria(params = {}) {
  const { cat, ensaio } = params
  const photos = await getPhotos(cat, ensaio)

  if (!photos || !photos.length) {
    return `<div class="empty-page" style="padding:4rem;text-align:center">No photos found.</div>`
  }

  photos.sort((a, b) => (a.order || 999) - (b.order || 999))

  const catName = cat.replace(/-/g, ' ').toUpperCase()
  const ensaioName = ensaio.charAt(0).toUpperCase() + ensaio.slice(1)

  const html = `
    <div class="galeria-page">
      <header class="galeria-header">
        <div class="galeria-breadcrumb" data-link="/work/${cat}">
          ← ${catName}
        </div>
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

  requestAnimationFrame(() => requestAnimationFrame(() => initGaleria(photos, ensaioName)))

  return html
}

function initGaleria(photos, ensaioName) {
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
}