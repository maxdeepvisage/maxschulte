import { push } from '../router.js'

export function renderNavbar() {
  const nav = document.createElement('nav')
  nav.className = 'navbar'

  nav.innerHTML = `
    <a class="navbar__logo" data-link="/">MS</a>
    <ul class="navbar__links" id="navMenu">
      <li><a data-link="/work">Work</a></li>
      <li><a data-link="/movies">Movies</a></li>
      <li><a data-link="/about">About</a></li>
      <li><a data-link="/contact">Contact</a></li>
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