const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxwnh6a6r'
const API_URL    = import.meta.env.VITE_API_URL || 'https://maxschulte-api.maxwschulte.workers.dev'

const TRANSFORMS = {
  thumb:    'w_600,h_400,c_fill,q_auto,f_webp',
  grid:     'w_800,q_auto,f_webp',
  lightbox: 'w_1920,q_auto,f_webp',
  hero:     'w_1920,q_auto,f_webp',
  lqip:     'w_50,q_10,f_webp',
}

export function imageUrl(publicId, transform = 'grid') {
  if (!publicId) return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  const t = TRANSFORMS[transform] || transform
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}/${publicId}`
}

async function apiFetch(path) {
  const cacheKey = `api:${path}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) return JSON.parse(cached)

  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data))
  } catch (e) {
    // sessionStorage cheio — ignora
  }

  return data
}

export async function getCategories() {
  return apiFetch('/api/categories')
}

export async function getEnsaios(categorySlug) {
  return apiFetch(`/api/categories/${categorySlug}`)
}

export async function getPhotos(categorySlug, ensaioSlug) {
  return apiFetch(`/api/categories/${categorySlug}/${ensaioSlug}`)
}