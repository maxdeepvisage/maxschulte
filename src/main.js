import './styles/global.css'
import { initRouter } from './router.js'
import { renderNavbar } from './components/navbar.js'
import { renderFooter } from './components/footer.js'

document.body.prepend(renderNavbar())
document.body.append(renderFooter())

initRouter()