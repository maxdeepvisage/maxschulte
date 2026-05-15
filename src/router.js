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
  if (window.__pageCleanup) {
    window.__pageCleanup()
    window.__pageCleanup = null
  }
  document.body.style.overflow = ''
  window.scrollTo(0, 0)

  const matched = matchRoute(pathname)

  if (!matched) {
    app.innerHTML = `
      <div class="not-found">
        <div class="not-found__content">
          <p class="not-found__code">404</p>
          <h1 class="not-found__title">Page Not Found</h1>
          <p class="not-found__desc">The page you're looking for doesn't exist or has been moved.</p>
          <button class="not-found__btn" id="notFoundBack">← Back to Home</button>
        </div>
      </div>
    `
    requestAnimationFrame(() => {
      document.querySelector('#notFoundBack')?.addEventListener('click', () => push('/'))
    })
    setMeta({
      title: '404 — Max Schulte',
      description: 'Page not found.',
    })
    return
  }

  const duration = window.matchMedia('(max-width: 767px)').matches ? 100 : 180
  app.style.transition = `opacity ${duration}ms ease`
  app.style.opacity = '0'
  await new Promise(r => setTimeout(r, duration))

  app.innerHTML = await matched.render(matched.params)

  app.style.opacity = '0'
  requestAnimationFrame(() => { app.style.opacity = '1' })

  updateMeta(pathname, matched.params)
}

function updateMeta(pathname, params = {}) {
  const base = pathname.split('/').slice(0, 2).join('/') || '/'

  const metas = {
    '/': {
      title: 'Max Schulte — Photography & Film',
      description: 'Portfolio of Max Schulte — documentary, portrait, fashion and event photography based in Dublin, available worldwide.',
    },
    '/work': {
      title: 'Work — Max Schulte',
      description: 'Photography portfolio — documentaries, portraits, fashion, events and more.',
    },
    '/movies': {
      title: 'Movies — Max Schulte',
      description: 'Film and documentary work by Max Schulte.',
    },
    '/about': {
      title: 'About — Max Schulte',
      description: 'Max Schulte is a photographer and filmmaker based in Dublin, available worldwide.',
    },
    '/contact': {
      title: 'Contact — Max Schulte',
      description: 'Get in touch to discuss your project.',
    },
    '/privacy': {
      title: 'Privacy Policy — Max Schulte',
      description: 'Privacy policy for maxschulte.com',
    },
    '/terms': {
      title: 'Terms of Use — Max Schulte',
      description: 'Terms of use for maxschulte.com',
    },
  }

  const meta = metas[base] || metas['/']

  if (params.ensaio) {
    meta.title = `${params.ensaio} — Max Schulte`
  } else if (params.cat && !params.ensaio) {
    meta.title = `${params.cat.charAt(0).toUpperCase() + params.cat.slice(1)} — Max Schulte`
  }

  setMeta(meta)
}

function setMeta({ title, description }) {
  document.title = title

  let desc = document.querySelector('meta[name="description"]')
  if (!desc) {
    desc = document.createElement('meta')
    desc.name = 'description'
    document.head.appendChild(desc)
  }
  desc.content = description

  // Open Graph
  setOG('og:title', title)
  setOG('og:description', description)
  setOG('og:type', 'website')
  setOG('og:url', window.location.href)
}

function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
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