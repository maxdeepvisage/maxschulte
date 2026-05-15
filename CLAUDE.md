# INSTRUÇÕES PARA DESENVOLVIMENTO — maxschulte Portfolio

**Última atualização**: 15 de maio de 2026  
**Versão da documentação**: 1.2  
**Metodologia**: Specification-Driven Development (SDD)

---

## 📋 CONTEXTO GERAL

Este é um **portfolio minimalista de fotografia profissional** em vanilla JavaScript + Vite + Cloudflare Stack.

**Tech Stack**:
- **Frontend**: Vanilla JS (ES6+), CSS puro, GSAP (animações)
- **Backend**: Cloudflare Workers (serverless)
- **Mídia**: Cloudinary (storage + transformações)
- **DB**: Cloudflare KV (configurações)
- **Hosting**: Cloudflare Pages (estático)

**Referência completa**: Ler `SDD-portfolio-fotografo-v1.2.md`

---

## 🔴 BUGS CRÍTICOS A RESOLVER

### 1. SEGURANÇA: Credenciais Expostas em `wrangler.toml`

**Status**: 🔴 CRÍTICO

As credenciais do Cloudinary estão visíveis no arquivo:

```toml
# ❌ ERRADO — não deixar aqui!
[vars]
CLOUDINARY_CLOUD_NAME = "dxwnh6a6r"
CLOUDINARY_API_KEY = "655195788474775"
CLOUDINARY_API_SECRET = "aLm8nBhot-lcwTWe87m_R-nNHoo"
```

**Ação necessária HOJE**:
1. Revogar essas credenciais no Cloudinary (console.cloudinary.com)
2. Gerar novas chaves
3. Remover do `wrangler.toml`
4. Guardar no `.env` local (não versionado)
5. Para Cloudflare KV secrets, usar `wrangler secret put` na CLI

**Referência**: Ler `RELATORIO_BUGS_E_STATUS.md` seção 2.1

---

### 2. API BUG: Cobertura de Categoria em Caminho Errado

**Status**: 🔴 CRÍTICO

**Arquivo**: `workers/api/index.js` linhas 25 e 42

**Problema**:
```javascript
// ❌ ERRADO — busca em caminho inexistente
cover: `portfolio/${f.name}/cover`,

// Exemplo gerado: portfolio/casamentos/cover
// Mas a estrutura real é: portfolio/casamentos/ana-e-pedro/thumb.jpg
```

**Impacto**: Home não consegue carregar capas das categorias.

**Solução**: Precisa confirmar qual é a estratégia para encontrar a capa:
- Opção A: Usar tag `featured` (conforme SDD §3)
- Opção B: Procurar arquivo `cover.jpg` ou `cover.png` em cada subcategoria
- Opção C: Usar primeira imagem com tag específica

**Referência**: Ler `RELATORIO_BUGS_E_STATUS.md` seção 2.2 e SDD §3

---

### 3. ROTAS INCONSISTENTES: SDD vs Implementação

**Status**: 🟡 IMPORTANTE

**Discrepância**:
- **SDD (§6)** especifica: `/categorias`, `/categorias/:cat`, `/categorias/:cat/:ensaio`
- **router.js implementa**: `/work`, `/work/:cat`, `/work/:cat/:ensaio`

**Decisão necessária**: Qual usar?

**Recomendação**: Manter `/work` (mais conciso), atualizar router.js e SDD para serem consistentes.

**Afetados**:
- `router.js` linhas 14-16
- `home.js` linha 190 (navegação do botão)
- Qualquer link que referencia categorias

**Referência**: Ler `RELATORIO_BUGS_E_STATUS.md` seção 2.3

---

## ⚙️ ARQUITETURA DO PROJETO

### Estrutura de Pastas (Conforme SDD)

```
src/
├── main.js              ← entry point, carrega router + navbar + footer
├── router.js            ← SPA routing (matchRoute, push, initRouter)
├── styles/
│   ├── reset.css        ← CSS reset
│   ├── variables.css    ← Design tokens (cores, fontes, espaços)
│   ├── global.css       ← Reset + base
│   ├── animations.css   ← Transições, fadeins
│   ├── hero.css         ← Hero slideshow styles
│   ├── navbar.css       ← Navbar styles
│   └── footer.css       ← Footer styles
├── pages/
│   ├── home.js          ← Hero slideshow (hero section + preview)
│   ├── categories.js    ← Grid de categorias
│   ├── ensaios.js       ← Grid de ensaios em categoria
│   ├── galeria.js       ← Grid masonry + lightbox
│   ├── videos.js        ← Grid de vídeos YouTube
│   ├── about.js         ← Bio + foto do fotógrafo
│   ├── contact.js       ← WhatsApp + email + Instagram
│   ├── admin-login.js   ← Tela de login
│   ├── admin-dashboard.js ← Painel admin
│   └── legal.js         ← Privacy + Terms
├── components/
│   ├── navbar.js        ← Header com navegação
│   ├── footer.js        ← Rodapé
│   ├── slideshow.js     ← GSAP slideshow (class Slideshow + initSlideshow)
│   ├── lightbox.js      ← Modal de visualização de fotos
│   └── loader.js        ← Spinner de carregamento
├── services/
│   ├── cloudinary.js    ← Fetch de dados Cloudinary (getCategories, getEnsaios, getPhotos)
│   ├── auth.js          ← JWT (read/write em sessionStorage)
│   └── config.js        ← GET/POST configurações KV (WhatsApp, About, etc)
└── utils/
    ├── dom.js           ← Helpers: qs(), qsa(), on(), off()
    ├── youtube.js       ← Extrai ID de URL, gera thumb
    └── lazyload.js      ← IntersectionObserver para lazy load

workers/api/
├── index.js             ← Router de endpoints (GET /api/categories, :cat, :cat/:ensaio)
├── admin-login.js       ← POST /api/admin/login (verificar senha, retornar JWT)
├── cloudinary-delete.js ← POST /api/cloudinary/delete (autenticado)
├── cloudinary-update.js ← POST /api/cloudinary/update (tags, order, autenticado)
└── config.js            ← GET/POST /api/config (KV)
```

### Fluxo de Dados

1. **Frontend fetch** → `src/services/cloudinary.js` (apiFetch) → `workers/api/index.js`
2. **Worker processa** → faz autenticação com Cloudinary → retorna JSON
3. **Frontend renderiza** → page component recebe dados, gera HTML
4. **Router atualiza** → replaceState, limpa app div, renderiza nova página

### Convenções

- **Nomes de função**: camelCase (renderHome, getCategories, initSlideshow)
- **Nomes de classe**: PascalCase (Slideshow, ApiError)
- **Nomes de constante**: UPPER_SNAKE_CASE (CLOUD_NAME, API_URL, TRANSFORMS)
- **Variáveis de ambiente**: VITE_ (frontend), sem prefixo (backend)

---

## 📝 GUIA DE IMPLEMENTAÇÃO

### Fase 1: Setup (70% completo)

- [x] Repositório Git + Vite
- [x] Estrutura de pastas
- [x] Variáveis de ambiente (fix security)
- [x] Design tokens CSS
- [x] Roteador SPA
- [ ] Deploy testado

**Próximo**: Resolver bugs críticos acima, depois testar deploy.

---

### Fase 2: Hero Slideshow (60% completo)

**Arquivo**: `src/components/slideshow.js`

- [x] Classe `Slideshow` com GSAP
- [x] Métodos: navigate, goTo, _animate
- [x] UI: counters, titles, thumbnails
- [x] Eventos: wheel, touch, keyboard, click
- [ ] Responsivo mobile (testar)
- [ ] Performance (lazy load slides?)

**O que adicionar**:
- Testar responsividade em mobile
- Possivelmente adicionar `prefers-reduced-motion` para acessibilidade

---

### Fase 3: Navegação de Conteúdo (0% completo)

Esta é a fase onde você empacou. Implementar por ordem:

#### 3.1. Página `/work/:cat` — Grid de Ensaios

**Arquivo**: `src/pages/ensaios.js`

```javascript
export async function renderEnsaios(params = {}) {
  const { cat } = params
  
  // 1. Fetch ensaios dessa categoria
  const ensaios = await getEnsaios(cat)
  
  // 2. Montar grid de cards
  // Cada card: 
  //   - Capa (fetch a foto com tag 'cover' dentro da pasta do ensaio)
  //   - Nome do ensaio
  //   - Número de fotos
  //   - Hover: scale + overlay
  //   - Click: navega para /work/:cat/:ensaio
  
  // 3. Retornar HTML
  return `<div class="grid">
    ${ensaios.map(e => `
      <div class="card">
        <img src="${imageUrl(e.cover, 'thumb')}" alt="${e.name}">
        <h3>${e.name}</h3>
        <p>${e.count} fotos</p>
      </div>
    `).join('')}
  </div>`
}
```

**Passos**:
1. Copiar estrutura de `categories.js`
2. Buscar ensaios via `getEnsaios(cat)`
3. Montar grid com CSS Grid ou Flexbox
4. Adicionar hover effects (CSS `transition` + `:hover`)

---

#### 3.2. Página `/work/:cat/:ensaio` — Galeria Masonry

**Arquivo**: `src/pages/galeria.js`

```javascript
export async function renderGaleria(params = {}) {
  const { cat, ensaio } = params
  
  // 1. Fetch fotos
  const photos = await getPhotos(cat, ensaio)
  
  // 2. Filtrar fotos com tag 'hidden'
  const visible = photos.filter(p => !p.tags.includes('hidden'))
  
  // 3. Grid masonry (CSS Columns ou CSS Grid com auto-fit)
  // 4. Lazy load com IntersectionObserver
  // 5. Click em foto → abre lightbox
  
  return `<div class="masonry">
    ${visible.map(p => `
      <img src="${imageUrl(p.publicId, 'grid')}"
           srcset="${imageUrl(p.publicId, 'lqip')}"
           data-photo="${p.publicId}"
           loading="lazy"
           alt="">
    `).join('')}
  </div>`
}
```

**Passos**:
1. Grid CSS (column count ou grid with auto-fit)
2. Lazy load: adicionar `data-photo` e usar IntersectionObserver
3. Click handler: abrir lightbox
4. Lightbox: implementar modal com prev/next, teclado, swipe

---

#### 3.3. Lightbox (Componente Compartilhado)

**Arquivo**: `src/components/lightbox.js`

```javascript
export function initLightbox(photoElements, photos) {
  // 1. Ao clicar em foto, abrir modal
  // 2. Mostrar foto grande + descrição
  // 3. Navegação: prev/next via botões + teclado + swipe
  // 4. ESC para fechar
  // 5. Backdrop blur (CSS)
}
```

---

### Fase 4: Páginas Secundárias (0% completo)

Implementar em paralelo:

#### 4.1. `/videos` — Grid de Vídeos YouTube

**Arquivo**: `src/pages/videos.js`

- Fetch da lista de vídeos (KV config)
- Para cada vídeo: extrair ID da URL, gerar thumb, título
- Grid com hover → abre modal com iframe
- Usar `utils/youtube.js` para extração

#### 4.2. `/about` — Bio do Fotógrafo

**Arquivo**: `src/pages/about.js`

- Foto grande do fotógrafo (Cloudinary)
- Texto editável (fetch do KV via `/api/config`)
- CTA para contato
- Layout editorial (2-column ou full-width com imagem grande)

#### 4.3. `/contact` — Contato

**Arquivo**: `src/pages/contact.js`

- Formulário: nome + mensagem
- Submeter pré-preenchido no WhatsApp via `wa.me/`
- Links: email, Instagram
- WhatsApp número configurável (KV)

---

### Fase 5: Admin (0% completo)

#### 5.1. Login

**Arquivo**: `src/pages/admin-login.js` + `workers/api/admin-login.js`

```javascript
// frontend:
async function handleLogin(password) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password })
  })
  const { token } = await res.json()
  sessionStorage.setItem('jwt', token)
  push('/admin/dashboard')
}

// worker:
// POST /api/admin/login
// 1. Receber { password }
// 2. Hash password com bcrypt (ou comparar com env var)
// 3. Gerar JWT com secret
// 4. Retornar { token }
```

#### 5.2. Dashboard

**Arquivo**: `src/pages/admin-dashboard.js`

- Listar categorias + ensaios (árvore Cloudinary)
- Cada ensaio: buttons para
  - Definir capa (escolher foto com tag 'cover')
  - Ocultar fotos (adicionar tag 'hidden')
  - Deletar fotos (POST `/api/cloudinary/delete`)
  - Reordenar (drag & drop → salva `order` em context)
- Upload de fotos (direct to Cloudinary ou via Worker?)
- Adicionar vídeos (URL YouTube → salva em KV)
- Editar About (textarea → POST `/api/config`)
- Configurar WhatsApp (número + mensagem → KV)

---

### Fase 6: Polish (0% completo)

- [ ] SEO: meta tags dinâmicas por página
- [ ] Sitemap.xml estático
- [ ] robots.txt (bloqueia `/admin`)
- [ ] Lighthouse audit
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Performance: Network throttling, image optimization
- [ ] Accessibility: WCAG 2.1 AA

---

## 🔐 SEGURANÇA

**Princípios**:
1. API Secret **nunca** no cliente — sempre via Worker
2. JWT em sessionStorage (expira ao fechar o browser)
3. Delete/Update requer confirmação modal
4. Rate limiting em login (opcional, mas recomendado)
5. CORS aberto apenas para `/api/` (verificar depois)

**Checklist**:
- [ ] Credenciais em variáveis de ambiente (não versionadas)
- [ ] API Secret em Cloudflare KV secrets
- [ ] JWT verificado em cada endpoint protegido
- [ ] Delete exige confirmação
- [ ] Rate limiting em endpoints sensíveis

---

## 📊 CLOUDINARY — Estrutura & Estratégia

### Estrutura (conforme SDD §3)

```
portfolio/
├── casamentos/
│   ├── ana-e-pedro/
│   │   ├── cover.jpg (ou tag 'cover')
│   │   ├── foto-01.jpg
│   │   ├── foto-02.jpg
│   └── julia-e-marcos/
│       └── ...
├── retratos/
└── moda/
```

### Tags & Context

- **cover**: imagem de capa do ensaio
- **featured**: imagem destaque de categoria (opcional)
- **hidden**: não exibir ao público
- **Context order**: ordem personalizada dentro do ensaio
- **Context display_name**: nome legível (usar se slug for feia)

### Transformações Cloudinary (SDD §8)

```javascript
const TRANSFORMS = {
  thumb:    'w_600,h_400,c_fill,q_auto,f_webp',      // Cards
  grid:     'w_800,q_auto,f_webp',                    // Galeria
  lightbox: 'w_1920,q_auto,f_webp',                   // Grande
  hero:     'w_1920,q_auto:best,f_webp',              // Hero
  lqip:     'w_50,q_10,f_webp',                       // Placeholder
}
```

---

## 🌐 ROTEAMENTO

**Rotas implementadas**:

```javascript
const routes = [
  { path: '/',                    render: renderHome },           // Hero
  { path: '/work',                render: renderCategories },     // Grid categorias
  { path: '/work/:cat',           render: renderEnsaios },       // Grid ensaios
  { path: '/work/:cat/:ensaio',   render: renderGaleria },       // Galeria
  { path: '/videos',              render: renderVideos },        // Vídeos
  { path: '/about',               render: renderAbout },         // Bio
  { path: '/contact',             render: renderContact },       // Contato
  { path: '/admin',               render: renderAdminLogin },    // Login
  { path: '/admin/dashboard',     render: renderAdminDashboard }, // Painel
  { path: '/privacy',             render: () => renderLegal('privacy') },
  { path: '/terms',               render: () => renderLegal('terms') },
]
```

**Proteção**:
- `/admin/dashboard` redireciona para `/admin` se sem JWT

---

## 🎨 DESIGN SYSTEM

### Cores (CSS Variables)

```css
:root {
  --color-bg:           #0a0a0a;         /* Preto profundo */
  --color-bg-secondary: #111111;         /* Preto secundário */
  --color-text:         #f0f0f0;         /* Branco soft */
  --color-text-muted:   rgba(240, 240, 240, 0.5);
  --color-accent:       #c8a96e;         /* Dourado editorial */
  --color-accent-hover: #d4b87a;
  --color-border:       rgba(255, 255, 255, 0.08);
  --color-error:        #e05252;
}
```

### Tipografia

```css
--font-display: 'TheGoodMonolith', monospace;  /* Títulos */
--font-body:    'Inter', sans-serif;            /* Corpo */

--font-size-hero: clamp(2.5rem, 6vw, 5rem);    /* Responsivo */
--font-size-3xl:  3rem;
--font-size-2xl:  2rem;
--font-size-xl:   1.5rem;
```

### Espaçamentos

```css
--space-xs:      0.5rem;
--space-sm:      1rem;
--space-md:      1.5rem;
--space-lg:      2rem;
--space-xl:      3rem;
--space-2xl:     5rem;
--space-section: clamp(4rem, 8vw, 8rem);  /* Responsivo */
```

---

## 📚 DEPENDÊNCIAS

### NPM Packages

```json
{
  "devDependencies": {
    "vite": "^8.0.12",
    "wrangler": "^4.92.0"
  },
  "dependencies": {
    "gsap": "^3.15.0"
  }
}
```

**Sem frameworks, sem pré-processadores CSS** — vanilla tech stack.

### Serviços Externos

| Serviço | Free Tier | Uso |
|---------|-----------|-----|
| Cloudinary | 25GB | Mídia |
| Cloudflare Pages | ∞ | Hosting |
| Cloudflare Workers | 100k req/dia | API |
| Cloudflare KV | ∞ | Configurações |

---

## 🚀 COMO DESENVOLVER LOCALMENTE

### 1. Setup Inicial

```bash
# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env

# Edit .env with real credentials
nano .env
```

### 2. Desenvolvimento

```bash
# Terminal 1: Vite dev server (http://localhost:5173)
npm run dev

# Terminal 2: Wrangler local (http://localhost:8787)
wrangler dev
```

### 3. Build

```bash
npm run build
```

### 4. Deploy

```bash
# Frontend → Cloudflare Pages (auto via Git)
git push

# Workers → Manual (ou auto via wrangler.toml)
wrangler deploy
```

---

## 🐛 DEBUGGING

### Inspeccionar API Responses

```javascript
async function apiFetch(path) {
  const res = await fetch(`${API_URL}${path}`)
  console.log('Response:', res, await res.json())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
```

### Inspecionar Cloudinary

```javascript
// No console:
// 1. Abrir CloudinaryAPI docs (api.cloudinary.com)
// 2. Testar requests de forma manual
// 3. Verificar structure real de pastas/tags
```

### Network Tab

- DevTools → Network
- Inspecionar requisições para `/api/categories`
- Verificar payload, status codes, CORS headers

---

## ✅ CHECKLIST ANTES DE DEPLOY

- [ ] Credenciais seguras (não em wrangler.toml)
- [ ] Bugs críticos resolvidos (cobertura, rotas)
- [ ] Todas as páginas implementadas (ou redirecionar 404)
- [ ] Lightbox funcional
- [ ] Mobile responsivo
- [ ] Performance: Lighthouse > 80
- [ ] SEO: meta tags dinâmicas
- [ ] Admin protegido (JWT verificado)
- [ ] CORS configurado corretamente
- [ ] Domínio customizado + SSL

---

## 📞 CONTATO & SUPORTE

**Documentação**: Ler `SDD-portfolio-fotografo-v1.2.md` para referência completa  
**Status atual**: Ler `RELATORIO_BUGS_E_STATUS.md` para checklist de bloqueadores  
**Bugs**: Abrir issue ou contatar desenvolvedor

---

**Última revisão**: 15 de maio de 2026  
Pronto para começar com Claude Chat — copie estas instruções + relatório para continuidade.
