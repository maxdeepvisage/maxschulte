import { getCategories, imageUrl } from '../services/cloudinary.js'
import { initSlideshow } from '../components/slideshow.js'

const WHATSAPP = '353000000000'

const HOME_SERVICES = [
  { num: '01', name: 'Documentaries', desc: 'Most documentaries feel like a report. The ones I make feel like you were there. The difference is knowing when to stop directing and just watch.' },
  { num: '02', name: 'Weddings', desc: "The day moves fast. People forget things they swore they'd remember. My job is to make sure you don't have to rely on memory." },
  { num: '03', name: 'Corporate', desc: 'If it looks like every other brand video, it probably converts like one too. I make content that people actually stop to watch.' },
  { num: '04', name: 'Portraits', desc: "Most people hate being photographed. I've heard it hundreds of times. Give me an hour and you'll see why they change their mind." },
  { num: '05', name: 'Fashion & Events', desc: "Events disappear the moment they end. I make sure the feeling doesn't." },
]

export async function renderHome(params = {}) {
  const categories = await getCategories()

  const html = `
    <div class="hero">
      <div class="slides">
        ${categories.map((cat, i) => `
          <div class="slide" data-index="${i}" data-slug="${cat.slug}">
            <div class="slide__img" style="background-image: url(${imageUrl(cat.cover, 'hero')})"></div>
            <div class="slide__overlay"></div>
          </div>
        `).join('')}
      </div>

      <div class="hero__ui">
        <div class="hero__category-label">PORTFOLIO</div>
        <p class="hero__tagline">Photographer &amp; filmmaker based in Dublin — documenting what matters, for clients worldwide.</p>
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
        <div class="hero__enter">
          <button class="hero__enter-btn" id="enterCategory">View Work ↗</button>
        </div>
        <div class="thumbs-container">
          <div class="slide-thumbs"></div>
        </div>
      </div>

      <div class="hero__scroll-hint">scroll or drag</div>
    </div>

    <section class="home-about">
      <div class="home-about__container">

        <div class="home-about__header">
          <p class="home-about__eyebrow">About the work</p>
          <blockquote class="home-about__quote">Based in Dublin. Hired worldwide. I show up, I stay until it's right, and I deliver work that still holds up years later.</blockquote>
        </div>

        <div class="home-about__stats">
          <div class="home-about__stat">
            <span class="home-about__stat-number">10+</span>
            <span class="home-about__stat-label">Years of experience</span>
          </div>
          <div class="home-about__stat">
            <span class="home-about__stat-number">9</span>
            <span class="home-about__stat-label">Countries served</span>
          </div>
          <div class="home-about__stat">
            <span class="home-about__stat-number">300+</span>
            <span class="home-about__stat-label">Projects delivered</span>
          </div>
        </div>

        <div class="home-about__services">
          ${HOME_SERVICES.map(s => `
            <div class="home-about__service-card">
              <span class="home-about__service-num">${s.num}</span>
              <p class="home-about__service-desc">${s.desc}</p>
              <span class="home-about__service-name">${s.name}</span>
            </div>
          `).join('')}
        </div>

        <div class="home-about__cta">
          <p class="home-about__eyebrow">Let's work together</p>
          <p class="home-about__cta-text">Not sure where to start? Neither are most people. Send a message — the first conversation is always free.</p>
          <p class="home-about__cta-note">I usually reply within 24 hours. No commitment, no pressure.</p>
          <a class="home-about__cta-btn"
             href="https://wa.me/${WHATSAPP}?text=Hi%20Max%2C%20I%27d%20like%20to%20discuss%20a%20project"
             target="_blank" rel="noopener">
            Start a conversation ↗
          </a>
        </div>

      </div>
    </section>
  `

  window.__firstCover = categories[0]?.cover || null

  requestAnimationFrame(() => {
    categories.forEach(cat => {
      if (cat.cover) {
        const img = new Image()
        img.src = imageUrl(cat.cover, 'hero')
      }
    })
    initSlideshow(categories)
    initHomeAbout()
  })

  return html
}

function initHomeAbout() {
  const els = document.querySelectorAll(
    '.home-about__header, .home-about__stats, .home-about__service-card, .home-about__cta'
  )
  if (!els.length) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08 })

  els.forEach(el => observer.observe(el))
  window.__pageCleanup = () => observer.disconnect()
}