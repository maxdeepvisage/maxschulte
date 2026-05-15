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
  { path: '/',                        render: renderHome },
  { path: '/work',                    render: renderCategories },
  { path: '/work/:cat',               render: renderEnsaios },
  { path: '/work/:cat/:ensaio',       render: renderGaleria },
  { path: '/movies',                   render: renderVideos },
  { path: '/about',                   render: renderAbout },
  { path: '/contact',                 render: renderContact },
  { path: '/admin',                   render: renderAdminLogin },
  { path: '/admin/dashboard',         render: renderAdminDashboard },
  { path: '/privacy',                 render: () => renderLegal('privacy') },
  { path: '/terms',                   render: () => renderLegal('terms') },
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
  // Cleanup página anterior
  if (window.__pageCleanup) {
    window.__pageCleanup()
    window.__pageCleanup = null
  }
  document.body.style.overflow = ''
  window.scrollTo(0, 0)

  const matched = matchRoute(pathname)

  if (!matched) {
    app.innerHTML = '<div style="padding:4rem;text-align:center;font-family:monospace">404 — page not found</div>'
    return
  }

  // Fade out
  app.style.transition = 'opacity 0.18s ease'
  app.style.opacity = '0'

  await new Promise(r => setTimeout(r, 180))

  app.innerHTML = await matched.render(matched.params)

  // Título dinâmico
  const titles = {
    '/':        'Max Schulte — Photography & Film',
    '/work':    'Work — Max Schulte',
    '/movies':  'Movies — Max Schulte',
    '/about':   'About — Max Schulte',
    '/contact': 'Contact — Max Schulte',
    '/privacy': 'Privacy — Max Schulte',
    '/terms':   'Terms — Max Schulte',
    '/admin':   'Admin — Max Schulte',
  }
  const base = pathname.split('/').slice(0, 2).join('/') || '/'
  document.title = titles[base] || 'Max Schulte — Photography & Film'

  // Fade in
  app.style.opacity = '0'
  requestAnimationFrame(() => {
    app.style.opacity = '1'
  })
}

export function push(path) {
  history.pushState({}, '', path)
  navigate(path)
}

export function initRouter() {
  window.addEventListener('popstate', () => navigate(window.location.pathname))

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]')
    if (!link) return
    e.preventDefault()
    push(link.dataset.link)
  })

  navigate(window.location.pathname)
}