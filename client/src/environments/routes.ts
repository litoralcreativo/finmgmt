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
    transactions: (id: string, query?: string) =>
      `${environment.apiUrl}/account/${id}/transactions${
        query ? '?' + query : ''
      }`,
    setFavorite: (id: string) => `${environment.apiUrl}/account/fav/${id}`,
    amount: (id: string) => `${environment.apiUrl}/account/${id}/amount`,
    categoriesAmount: (id: string) =>
      `${environment.apiUrl}/account/${id}/categories`,
    balance: (id: string, days: number) =>
      `${environment.apiUrl}/account/${id}/balance?days=${days}`,
  },
  scopes: {
    all: `${environment.apiUrl}/scopes`,
    byId: (id: string) => `${environment.apiUrl}/scopes/${id}`,
    create: `${environment.apiUrl}/scopes`,
    categoriesAmount: (id: string) =>
      `${environment.apiUrl}/scopes/${id}/categories`,
    createCategory: (id: string) =>
      `${environment.apiUrl}/scopes/${id}/category`,
    updateCategory: (scopeId: string, catName: string) =>
      `${environment.apiUrl}/scopes/${scopeId}/category/${catName}`,
  },
  transactions: {
    all: `${environment.apiUrl}/transaction`,
    byId: (id: string) => `${environment.apiUrl}/transaction/${id}`,
    create: `${environment.apiUrl}/transaction`,
    update: (id: string) => `${environment.apiUrl}/transaction/${id}`,
    delete: (id: string) => `${environment.apiUrl}/transaction/${id}`,
  },
};
