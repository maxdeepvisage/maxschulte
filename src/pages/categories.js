import { getCategories } from '../services/cloudinary.js'

export async function renderCategories(params = {}) {
  try {
    const categories = await getCategories()
    console.log('categories:', categories)
    return `<div style="padding:4rem;font-family:monospace;color:white">
      <p>Categories loaded: ${categories.length}</p>
      <pre>${JSON.stringify(categories, null, 2)}</pre>
    </div>`
  } catch (err) {
    console.error(err)
    return `<div style="padding:4rem;color:red;font-family:monospace">${err.message}</div>`
  }
}