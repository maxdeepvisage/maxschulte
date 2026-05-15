import { push } from '../router.js'

export function renderNavbar() {
  const nav = document.createElement('nav')
  nav.className = 'navbar'

  nav.innerHTML = `
    <a class="navbar__logo" data-link="/">MS</a>
    <ul class="navbar__links">
      <li><a data-link="/work">Work</a></li>
      <li><a data-link="/videos">Film</a></li>
      <li><a data-link="/about">About</a></li>
      <li><a data-link="/contact">Contact</a></li>
    </ul>
    <button class="navbar__burger" aria-label="Menu">
      <span></span><span></span>
    </button>
  `

  // Mobile menu toggle
  const burger = nav.querySelector('.navbar__burger')
  const links  = nav.querySelector('.navbar__links')
  burger.addEventListener('click', () => {
    links.classList.toggle('open')
    burger.classList.toggle('open')
  })

  // Fecha menu ao clicar em link
  nav.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open')
      burger.classList.remove('open')
    })
  })

  return nav
}