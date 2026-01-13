import ReactDOM from 'react-dom/client'
import App from './App'
import keycloak from './keycloak'
import './index.css'

keycloak
  .init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (!authenticated) {
      window.location.reload()
      return
    }

    ReactDOM.createRoot(document.getElementById('root')).render(
      <App />
    )
  })
  .catch((error) => {
    console.error('Keycloak init failed', error)
  })
