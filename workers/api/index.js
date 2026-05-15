export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    const path = url.pathname

    try {
      // GET /api/categories
      if (path === '/api/categories') {
        const data = await cloudinarySearch(env, {
          expression: 'asset_folder:portfolio/*',
          with_field: ['tags'],
          max_results: 500,
        })

        // Extrai categorias únicas do asset_folder
        const categoriesMap = new Map()
        for (const r of data.resources || []) {
          const folder = r.asset_folder // ex: "portfolio/portraits"
          const parts = folder.split('/')
          if (parts.length < 2) continue
          const slug = parts[1]
          if (!categoriesMap.has(slug)) {
            categoriesMap.set(slug, { slug, name: formatName(slug), cover: null })
          }
          if (r.tags?.includes('cover') && !categoriesMap.get(slug).cover) {
            categoriesMap.get(slug).cover = r.public_id
          }
        }

        return json([...categoriesMap.values()], cors)
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
          const folder = r.asset_folder // ex: "portfolio/portraits/bea"
          const parts = folder.split('/')
          if (parts.length < 3) continue
          const slug = parts[2]
          if (!ensaiosMap.has(slug)) {
            ensaiosMap.set(slug, { slug, name: formatName(slug), cover: null })
          }
          if (r.tags?.includes('cover') && !ensaiosMap.get(slug).cover) {
            ensaiosMap.get(slug).cover = r.public_id
          }
        }

        // Se ensaio não tem cover, usa primeira foto
        const data2 = await cloudinarySearch(env, {
          expression: `asset_folder:portfolio/${cat}/*`,
          with_field: ['tags'],
          max_results: 500,
        })
        for (const r of data2.resources || []) {
          const parts = r.asset_folder.split('/')
          if (parts.length < 3) continue
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
          expression: `asset_folder:portfolio/${cat}/${ensaio} NOT tags:hidden`,
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
      return new Response(JSON.stringify({ error: err.message }), {
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

function formatName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}