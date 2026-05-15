import { getCategories, imageUrl } from '../services/cloudinary.js'
import { initSlideshow } from '../components/slideshow.js'

export async function renderHome(params = {}) {
  const categories = await getCategories()
  const cloudName  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

  const html = `
    <div class="hero">
      <div class="slides">
        ${categories.map((cat, i) => `
          <div class="slide" data-index="${i}" data-slug="${cat.slug}">
            <div class="slide__img" style="background-image: url(https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_auto:best,f_webp/portfolio/${cat.slug}/cover)"></div>
            <div class="slide__overlay"></div>
          </div>
        `).join('')}
      </div>

      <div class="hero__ui">
        <div class="hero__category-label">PORTFOLIO</div>
        <div class="hero__counter">
          <button class="hero__nav prev-slide">⟵</button>
          <div class="hero__count">
            <span class="current-slide">01</span>
            <span class="hero__divider">//</span>
            <span class="total-slides">${String(categories.length).padStart(2, '0')}</span>
          </div>
          <button class="hero__nav next-slide">⟶</button>
        </div>
        <div class="hero__title-container slide-title-container">
          <div class="slide-title hero__title">${categories[0]?.name || ''}</div>
        </div>
        <div class="drag-indicator">
          <div class="lines-container"></div>
        </div>
        <div class="thumbs-container">
          <div class="slide-thumbs"></div>
        </div>
      </div>

      <div class="hero__enter">
        <button class="hero__enter-btn" id="enterCategory">View Work ↗</button>
      </div>

      <div class="hero__scroll-hint">scroll or drag</div>
    </div>
  `

  // Inicializa slideshow após render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initSlideshow(categories)
    })
  })

  return html
}