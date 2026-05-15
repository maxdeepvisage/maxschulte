export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    const allowedOrigins = [
      'https://maxschulte.pages.dev',
      'http://localhost:5173',
      'http://localhost:4173',
    ]

    const origin = request.headers.get('Origin') || ''
    const cors = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: cors })
    }

    const rawPath = url.pathname
    const path = decodeURIComponent(rawPath).toLowerCase()

    try {
      // GET /api/categories
      if (path === '/api/categories') {
        const data = await cloudinarySearch(env, {
          expression: 'asset_folder:portfolio/*',
          with_field: ['tags'],
          max_results: 500,
        })

        // Agrupa por categoria e separa recursos que estão na raiz da categoria
        const categoriesMap = new Map()
        for (const r of data.resources || []) {
          const folder = r.asset_folder || '' // ex: "portfolio/portraits" or "portfolio/portraits/bea"
          const parts = folder.split('/')
          if (parts.length < 2) continue
          const slug = parts[1]
          if (!categoriesMap.has(slug)) {
            categoriesMap.set(slug, { slug, name: formatName(slug), root: [], nested: [] })
          }

          const entry = categoriesMap.get(slug)
          // classifica como root se estiver diretamente em portfolio/<slug>
          if (parts.length === 2) {
            entry.root.push(r)
          } else {
            entry.nested.push(r)
          }
        }

        // monta resultado priorizando covers na raiz da categoria
        const results = []
        for (const [slug, entry] of categoriesMap.entries()) {
          let cover = null

          // 1) procura tag 'cover' apenas em root (somente imagens diretamente na pasta da categoria)
          cover = entry.root.find(r => r.tags?.includes('cover'))?.public_id || null

          // 2) fallback: primeira imagem em root (se não houver tag 'cover')
          if (!cover) cover = entry.root[0]?.public_id || null

          // 3) fallback: primeira imagem nested (se categoria não tiver imagens na raiz)
          if (!cover) cover = entry.nested[0]?.public_id || null

          results.push({ slug, name: formatName(slug), cover })
        }

        return json(results, cors)
      }

      // GET /api/categories/:cat
      const ensaiosMatch = path.match(/^\/api\/categories\/([^/]+)$/)
      if (ensaiosMatch) {
        const cat = ensaiosMatch[1]
        const data = await cloudinarySearch(env, {
          expression: `asset_folder:portfolio/${cat}/*`,
          with_field: ['tags'],
          max_results: 500,
        })

        const ensaiosMap = new Map()
        for (const r of data.resources || []) {
          const parts = r.asset_folder.split('/')
          if (parts.length !== 3) continue
          const slug = parts[2]
          if (!ensaiosMap.has(slug)) {
            ensaiosMap.set(slug, { slug, name: formatName(slug), cover: null })
          }
          if (r.tags?.includes('cover') && !ensaiosMap.get(slug).cover) {
            ensaiosMap.get(slug).cover = r.public_id
          }
        }

        // fallback cover — reusa data já carregado
        for (const r of data.resources || []) {
          const parts = r.asset_folder.split('/')
          if (parts.length !== 3) continue
          const slug = parts[2]
          const ensaio = ensaiosMap.get(slug)
          if (ensaio && !ensaio.cover) ensaio.cover = r.public_id
        }

        return json([...ensaiosMap.values()], cors)
      }

      // GET /api/categories/:cat/:ensaio
      const photosMatch = path.match(/^\/api\/categories\/([^/]+)\/([^/]+)$/)
      if (photosMatch) {
        const [, cat, ensaio] = photosMatch
        const data = await cloudinarySearch(env, {
          expression: `asset_folder="portfolio/${cat}/${ensaio}" AND NOT tags:hidden`,
          with_field: ['tags', 'context'],
          max_results: 500,
        })

        const photos = (data.resources || []).map(r => ({
          publicId: r.public_id,
          tags: r.tags || [],
          order: r.context?.custom?.order ?? 999,
        }))

        return json(photos, cors)
      }

      return new Response('Not found', { status: 404, headers: cors })

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }
  }
}

async function cloudinarySearch(env, body) {
  const credentials = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Cloudinary ${res.status}: ${await res.text()}`)
  return res.json()
}

function json(data, cors) {
  return new Response(JSON.stringify(data), {
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}

const DISPLAY_NAMES = {
  'food-and-drinks': 'Food & Drinks',
  'crooked-three':   'Crooked Three',
  'freak-dali':      'Freak Dalí',
  'the-harcourt':    'The Harcourt',
}

function formatName(slug) {
  if (DISPLAY_NAMES[slug]) return DISPLAY_NAMES[slug]
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}