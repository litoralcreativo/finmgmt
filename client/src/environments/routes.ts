import { environment } from './environment';

export const routes = {
  auth: {
    login: `${environment.apiUrl}/auth/login`,
    logout: `${environment.apiUrl}/auth/logout`,
    register: `${environment.apiUrl}/auth/register`,
    authenticated: `${environment.apiUrl}/auth/authenticated`,
    user: `${environment.apiUrl}/auth/user`,
  },
};
