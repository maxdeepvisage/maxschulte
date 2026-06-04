import { push } from '../router.js'

const WHATSAPP  = '353000000000'
const INSTAGRAM = 'maxwaschulte'

export function renderNavbar() {
  const nav = document.createElement('nav')
  nav.className = 'navbar'

  nav.innerHTML = `
    <a class="navbar__logo" data-link="/">MS</a>
    <ul class="navbar__links" id="navMenu">
      <li class="navbar__menu-header">
        <span class="navbar__menu-label">Menu</span>
      </li>
      <li><a data-link="/work">Work</a></li>
      <li><a data-link="/movies">Movies</a></li>
      <li><a data-link="/about">About</a></li>
      <li><a data-link="/contact">Contact</a></li>
      <li class="navbar__menu-footer">
        <a class="navbar__menu-icon" href="https://wa.me/${WHATSAPP}?text=Hi%20Max%2C%20I%27d%20like%20to%20discuss%20a%20project" target="_blank" rel="noopener" aria-label="WhatsApp">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </a>
        <a class="navbar__menu-icon" href="https://instagram.com/${INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
          </svg>
        </a>
      </li>
    </ul>
    <button class="navbar__burger" aria-label="Menu" aria-expanded="false">
      <span></span>
      <span></span>
    </button>
  `

  const burger = nav.querySelector('.navbar__burger')
  const links  = nav.querySelector('.navbar__links')

  burger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open')
    burger.classList.toggle('open')
    burger.setAttribute('aria-expanded', isOpen)
    document.body.style.overflow = isOpen ? 'hidden' : ''
  })

  nav.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open')
      burger.classList.remove('open')
      burger.setAttribute('aria-expanded', 'false')
      document.body.style.overflow = ''
    })
  })

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40)
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  // Active state
  function updateActive() {
    const path = window.location.pathname
    nav.querySelectorAll('.navbar__links a').forEach(a => {
      const href = a.dataset.link
      const isActive = href === '/' ? path === '/' : path.startsWith(href)
      a.classList.toggle('active', isActive)
    })
  }
  updateActive()
  window.addEventListener('popstate', updateActive)
  document.addEventListener('click', e => {
    if (e.target.closest('[data-link]')) setTimeout(updateActive, 0)
  })

  return nav
}