// src/components/footer.js
export function createFooter() {
  const f = document.createElement('footer');
  f.className = 'site-footer';
  f.textContent = '© maxschulte';
  return f;
}
