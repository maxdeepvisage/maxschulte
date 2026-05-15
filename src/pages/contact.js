import { push } from '../router.js'

const WHATSAPP = '353000000000' // placeholder
const EMAIL    = 'hello@maxschulte.com' // placeholder
const INSTAGRAM = 'maxwaschulte' // placeholder

export async function renderContact(params = {}) {
  return `
    <div class="contact-page">

      <div class="contact-hero">
        <p class="contact-label">Contact</p>
        <h1 class="contact-title">Let's make<br>something<br>together.</h1>
        <p class="contact-sub">
          Whether it's a portrait session, an event, a documentary,
          or something you haven't quite put into words yet —
          reach out. Every project starts with a conversation.
        </p>
      </div>

      <div class="contact-actions">
        <a class="contact-primary"
           href="https://wa.me/${WHATSAPP}?text=Hi%20Max%2C%20I%27d%20like%20to%20discuss%20a%20project"
           target="_blank" rel="noopener">
          Start a conversation ↗
        </a>

        <div class="contact-secondary">
          <a href="mailto:${EMAIL}" class="contact-link">
            <span class="contact-link__label">Email</span>
            <span class="contact-link__value">${EMAIL}</span>
          </a>
          <a href="https://instagram.com/${INSTAGRAM}"
             target="_blank" rel="noopener" class="contact-link">
            <span class="contact-link__label">Instagram</span>
            <span class="contact-link__value">@${INSTAGRAM}</span>
          </a>
        </div>
      </div>

      <div class="contact-footer-line">
        Based in Dublin, available worldwide.
      </div>

    </div>
  `
}