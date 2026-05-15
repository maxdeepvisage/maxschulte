import { getEnsaios, imageUrl } from '../services/cloudinary.js'
import { push } from '../router.js'
import gsap from 'gsap'

export async function renderEnsaios(params = {}) {
  const { cat } = params
  const ensaios = await getEnsaios(cat)

  if (!ensaios.length) {
    return `<div class="empty-page" style="padding:4rem;text-align:center">No albums found.</div>`
  }

  const catName = cat.replace(/-/g, ' ').toUpperCase()
  const first = ensaios[0]

  const html = `
    <div class="ensaios-page">

      <div class="ensaios-split">

        <!-- Esquerda: imagem -->
        <div class="ensaios-image">
          ${ensaios.map((e, i) => `
            <div class="ensaios-image__slide ${i === 0 ? 'active' : ''}"
                 style="background-image: url(${imageUrl(e.cover, 'hero')})">
            </div>
          `).join('')}
        </div>

        <div class="ensaios-dots">
          ${ensaios.map((_, i) => `
            <span class="ensaios-dot ${i === 0 ? 'active' : ''}"></span>
          `).join('')}
        </div>

        <!-- Direita: conteúdo -->
        <div class="ensaios-content">

          <div class="ensaios-info">
            <p class="ensaios-info__cat">← <span data-link="/work">${catName}</span></p>
            <h1 class="ensaios-info__title">${first.name}</h1>
            <button class="ensaios-info__cta" data-slug="${first.slug}">View Series ↗</button>
          </div>

          <div class="ensaios-tabs">
            ${ensaios.map((e, i) => `
              <button class="ensaios-tab ${i === 0 ? 'active' : ''}"
                      data-index="${i}"
                      data-slug="${e.slug}">
                <span class="ensaios-tab__name">${e.name}</span>
              </button>
            `).join('')}
          </div>

        </div>
      </div>

    </div>
  `

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initEnsaios(ensaios, cat)
    })
  })

  return html
}

function initEnsaios(ensaios, cat) {
  const slides  = document.querySelectorAll('.ensaios-image__slide')
  const tabs    = document.querySelectorAll('.ensaios-tab')
  const title   = document.querySelector('.ensaios-info__title')
  const cta     = document.querySelector('.ensaios-info__cta')
  const catLink = document.querySelector('.ensaios-info__cat span')

  let current = 0
  let animating = false

  function goTo(index) {
    if (index === current || animating) return
    animating = true

    // Imagem crossfade
    gsap.to(slides[current], { opacity: 0, duration: 0.5, ease: 'power2.out' })
    gsap.to(slides[index],   { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 })

    // Texto fadeUp
    gsap.to(title, {
      opacity: 0, y: 10, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        title.textContent = ensaios[index].name
        cta.dataset.slug  = ensaios[index].slug
        gsap.fromTo(title,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
            onComplete: () => { animating = false }
          }
        )
      }
    })

    // Tabs
    tabs[current].classList.remove('active')
    tabs[index].classList.add('active')

    // Atualiza dots
    document.querySelectorAll('.ensaios-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })

    current = index
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      goTo(Number(tab.dataset.index))
    })
  })

  cta.addEventListener('click', () => {
    push(`/work/${cat}/${cta.dataset.slug}`)
  })

  catLink?.addEventListener('click', () => push('/work'))

  // Swipe na imagem mobile
  const imageEl = document.querySelector('.ensaios-image')
  if (imageEl) {
    let startX = 0
    imageEl.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX
    }, { passive: true })

    imageEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX
      if (Math.abs(dx) < 50) return
      if (dx < 0) {
        const next = (current + 1) % ensaios.length
        goTo(next)
      } else {
        const prev = (current - 1 + ensaios.length) % ensaios.length
        goTo(prev)
      }
    }, { passive: true })
  }
}