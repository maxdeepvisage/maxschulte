# SDD — Portfolio Fotógrafo
**Software Design Document v1.2**
*Metodologia: Specification-Driven Development (SDD)*

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Descrição
Site de portfolio para fotógrafo profissional. Foco em apresentação visual premium, dark editorial. Sem e-commerce. Contato via WhatsApp. Gestão de mídia via Cloudinary com painel admin embutido no site.

### 1.2 Objetivos
- Apresentar o trabalho do fotógrafo de forma visualmente impactante
- Permitir que o fotógrafo gerencie álbuns e fotos sem depender de desenvolvedor
- Exibir vídeos do YouTube integrados ao site
- Facilitar contato via WhatsApp
- Performance excelente (fotos pesadas = otimização obrigatória)

### 1.3 Público-alvo
- **Visitantes**: clientes potenciais, agências, marcas
- **Admin**: o próprio fotógrafo (interface simples, sem curva de aprendizado)

---

## 2. STACK TECNOLÓGICA

### 2.1 Frontend
- **Linguagem**: Vanilla JavaScript (ES6+)
- **Bundler**: Vite (dev server + build)
- **Estilo**: CSS puro com Custom Properties
- **Animações**: GSAP (slideshow + transições)
- **Roteamento**: History API (SPA simples)

### 2.2 Backend / Serviços
- **Mídia**: Cloudinary (storage, transformações, API)
- **Vídeos**: YouTube embed via `<iframe>` — sem API key. O admin cola a URL, o site extrai o ID e gera o embed automaticamente
- **Contato**: WhatsApp link direto `wa.me/` — sem backend
- **Auth Admin**: JWT simples, senha hash em variável de ambiente do Worker
- **Hosting**: Cloudflare Pages (estático) + Cloudflare Workers (serverless para operações com chave secreta) + Cloudflare KV (configurações do admin)

### 2.3 Por que Cloudflare
- **Pages**: deploy automático via Git, CDN global, free tier generoso
- **Workers**: serverless no edge, cold start quase zero, 100k requests/dia free
- **KV**: key-value store para configurações do admin (WhatsApp, texto About, ordem dos álbuns) — sem banco de dados
- **Tudo numa plataforma**: DNS, SSL, CDN, serverless e storage sem fragmentação

### 2.4 Workers — Rotas da API
```
POST  /api/admin/login          → verifica senha, devolve JWT
POST  /api/cloudinary/delete    → deleta imagem (autenticado)
POST  /api/cloudinary/update    → atualiza tags/metadados (autenticado)
GET   /api/config               → lê configurações do KV
POST  /api/config               → salva configurações no KV (autenticado)
```

---

## 3. ESTRUTURA DO CLOUDINARY

A hierarquia reflete a navegação do site: Pasta principal → Categorias → Ensaios.

```
portfolio/                        ← pasta raiz do fotógrafo
├── casamentos/                   ← categoria
│   ├── ana-e-pedro/              ← ensaio (slug: "ana-e-pedro")
│   │   ├── thumb.jpg             ← imagem de capa do ensaio (tag: cover)
│   │   ├── foto-01.jpg
│   │   └── foto-02.jpg
│   └── julia-e-marcos/
│       ├── thumb.jpg
│       └── ...
├── retratos/
│   ├── ensaio-beatriz/
│   └── ensaio-carlos/
├── moda/
│   └── editorial-vogue/
└── urbano/
    └── sp-centro/
```

**Metadados usados:**
- `cover` — foto de capa do ensaio (thumb exibido na listagem)
- `hidden` — foto oculta do público
- `featured` — destaque na home
- Context `order=1` — ordem personalizada dentro do ensaio
- Context `display_name=Nome Legível` — nome de exibição de categoria ou ensaio

---

## 4. ESTRUTURA DE PASTAS DO PROJETO

Simples. Cada pasta tem o que precisa — sem sub-pastas desnecessárias.

```
portfolio-fotografo/
├── index.html
├── vite.config.js
├── package.json
├── wrangler.toml
├── .env                     # nunca commitar
├── .env.example
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── og-image.jpg
├── src/
│   ├── main.js              # entry point
│   ├── router.js            # SPA routing
│   ├── styles/
│   │   ├── reset.css
│   │   ├── variables.css    # design tokens
│   │   ├── global.css
│   │   └── animations.css
│   ├── pages/
│   │   ├── home.js
│   │   ├── categories.js    # /categorias — grid de categorias
│   │   ├── ensaios.js       # /categorias/:cat — ensaios da categoria
│   │   ├── galeria.js       # /categorias/:cat/:ensaio — fotos do ensaio
│   │   ├── videos.js
│   │   ├── about.js
│   │   ├── contact.js
│   │   ├── admin-login.js
│   │   ├── admin-dashboard.js
│   │   └── legal.js         # privacidade + termos
│   ├── components/
│   │   ├── navbar.js
│   │   ├── footer.js
│   │   ├── slideshow.js     # hero da home
│   │   ├── lightbox.js      # visualização de fotos
│   │   └── loader.js
│   ├── services/
│   │   ├── cloudinary.js    # leitura da API Cloudinary (client-side)
│   │   ├── auth.js          # JWT via sessionStorage
│   │   └── config.js        # lê/salva configurações via Worker
│   └── utils/
│       ├── dom.js           # qs(), qsa(), on(), off()
│       ├── youtube.js       # extrai ID de URL, gera embed/thumb
│       └── lazyload.js      # IntersectionObserver
└── workers/
    └── api/
        ├── admin-login.js
        ├── cloudinary-delete.js
        ├── cloudinary-update.js
        └── config.js
```

> **Princípio:** cada arquivo faz uma coisa. CSS junto com JS só quando fizer sentido. Sem pastas por componente — nessa escala é overhead.

---

## 5. PÁGINAS E FUNCIONALIDADES

### 5.1 Home (`/`)
**Seções:**
1. **Hero Slideshow** — categorias como slides (retratos, casamentos, moda…). Baseado no código de referência com GSAP. Clique navega para a categoria.
2. **Prévia das categorias** — grid horizontal com 4–6 cards.
3. **Preview de vídeos** — 2–3 vídeos em destaque.
4. **CTA de Contato** — botão WhatsApp fixo + seção ao final da página.

### 5.2 Categorias (`/categorias`)
Grid de cards — uma categoria por card.
- Capa: primeira foto com tag `featured` da categoria, ou a mais recente
- Nome da categoria + quantidade de ensaios
- Hover: zoom leve + overlay

### 5.3 Ensaios da Categoria (`/categorias/:cat`)
Grid de cards — um ensaio por card.
- Capa: foto com tag `cover` dentro da pasta do ensaio
- Nome do ensaio
- Hover: zoom + overlay

> Esta é a tela intermediária. O visitante vê os thumbs dos ensaios antes de entrar em um.

### 5.4 Galeria do Ensaio (`/categorias/:cat/:ensaio`)
Grid masonry responsivo com todas as fotos do ensaio.
- Lazy load com IntersectionObserver
- Fotos com tag `hidden` são ignoradas
- Clique → abre Lightbox (prev/next, teclado, swipe, ESC)

### 5.5 Vídeos (`/videos`)
Grid de thumbnails.
- Thumbnail gerada a partir do ID do YouTube (`img.youtube.com/vi/{id}/hqdefault.jpg`)
- Título do vídeo (salvo junto com a URL no KV)
- Clique → modal com iframe embed
- Admin cola a URL, o site extrai o ID e a thumbnail automaticamente

### 5.6 Sobre (`/about`)
- Foto do fotógrafo (grande, editorial)
- Texto de apresentação (editável pelo admin via KV)
- CTA para contato

### 5.7 Contato (`/contact`)
- Botão WhatsApp (número configurável pelo admin)
- Link de email
- Link do Instagram
- Formulário opcional: nome + mensagem → abre WhatsApp com texto pré-preenchido

### 5.8 Admin (`/admin`)

**Login:** senha única verificada via Worker. JWT em `sessionStorage` — expira ao fechar o browser.

**Dashboard:**

| Ação | Detalhes |
|---|---|
| Listar categorias e ensaios | Árvore Cloudinary |
| Criar ensaio | Cria subpasta dentro da categoria |
| Definir capa do ensaio | Adiciona tag `cover` à foto escolhida |
| Ocultar foto | Adiciona tag `hidden` |
| Reordenar fotos | Drag and drop → salva `order` no context do Cloudinary |
| Deletar foto | Via Worker (nunca expõe o API Secret) |
| Upload de fotos | Upload direto para pasta do ensaio |
| Adicionar vídeo | Cola URL do YouTube → salvo no KV |
| Editar sobre | Textarea → salvo no KV |
| Configurar WhatsApp | Número + mensagem padrão → KV |

---

## 6. ROTEAMENTO

```javascript
const routes = {
  '/':                          'home',
  '/categorias':                'categories',
  '/categorias/:cat':           'ensaios',
  '/categorias/:cat/:ensaio':   'galeria',
  '/videos':                    'videos',
  '/about':                     'about',
  '/contact':                   'contact',
  '/admin':                     'admin-login',
  '/admin/dashboard':           'admin-dashboard',
  '/privacidade':               'legal',
  '/termos':                    'legal',
  '404':                        'not-found'
}
```

- `history.pushState()` para navegação sem reload
- `popstate` para botão voltar
- Scroll para o topo a cada troca de página
- Redirect `/admin/dashboard` → `/admin` se não autenticado

---

## 7. DESIGN SYSTEM

### 7.1 Cores
```css
:root {
  --color-bg:           #0a0a0a;
  --color-bg-secondary: #111111;
  --color-bg-overlay:   rgba(0, 0, 0, 0.7);
  --color-text:         #f0f0f0;
  --color-text-muted:   rgba(240, 240, 240, 0.5);
  --color-accent:       #c8a96e;       /* dourado editorial */
  --color-accent-hover: #d4b87a;
  --color-border:       rgba(255, 255, 255, 0.08);
  --color-error:        #e05252;
}
```

### 7.2 Tipografia
```css
:root {
  --font-display: 'TheGoodMonolith', monospace;  /* títulos, hero */
  --font-body:    'Inter', sans-serif;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.25rem;
  --font-size-xl:   1.5rem;
  --font-size-2xl:  2rem;
  --font-size-3xl:  3rem;
  --font-size-hero: clamp(2.5rem, 6vw, 5rem);
}
```

### 7.3 Espaçamentos
```css
:root {
  --space-xs:      0.5rem;
  --space-sm:      1rem;
  --space-md:      1.5rem;
  --space-lg:      2rem;
  --space-xl:      3rem;
  --space-2xl:     5rem;
  --space-section: clamp(4rem, 8vw, 8rem);
}
```

### 7.4 Animações
- Transição de página: fade 300ms
- Hover em cards: `scale(1.02)` + overlay fade
- Slideshow: GSAP com easing expo/power4
- Lightbox: slide lateral + backdrop blur
- Loader: spinner minimalista + fade out

---

## 8. PERFORMANCE

- **Imagens**: sempre via URL Cloudinary com transformações (WebP, qualidade auto, tamanho certo para cada contexto)
- **Lazy load**: IntersectionObserver em todos os grids de fotos
- **LQIP**: placeholder blur via Cloudinary (`w_50,q_10,f_webp`) antes da imagem real carregar
- **JS**: import dinâmico por página — só carrega o que a rota precisa
- **CSS**: sem preprocessador, sem framework — puro e direto

**URLs de transformação Cloudinary:**
```
Thumb de ensaio:    w_600,h_400,c_fill,q_auto,f_webp
Galeria (grid):     w_800,q_auto,f_webp
Lightbox:           w_1920,q_auto,f_webp
Hero slideshow:     w_1920,q_auto:best,f_webp
LQIP:               w_50,q_10,f_webp
```

---

## 9. VARIÁVEIS DE AMBIENTE

```env
# .env (nunca commitar)

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret     # somente no Worker

# Admin
ADMIN_PASSWORD_HASH=bcrypt_hash_da_senha
JWT_SECRET=string_aleatoria_longa

# WhatsApp (default, sobrescrito pelo KV depois)
VITE_WHATSAPP_NUMBER=5511999999999
```

---

## 10. SEGURANÇA

- API Secret do Cloudinary **nunca** exposto no cliente — todas as operações de escrita passam pelo Worker
- JWT verificado pelo Worker antes de qualquer operação destrutiva
- Operações de delete exigem confirmação modal no admin
- Rate limiting no endpoint de login (máx 5 tentativas / 15 min)
- Rotas `/admin/dashboard` redirecionam para login se sem JWT válido

---

## 11. SEO

- Meta tags dinâmicas por página (título, description, og:image)
- `robots.txt` — bloqueia `/admin`
- `sitemap.xml` estático com páginas principais
- Schema.org `Photographer` em JSON-LD na home

---

## 12. ETAPAS DE DESENVOLVIMENTO

### Fase 1 — Setup (Dia 1)
- [ ] Repositório Git + Vite
- [ ] Estrutura de pastas
- [ ] Variáveis de ambiente
- [ ] Design tokens CSS
- [ ] Roteador SPA básico
- [ ] Deploy inicial no Cloudflare Pages

### Fase 2 — Hero Slideshow (Dia 2–3)
- [ ] Portar código de referência para `slideshow.js`
- [ ] Integrar com Cloudinary (buscar categorias reais)
- [ ] Cada slide = uma categoria
- [ ] Clique navega para `/categorias/:cat`
- [ ] Responsivo mobile

### Fase 3 — Navegação de Conteúdo (Dia 3–6)
- [ ] Página `/categorias` — grid de categorias
- [ ] Página `/categorias/:cat` — grid de ensaios com thumbs
- [ ] Página `/categorias/:cat/:ensaio` — galeria masonry
- [ ] Lazy load + LQIP
- [ ] Lightbox (prev/next, teclado, swipe, ESC)

### Fase 4 — Páginas Secundárias (Dia 6–8)
- [ ] Vídeos (grid com embeds YouTube)
- [ ] About (texto editável via KV)
- [ ] Contato (WhatsApp)
- [ ] Navbar + Footer
- [ ] Páginas legais

### Fase 5 — Admin (Dia 8–11)
- [ ] Workers: login, delete, update, config
- [ ] Tela de login
- [ ] Dashboard: listar árvore Cloudinary
- [ ] Upload, definir capa, ocultar, deletar
- [ ] Reordenar fotos (drag and drop)
- [ ] Adicionar vídeos via URL
- [ ] Editar About e WhatsApp

### Fase 6 — Polish e Launch (Dia 11–13)
- [ ] SEO (meta tags, sitemap, robots.txt)
- [ ] Lighthouse audit
- [ ] Testes mobile (iOS Safari, Android Chrome)
- [ ] Domínio customizado no Cloudflare
- [ ] Deploy final

---

## 13. FORA DO ESCOPO (v1)

- Pagamentos / checkout
- Formulário de email com backend
- Blog
- Área privada do cliente
- Publicar/despublicar álbum inteiro
- Multi-idioma
- PWA

---

## 14. DEPENDÊNCIAS

| Serviço | Uso | Custo |
|---|---|---|
| Cloudinary | Storage + API de imagens | Free (25GB) |
| Cloudflare Pages | Hosting estático + CDN | Free |
| Cloudflare Workers | Serverless (operações seguras) | Free (100k req/dia) |
| Cloudflare KV | Configurações do admin | Free |
| GSAP | Animações | Free (licença padrão) |

---

*SDD v1.2 — Maio 2026*
