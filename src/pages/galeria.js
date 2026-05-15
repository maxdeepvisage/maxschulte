import { getPhotos, imageUrl } from '../services/cloudinary.js'
import { push } from '../router.js'

export async function renderGaleria(params = {}) {
	const { cat, ensaio } = params
	const photos = await getPhotos(cat, ensaio)

	if (!photos || !photos.length) {
		return `<div class="empty-page">No photos found.</div>`
	}

	// sort by order if present
	photos.sort((a, b) => (a.order || 999) - (b.order || 999))

	const html = `
		<div class="galeria-page">
			<header class="galeria-header">
				<div class="galeria-breadcrumb">${cat.replace(/-/g, ' ').toUpperCase()}</div>
				<h1 class="galeria-title">${ensaio}</h1>
			</header>

			<main class="galeria-main">
				<div class="masonry">
					${photos.map((p, i) => `
						<div class="masonry-item" data-index="${i}" tabindex="0" aria-role="button">
							<img
								data-index="${i}"
								loading="lazy"
								alt="${ensaio} ${i + 1}"
								src="${imageUrl(p.publicId, 'grid')}"
								data-full="${imageUrl(p.publicId, 'lightbox')}"
							/>
						</div>
					`).join('')}
				</div>
			</main>

			<div class="lightbox" aria-hidden="true">
				<button class="lightbox__close" aria-label="Close">✕</button>
				<button class="lightbox__nav prev" aria-label="Previous">←</button>
				<div class="lightbox__stage">
					<img class="lightbox__img" src="" alt="" />
				</div>
				<button class="lightbox__nav next" aria-label="Next">→</button>
			</div>
		</div>
	`

	requestAnimationFrame(() => requestAnimationFrame(() => initGaleria(photos, cat, ensaio)))

	return html
}

function initGaleria(photos, cat, ensaio) {
	const items = Array.from(document.querySelectorAll('.masonry-item'))
	const lightbox = document.querySelector('.lightbox')
	const lbImg = document.querySelector('.lightbox__img')
	const closeBtn = document.querySelector('.lightbox__close')
	const prevBtn = document.querySelector('.lightbox__nav.prev')
	const nextBtn = document.querySelector('.lightbox__nav.next')

	let current = 0

	function open(index) {
		current = index
		const p = photos[current]
		lbImg.src = imageUrl(p.publicId, 'lightbox')
		lbImg.alt = `${ensaio} ${current + 1}`
		lightbox.setAttribute('aria-hidden', 'false')
		lightbox.classList.add('open')
		document.body.style.overflow = 'hidden'
		lbImg.focus?.()
	}

	function close() {
		lightbox.setAttribute('aria-hidden', 'true')
		lightbox.classList.remove('open')
		document.body.style.overflow = ''
		lbImg.src = ''
	}

	function next() {
		open((current + 1) % photos.length)
	}

	function prev() {
		open((current - 1 + photos.length) % photos.length)
	}

	items.forEach(item => {
		const idx = Number(item.dataset.index)
		item.addEventListener('click', () => open(idx))
		item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(idx) })
	})

	closeBtn.addEventListener('click', close)
	nextBtn.addEventListener('click', next)
	prevBtn.addEventListener('click', prev)

	lightbox.addEventListener('click', (e) => {
		if (e.target === lightbox) close()
	})

	window.addEventListener('keydown', (e) => {
		if (lightbox.getAttribute('aria-hidden') === 'false') {
			if (e.key === 'Escape') close()
			if (e.key === 'ArrowRight') next()
			if (e.key === 'ArrowLeft') prev()
		}
	})
}
