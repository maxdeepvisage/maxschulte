import { getEnsaios, imageUrl } from '../services/cloudinary.js'
import { push } from '../router.js'
import gsap from 'gsap'

export async function renderEnsaios(params = {}) {
  const { cat } = params
  const ensaios = await getEnsaios(cat)

  if (!ensaios.length) {
    return `<div class="empty-page">No albums found.</div>`
  }

  const html = `
    <div class="ensaios-page">
      <div class="ensaios-split">

        <div class="ensaios-image">
          ${ensaios.map((e, i) => `
            <div class="ensaios-image__slide ${i === 0 ? 'active' : ''}"
                 style="background-image: url(${imageUrl(e.cover, 'hero')})">
            </div>
          `).join('')}
        </div>

        <div class="ensaios-content">
          <div class="ensaios-info">
            <p class="ensaios-info__sub">${cat} — <span class="ensaios-info__album">${ensaios[0].name}</span></p>
            <h1 class="ensaios-info__title">${ensaios[0].name}</h1>
            <button class="ensaios-info__cta" data-slug="${ensaios[0].slug}">View Series ↗</button>
          </div>

          <div class="ensaios-tabs">
            ${ensaios.map((e, i) => `
              <button class="ensaios-tab ${i === 0 ? 'active' : ''}" data-index="${i}" data-slug="${e.slug}">
                <span class="ensaios-tab__name">${e.name}</span>
                <span class="ensaios-tab__line"></span>
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
  const sub     = document.querySelector('.ensaios-info__album')
  const cta     = document.querySelector('.ensaios-info__cta')

  let current = 0

  function goTo(index) {
    if (index === current) return

    // Imagem — crossfade
    gsap.to(slides[current], { opacity: 0, duration: 0.4, ease: 'power2.out' })
    gsap.to(slides[index],   { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.1 })

    // Texto — fadeUp
    gsap.fromTo([title, sub], 
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.15 }
    )

    // Tabs
    tabs[current].classList.remove('active')
    tabs[index].classList.add('active')

    // Atualiza conteúdo
    title.textContent = ensaios[index].name
    sub.textContent   = ensaios[index].name
    cta.dataset.slug  = ensaios[index].slug

    current = index
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => goTo(Number(tab.dataset.index)))
  })

  cta.addEventListener('click', () => {
    push(`/work/${cat}/${cta.dataset.slug}`)
  })
}