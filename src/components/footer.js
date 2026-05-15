export function renderFooter() {
  const footer = document.createElement('footer')
  footer.className = 'footer'

  footer.innerHTML = `
    <div class="footer__inner">
      <span class="footer__name">Max Schulte</span>
      <div class="footer__links">
        <a data-link="/privacy">Privacy</a>
        <a data-link="/terms">Terms</a>
      </div>
      <span class="footer__copy">© ${new Date().getFullYear()}</span>
    </div>
  `

  return footer
}