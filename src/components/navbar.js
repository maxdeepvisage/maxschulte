// src/components/navbar.js
export function createNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.textContent = 'Navbar';
  return nav;
}
