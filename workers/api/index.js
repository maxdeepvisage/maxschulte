export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // CORS headers
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
        const data = await cloudinaryGet(env, `folders/portfolio`)
        return json(data.folders.map(f => ({
          slug: f.name,
          name: formatName(f.name),
          path: f.path,
        })), cors)
      }

      // GET /api/categories/:cat
      const ensaiosMatch = path.match(/^\/api\/categories\/([^/]+)$/)
      if (ensaiosMatch) {
        const cat = ensaiosMatch[1]
        const data = await cloudinaryGet(env, `folders/portfolio/${cat}`)
        const folders = data.folders || []

        const ensaios = await Promise.all(folders.map(async f => {
          const resources = await cloudinaryGet(env,
            `resources/image?prefix=portfolio/${cat}/${f.name}/&type=upload&max_results=10&tags=true`
          )
          const cover = resources.resources?.find(r => r.tags?.includes('cover'))
            || resources.resources?.[0]
          return {
            slug: f.name,
            name: formatName(f.name),
            thumb: cover ? cover.public_id : null,
          }
        }))

        return json(ensaios, cors)
      }

      // GET /api/categories/:cat/:ensaio
      const photosMatch = path.match(/^\/api\/categories\/([^/]+)\/([^/]+)$/)
      if (photosMatch) {
        const [, cat, ensaio] = photosMatch
        const data = await cloudinaryGet(env,
          `resources/image?prefix=portfolio/${cat}/${ensaio}/&type=upload&max_results=500&tags=true&context=true`
        )
        const photos = (data.resources || [])
          .filter(r => !r.tags?.includes('hidden'))
          .map(r => ({
            publicId: r.public_id,
            tags: r.tags || [],
            order: r.context?.custom?.order || 999,
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

async function cloudinaryGet(env, endpoint) {
  const credentials = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${endpoint}`, {
    headers: { 'Authorization': `Basic ${credentials}` }
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