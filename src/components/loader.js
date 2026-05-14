// src/components/loader.js
export function Loader() {
  const el = document.createElement('div');
  el.className = 'loader';
  el.textContent = 'Loading...';
  return el;
}
