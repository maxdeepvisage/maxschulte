const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxwnh6a6r'
const PHOTO_ID = 'ganga-5_iw4fis'

const STEPS = [
  {
    eyebrow: 'About',
    title: 'I tell stories\nthrough light.',
    body: 'Placeholder — Max Schulte is a photographer and filmmaker based in Dublin. His work spans documentary, portrait, fashion, and corporate photography — always rooted in the real.',
    align: 'left',
  },
  {
    eyebrow: 'Approach',
    title: 'Every frame\nis a decision.',
    body: 'Placeholder — The best images come from trust. From slowing down. From being present in the room rather than hiding behind the camera. That\'s the only way to capture something real.',
    align: 'right',
  },
  {
    eyebrow: 'Work',
    title: 'From Dublin\nto everywhere.',
    body: 'Placeholder — Portraits, documentaries, brand campaigns, events, weddings, and film. Available for projects across Ireland and internationally.',
    align: 'left',
  },
  {
    eyebrow: 'Let\'s work together',
    title: 'Have a project\nin mind?',
    body: 'Placeholder — Every project starts with a conversation. Reach out and let\'s make something worth keeping.',
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
            <p class="about-body">${step.body}</p>
            ${step.cta ? `<a class="about-cta" data-link="/contact">Get in touch ↗</a>` : ''}
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