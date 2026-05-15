const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxwnh6a6r'

function cloudinaryUrl(publicId, transform) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`
}

const PHOTO_ID = 'ganga-5_iw4fis'

export async function renderAbout(params = {}) {
  const html = `
    <div class="about-page">

      <!-- Section 1 — Wide, intro -->
      <section class="about-section about-section--1">
        <div class="about-img-wrap">
          <div class="about-img" id="aboutImg1"
               style="background-image: url(${cloudinaryUrl(PHOTO_ID, 'w_1920,q_auto,f_webp')})">
          </div>
          <div class="about-img-overlay"></div>
        </div>
        <div class="about-text about-text--intro">
          <p class="about-label">About</p>
          <h1 class="about-title">I tell stories<br>through light.</h1>
          <p class="about-body">
            Placeholder — Max Schulte is a photographer and filmmaker
            based in Dublin. His work spans documentary, portrait, fashion,
            and corporate photography — always rooted in the real.
          </p>
        </div>
      </section>

      <!-- Section 2 — Closer, philosophy -->
      <section class="about-section about-section--2">
        <div class="about-img-wrap">
          <div class="about-img" id="aboutImg2"
               style="background-image: url(${cloudinaryUrl(PHOTO_ID, 'w_1920,q_auto,f_webp,z_1.3')})">
          </div>
          <div class="about-img-overlay"></div>
        </div>
        <div class="about-text about-text--right">
          <p class="about-eyebrow">Approach</p>
          <h2 class="about-heading">Every frame<br>is a decision.</h2>
          <p class="about-body">
            Placeholder — The best images come from trust.
            From slowing down. From being present in the room
            rather than hiding behind the camera.
            That's the only way to capture something real.
          </p>
        </div>
      </section>

      <!-- Section 3 — Even closer, work -->
      <section class="about-section about-section--3">
        <div class="about-img-wrap">
          <div class="about-img" id="aboutImg3"
               style="background-image: url(${cloudinaryUrl(PHOTO_ID, 'w_1920,q_auto,f_webp,z_1.7')})">
          </div>
          <div class="about-img-overlay"></div>
        </div>
        <div class="about-text about-text--left">
          <p class="about-eyebrow">Work</p>
          <h2 class="about-heading">From Dublin<br>to everywhere.</h2>
          <p class="about-body">
            Placeholder — Portraits, documentaries, brand campaigns,
            events, weddings, and film. Available for projects
            across Ireland and internationally.
          </p>
        </div>
      </section>

      <!-- Section 4 — Close, CTA -->
      <section class="about-section about-section--4">
        <div class="about-img-wrap">
          <div class="about-img" id="aboutImg4"
               style="background-image: url(${cloudinaryUrl(PHOTO_ID, 'w_1920,q_auto,f_webp,z_2.2')})">
          </div>
          <div class="about-img-overlay about-img-overlay--dark"></div>
        </div>
        <div class="about-text about-text--center">
          <p class="about-eyebrow">Let's work together</p>
          <h2 class="about-heading">Have a project<br>in mind?</h2>
          <p class="about-body">
            Placeholder — Every project starts with a conversation.
            Reach out and let's make something worth keeping.
          </p>
          <a href="/contact" class="about-cta" data-link="/contact">
            Get in touch ↗
          </a>
        </div>
      </section>

    </div>
  `

  requestAnimationFrame(() => initAbout())
  return html
}

function initAbout() {
  const sections = document.querySelectorAll('.about-section')
  if (!sections.length) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view')
      }
    })
  }, { threshold: 0.15 })

  sections.forEach(s => observer.observe(s))

  // Parallax suave no scroll
  const onScroll = () => {
    const scrollY = window.scrollY

    sections.forEach((section, i) => {
      const img = section.querySelector('.about-img')
      if (!img) return
      const rect = section.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - window.innerHeight / 2
      const parallax = center * 0.08
      img.style.transform = `scale(${1 + i * 0.08}) translateY(${parallax}px)`
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })

  window.__pageCleanup = () => {
    window.removeEventListener('scroll', onScroll)
    observer.disconnect()
  }
}