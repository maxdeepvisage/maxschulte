import { renderHome } from './pages/home.js'
import { renderCategories } from './pages/categories.js'
import { renderEnsaios } from './pages/ensaios.js'
import { renderGaleria } from './pages/galeria.js'
import { renderVideos } from './pages/videos.js'
import { renderAbout } from './pages/about.js'
import { renderContact } from './pages/contact.js'
import { renderAdminLogin } from './pages/admin-login.js'
import { renderAdminDashboard } from './pages/admin-dashboard.js'
import { renderLegal } from './pages/legal.js'

const routes = [
  { path: '/',                          render: renderHome },
  { path: '/categorias',                render: renderCategories },
  { path: '/categorias/:cat',           render: renderEnsaios },
  { path: '/categorias/:cat/:ensaio',   render: renderGaleria },
  { path: '/videos',                    render: renderVideos },
  { path: '/about',                     render: renderAbout },
  { path: '/contact',                   render: renderContact },
  { path: '/admin',                     render: renderAdminLogin },
  { path: '/admin/dashboard',           render: renderAdminDashboard },
  { path: '/privacidade',               render: () => renderLegal('privacidade') },
  { path: '/termos',                    render: () => renderLegal('termos') },
]

function matchRoute(pathname) {
  for (const route of routes) {
    const routeParts = route.path.split('/')
    const pathParts  = pathname.split('/')

    if (routeParts.length !== pathParts.length) continue

    const params = {}
    let match = true

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i]
      } else if (routeParts[i] !== pathParts[i]) {
        match = false
        break
      }
    }

    if (match) return { render: route.render, params }
  }

  return null
}

const app = document.getElementById('app')

async function navigate(pathname) {
  window.scrollTo(0, 0)

  const matched = matchRoute(pathname)

  if (!matched) {
    app.innerHTML = '<div style="padding:4rem;text-align:center;font-family:monospace">404 — página não encontrada</div>'
    return
  }

  app.innerHTML = await matched.render(matched.params)
}

export function push(path) {
  history.pushState({}, '', path)
  navigate(path)
}

export function initRouter() {
  // Navegação pelo botão voltar/avançar
  window.addEventListener('popstate', () => navigate(window.location.pathname))

  // Intercepta cliques em links internos
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]')
    if (!link) return
    e.preventDefault()
    push(link.dataset.link)
  })

  // Rota inicial
  navigate(window.location.pathname)
}