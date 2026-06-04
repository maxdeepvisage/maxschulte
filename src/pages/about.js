const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxwnh6a6r'
const PHOTO_ID = 'ganga-5_iw4fis'

const STEPS = [
  {
    eyebrow: 'About',
    title: 'It started with\na camera.',
    body: 'It started with a camera and a need to show what most people walk past without noticing. Over the years, that impulse became a career — and the career became a way of connecting people through images that stay with them.',
    quote: 'I don\'t just film events. I document moments people will want to revisit twenty years from now.',
    align: 'left',
  },
  {
    eyebrow: 'Experience',
    title: 'Based in Dublin.\nWorking worldwide.',
    body: 'I work with clients across the world, bringing together the creative perspective of someone who has lived across different cultures and the technical dedication of someone who takes every project seriously.',
    stats: [
      { number: '10+', label: 'Years of experience' },
      { number: '9', label: 'Countries served' },
      { number: '300+', label: 'Projects delivered' },
    ],
    align: 'right',
  },
  {
    eyebrow: 'Services',
    title: 'What I can\ncreate for you.',
    services: [
      'Corporate Content — Brand videos, social media and campaigns',
      'Music Videos — Creative production for artists and labels',
      'Weddings — Photo and film of the most important day',
      'Portraits — Personal and professional sessions',
      'Documentaries — Long stories told with depth',
    ],
    align: 'left',
  },
  {
    eyebrow: 'Let\'s work together',
    title: 'Want to create\nsomething together?',
    body: 'No fixed pricing — and that\'s actually a good thing for you. Every project has its own scope, so I work with personalised quotes. You pay for exactly what you need and nothing you don\'t.',
    body2: 'Tell me about your project. The conversation is always free.',
    align: 'center',
    cta: true,
  },
]

export async function renderAbout(params = {}) {
  const html = `
    <div class="about-page">

      <div class="about-sticky">
        <div class="about-photo" id="aboutPhoto"
             style="background-image: url(https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1920,q_auto,f_webp/${PHOTO_ID})">
        </div>
        <div class="about-overlay" id="aboutOverlay"></div>

        ${STEPS.map((step, i) => `
          <div class="about-step ${i === 0 ? 'active' : ''} about-step--${step.align}" data-step="${i}">
            <p class="about-eyebrow">${step.eyebrow}</p>
            <h2 class="about-heading">${step.title.replace('\n', '<br>')}</h2>

            ${step.quote ? `<blockquote class="about-quote">"${step.quote}"</blockquote>` : ''}

            ${step.body ? `<p class="about-body">${step.body}</p>` : ''}

            ${step.stats ? `
              <div class="about-stats">
                ${step.stats.map(s => `
                  <div class="about-stat">
                    <span class="about-stat__number">${s.number}</span>
                    <span class="about-stat__label">${s.label}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${step.services ? `
              <ul class="about-services">
                ${step.services.map(s => `<li>${s}</li>`).join('')}
              </ul>
            ` : ''}

            ${step.body2 ? `<p class="about-body about-body--sm">${step.body2}</p>` : ''}

            ${step.cta ? `
              <a class="about-cta" href="https://wa.me/353000000000?text=Hi%20Max%2C%20I%27d%20like%20to%20discuss%20a%20project" target="_blank" rel="noopener">
                Chat on WhatsApp ↗
              </a>
              <p class="about-reply">I usually reply within 24 hours</p>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="about-scroll-track" id="aboutTrack"></div>

    </div>
  `

  requestAnimationFrame(() => initAbout())
  return html
}

function initAbout() {
  const photo   = document.getElementById('aboutPhoto')
  const overlay = document.getElementById('aboutOverlay')
  const page    = document.querySelector('.about-page')
  const steps   = document.querySelectorAll('.about-step')

  if (!photo || !page) return

  const TOTAL_STEPS = STEPS.length

  function onScroll() {
    const rect     = page.getBoundingClientRect()
    const pageTop  = window.scrollY + rect.top
    const scrolled = window.scrollY - pageTop
    const vh       = window.innerHeight
    const progress = Math.max(0, scrolled / vh)
    const stepIndex = Math.min(Math.floor(progress), TOTAL_STEPS - 1)

    // Zoom — de 1 a 1.6
    const zoom = 1 + Math.min(progress / TOTAL_STEPS, 1) * 0.6
    photo.style.transform = `scale(${zoom})`

    // Overlay
    const darkness = Math.min(0.2 + (progress / TOTAL_STEPS) * 0.4, 0.65)
    overlay.style.background = `rgba(0,0,0,${darkness})`

    // Steps
    steps.forEach((s, i) => {
      const isActive = i === stepIndex
      s.classList.toggle('active', isActive)
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  window.__pageCleanup = () => {
    window.removeEventListener('scroll', onScroll)
  }
}