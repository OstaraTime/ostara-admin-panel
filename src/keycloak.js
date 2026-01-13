import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'http://ostara-rso.031268394.xyz/keycloak',
//  url: 'http://localhost:8080',
  realm: 'ostara',
  clientId: 'vite-ui',
})

export default keycloak
