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
    transactions: (id: string) =>
      `${environment.apiUrl}/account/${id}/transactions`,
    setFavorite: (id: string) => `${environment.apiUrl}/account/fav/${id}`,
    amount: (id: string) => `${environment.apiUrl}/account/${id}/amount`,
  },
  scopes: {
    all: `${environment.apiUrl}/scopes`,
    byId: (id: string) => `${environment.apiUrl}/scopes/${id}`,
  },
  transactions: {
    all: `${environment.apiUrl}/transaction`,
    create: `${environment.apiUrl}/transaction`,
    byId: (id: string) => `${environment.apiUrl}/transaction/${id}`,
  },
};
