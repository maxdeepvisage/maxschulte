import gsap from 'gsap'
import { push } from '../router.js'
import { imageUrl } from '../services/cloudinary.js'

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
      thumb.style.backgroundImage = `url(${imageUrl(cat.cover, 'thumb')})`

      thumb.addEventListener('click', () => { lastHoveredThumbIndex = i; slideshow.goTo(i) })
      thumb.addEventListener('mouseenter', () => {
        currentHoveredThumb = i; lastHoveredThumbIndex = i; mouseOverThumbnails = true
      })
      thumb.addEventListener('mouseleave', () => {
        if (currentHoveredThumb === i) currentHoveredThumb = null
      })

      thumbsContainer.appendChild(thumb)
    })
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

  // Thumbs area mouse leave
  const thumbsArea = document.querySelector('.thumbs-container')
  if (thumbsArea) {
    thumbsArea.addEventListener('mouseenter', () => { mouseOverThumbnails = true })
    thumbsArea.addEventListener('mouseleave', () => {
      mouseOverThumbnails = false
      currentHoveredThumb = null
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