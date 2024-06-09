import { environment } from './environment';

export const DOLAR_URL: string = 'https://mercados.ambito.com';

export const routes = {
  auth: {
    login: `${environment.apiUrl}/auth/login`,
    logout: `${environment.apiUrl}/auth/logout`,
    register: `${environment.apiUrl}/auth/register`,
    authenticated: `${environment.apiUrl}/auth/authenticated`,
    user: `${environment.apiUrl}/auth/user`,
  },
  currency: {
    mep: `${DOLAR_URL}/dolarrava/mep/variacion`,
    cripto: `${DOLAR_URL}/dolarcripto/variacion`,
    informal: `${DOLAR_URL}/dolar/informal/variacion`,
  },
  account: {
    all: `${environment.apiUrl}/account`,
    create: `${environment.apiUrl}/account`,
    byId: (id: string) => `${environment.apiUrl}/account/${id}`,
    setFavorite: (id: string) => `${environment.apiUrl}/account/fav/${id}`,
  },
  scopes: {
    all: `${environment.apiUrl}/scopes`,
    byId: (id: string) => `${environment.apiUrl}/scopes/${id}`,
  },
};
