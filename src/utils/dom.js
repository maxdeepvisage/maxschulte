// src/utils/dom.js
export function q(selector) { return document.querySelector(selector); }
export function qAll(selector) { return Array.from(document.querySelectorAll(selector)); }
