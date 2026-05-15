import gsap from 'gsap'
import { push } from '../router.js'

const NEXT = 1
const PREV = -1

let isAnimating = false
let pendingNavigation = null
let currentHoveredThumb = null
let mouseOverThumbnails = false
let lastHoveredThumbIndex = null

function updateNavigationUI(disabled) {
  document.querySelectorAll('.hero__nav').forEach(btn => {
    btn.style.opacity = disabled ? '0.3' : ''
    btn.style.pointerEvents = disabled ? 'none' : ''
  })
  document.querySelectorAll('.slide-thumb').forEach(thumb => {
    thumb.style.pointerEvents = disabled ? 'none' : ''
  })
}

function updateSlideCounter(index) {
  const el = document.querySelector('.current-slide')
  if (el) el.textContent = String(index + 1).padStart(2, '0')
}

function updateSlideTitle(index, titles) {
  const container = document.querySelector('.slide-title-container')
  const current   = document.querySelector('.slide-title')
  if (!container || !current) return

  const next = document.createElement('div')
  next.className = 'slide-title hero__title enter-up'
  next.textContent = titles[index]
  container.appendChild(next)
  current.classList.add('exit-up')
  void next.offsetWidth
  setTimeout(() => next.classList.remove('enter-up'), 10)
  setTimeout(() => current.remove(), 500)
}

function updateDragLines(activeIndex, slideCount, forceUpdate = false) {
  const lines = document.querySelectorAll('.drag-line')
  if (!lines.length) return

  lines.forEach(line => {
    line.style.height = 'var(--line-base-height)'
    line.style.backgroundColor = 'rgba(255,255,255,0.2)'
  })

  if (activeIndex === null) return

  const lineCount    = lines.length
  const thumbWidth   = 720 / slideCount
  const centerPos    = (activeIndex + 0.5) * thumbWidth
  const lineWidth    = 720 / lineCount

  for (let i = 0; i < lineCount; i++) {
    const linePos  = (i + 0.5) * lineWidth
    const dist     = Math.abs(linePos - centerPos)
    const maxDist  = thumbWidth * 0.7
    if (dist > maxDist) continue

    const norm      = dist / maxDist
    const wave      = Math.cos((norm * Math.PI) / 2)
    const baseH     = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--line-base-height'))
    const height    = baseH + wave * 35
    const opacity   = 0.2 + wave * 0.5
    const delay     = norm * 100

    if (forceUpdate) {
      lines[i].style.height = `${height}px`
      lines[i].style.backgroundColor = `rgba(255,255,255,${opacity})`
    } else {
      setTimeout(() => {
        if (currentHoveredThumb === activeIndex || (mouseOverThumbnails && lastHoveredThumbIndex === activeIndex)) {
          lines[i].style.height = `${height}px`
          lines[i].style.backgroundColor = `rgba(255,255,255,${opacity})`
        }
      }, delay)
    }
  }
}

class Slideshow {
  constructor(el, categories, onSlideChange) {
    this.el         = el
    this.slides     = [...el.querySelectorAll('.slide')]
    this.inner      = this.slides.map(s => s.querySelector('.slide__img'))
    this.categories = categories
    this.titles     = categories.map(c => c.name)
    this.current    = 0
    this.total      = this.slides.length
    this.onChange   = onSlideChange

    this.slides[0].classList.add('slide--current')
  }

  goTo(index) {
    if (isAnimating) { pendingNavigation = { type: 'goto', index }; return }
    if (index === this.current) return

    isAnimating = true
    updateNavigationUI(true)

    const prev = this.current
    this.current = index

    document.querySelectorAll('.slide-thumb').forEach((t, i) => t.classList.toggle('active', i === index))
    updateSlideCounter(index)
    updateSlideTitle(index, this.titles)
    updateDragLines(index, this.total, true)
    this.onChange?.(this.categories[index])

    this._animate(prev, index, index > prev ? 1 : -1)
  }

  navigate(dir) {
    if (isAnimating) { pendingNavigation = { type: 'navigate', dir }; return }

    isAnimating = true
    updateNavigationUI(true)

    const prev = this.current
    this.current = dir === 1
      ? (this.current < this.total - 1 ? this.current + 1 : 0)
      : (this.current > 0 ? this.current - 1 : this.total - 1)

    document.querySelectorAll('.slide-thumb').forEach((t, i) => t.classList.toggle('active', i === this.current))
    updateSlideCounter(this.current)
    updateSlideTitle(this.current, this.titles)
    updateDragLines(this.current, this.total, true)
    this.onChange?.(this.categories[this.current])

    this._animate(prev, this.current, dir)
  }

  _animate(from, to, dir) {
    const currentSlide = this.slides[from]
    const currentInner = this.inner[from]
    const nextSlide    = this.slides[to]
    const nextInner    = this.inner[to]

    gsap.timeline({
      onStart: () => {
        nextSlide.classList.add('slide--current')
        gsap.set(nextSlide, { zIndex: 99 })
      },
      onComplete: () => {
        currentSlide.classList.remove('slide--current')
        gsap.set(nextSlide, { zIndex: 1 })
        isAnimating = false
        updateNavigationUI(false)

        if (pendingNavigation) {
          const p = pendingNavigation
          pendingNavigation = null
          setTimeout(() => {
            if (p.type === 'goto') this.goTo(p.index)
            else this.navigate(p.dir)
          }, 50)
        }

        if (mouseOverThumbnails && lastHoveredThumbIndex !== null) {
          currentHoveredThumb = lastHoveredThumbIndex
          updateDragLines(lastHoveredThumbIndex, this.total, true)
        }
      }
    })
    .addLabel('start', 0)
    .fromTo(nextSlide,
      { autoAlpha: 1, scale: 0.1, yPercent: dir === 1 ? 100 : -100 },
      { duration: 0.7, ease: 'expo', scale: 0.4, yPercent: 0 },
      'start'
    )
    .fromTo(nextInner,
      { filter: 'contrast(100%) saturate(100%)', transformOrigin: '100% 50%', scaleY: 4 },
      { duration: 0.7, ease: 'expo', scaleY: 1 },
      'start'
    )
    .fromTo(currentInner,
      { filter: 'contrast(100%) saturate(100%)' },
      { duration: 0.7, ease: 'expo', filter: 'contrast(120%) saturate(140%)' },
      'start'
    )
    .addLabel('middle', 'start+=0.6')
    .to(nextSlide, { duration: 1, ease: 'power4.inOut', scale: 1 }, 'middle')
    .to(currentSlide, { duration: 1, ease: 'power4.inOut', scale: 0.98, autoAlpha: 0 }, 'middle')
  }

  next() { this.navigate(NEXT) }
  prev() { this.navigate(PREV) }
}

export function initSlideshow(categories) {
  const slidesEl = document.querySelector('.slides')
  if (!slidesEl || !categories.length) return

  let currentCategory = categories[0]

  const slideshow = new Slideshow(slidesEl, categories, (cat) => {
    currentCategory = cat
    const btn = document.querySelector('#enterCategory')
    if (btn) btn.dataset.slug = cat.slug
  })

  // Thumbnails
  const thumbsContainer = document.querySelector('.slide-thumbs')
  if (thumbsContainer) {
    thumbsContainer.innerHTML = ''
    categories.forEach((cat, i) => {
      const thumb = document.createElement('div')
      thumb.className = 'slide-thumb' + (i === 0 ? ' active' : '')
      // usa a primeira imagem do ensaio como thumb — por ora placeholder
      thumb.style.backgroundImage = `url(https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_100,c_fill,q_auto,f_webp/portfolio/${cat.slug}/cover)`

      thumb.addEventListener('click', () => { lastHoveredThumbIndex = i; slideshow.goTo(i) })
      thumb.addEventListener('mouseenter', () => {
        currentHoveredThumb = i; lastHoveredThumbIndex = i; mouseOverThumbnails = true
        if (!isAnimating) updateDragLines(i, categories.length, true)
      })
      thumb.addEventListener('mouseleave', () => {
        if (currentHoveredThumb === i) currentHoveredThumb = null
      })

      thumbsContainer.appendChild(thumb)
    })
  }

  // Drag lines
  const linesContainer = document.querySelector('.lines-container')
  if (linesContainer) {
    linesContainer.innerHTML = ''
    for (let i = 0; i < 60; i++) {
      const line = document.createElement('div')
      line.className = 'drag-line'
      linesContainer.appendChild(line)
    }
  }

  // Enter button
  const enterBtn = document.querySelector('#enterCategory')
  if (enterBtn) {
    enterBtn.dataset.slug = categories[0].slug
    setTimeout(() => enterBtn.classList.add('visible'), 800)
    enterBtn.addEventListener('click', () => {
      push(`/work/${enterBtn.dataset.slug}`)
    })
  }

  // Navigation
  document.querySelector('.prev-slide')?.addEventListener('click', () => slideshow.prev())
  document.querySelector('.next-slide')?.addEventListener('click', () => slideshow.next())

  updateSlideCounter(0)
  updateDragLines(0, categories.length, true)

  // Thumbs area mouse leave
  const thumbsArea = document.querySelector('.thumbs-container')
  if (thumbsArea) {
    thumbsArea.addEventListener('mouseenter', () => { mouseOverThumbnails = true })
    thumbsArea.addEventListener('mouseleave', () => {
      mouseOverThumbnails = false
      currentHoveredThumb = null
      updateDragLines(null, categories.length)
    })
  }

  // Wheel + touch
  let touchStartY = 0
  document.addEventListener('wheel', (e) => {
    if (isAnimating) return
    e.deltaY > 0 ? slideshow.next() : slideshow.prev()
  }, { passive: true })

  document.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY }, { passive: true })
  document.addEventListener('touchend', (e) => {
    if (isAnimating) return
    const diff = e.changedTouches[0].clientY - touchStartY
    if (Math.abs(diff) > 50) diff > 0 ? slideshow.prev() : slideshow.next()
  })

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (isAnimating) return
    if (e.key === 'ArrowRight') slideshow.next()
    else if (e.key === 'ArrowLeft') slideshow.prev()
  })
}