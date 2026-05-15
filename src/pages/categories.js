import { getCategories, imageUrl } from '../services/cloudinary.js'
import { push } from '../router.js'

export async function renderCategories(params = {}) {
  let categories = []
  try {
    categories = await getCategories()
  } catch {
    return `<div class="empty-page" style="padding:4rem;text-align:center">Failed to load categories.</div>`
  }

  if (!categories.length) {
    return `<div class="empty-page" style="padding:4rem;text-align:center">No categories found.</div>`
  }

  requestAnimationFrame(() => {
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => push(`/work/${card.dataset.slug}`))
    })
  })

  return `
    <div class="categories-page">
      <header class="page-header">
        <h1 class="page-title">Work</h1>
      </header>
      <div class="categories-grid">
        ${categories.map(cat => `
          <div class="category-card" data-slug="${cat.slug}">
            <div class="category-card__img" style="background-image: url(${imageUrl(cat.cover, 'thumb')})"></div>
            <div class="category-card__overlay">
              <h2 class="category-card__name">${cat.name}</h2>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}