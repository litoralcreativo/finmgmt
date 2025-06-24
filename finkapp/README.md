# Fink Frontend

Fink is the frontend application for the FINK Financial Track System. Built with Angular, it provides a modern, responsive interface for managing accounts, transactions, financial goals, and more.

---

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Authentication](#authentication)
- [Development](#development)
- [Linting, Formatting, and Code Style](#linting-formatting-and-code-style)
- [Production Build & Deployment](#production-build--deployment)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features
- Responsive UI for desktop and mobile
- Account and transaction management
- Financial goals and calendar integration
- Data visualization (charts, graphs)
- JWT-based authentication
- Modular, maintainable Angular architecture

## Technologies Used
- **Angular 18**
- **Angular Material** (UI components)
- **RxJS** (reactive programming)
- **SCSS** (styling)
- **Docker** (for containerized deployment)

## Project Structure
```
finkapp/
├── src/
│   ├── app/                # Main application code
│   │   ├── accounts/       # Account-related modules/components
│   │   ├── calendar/       # Calendar features
│   │   ├── dashboard/      # Dashboard and analytics
│   │   ├── home/           # Home/landing page
│   │   ├── scopes/         # Financial scopes/goals
│   │   ├── settings/       # User settings
│   │   ├── shared/         # Shared modules, components, services
│   │   └── shell/          # App shell, navigation, layout
│   ├── environments/       # Environment configs
│   └── styles/             # Global and theme styles
├── angular.json            # Angular CLI config
├── package.json            # Project dependencies
└── ...
```

## Environment Configuration
- The frontend is configured to connect to the backend at `http://localhost:3000` by default.
- If you need to change the API endpoint, update the relevant environment files in `src/environments/`.

## Authentication
This frontend uses JWT authentication. After a successful login, the backend returns a JWT in the response body. The frontend must store this token (e.g., in memory or local storage) and include it in the `Authorization: Bearer <token>` header for all protected API requests.

### Handling JWT in Angular
- Store the JWT securely (preferably in memory or a secure storage solution).
- Use an Angular HTTP interceptor to automatically add the `Authorization` header with the Bearer token to outgoing requests to protected endpoints.
- On logout, remove the token from storage.

#### Example: Angular HTTP Interceptor
```typescript
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt'); // Or use a service
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }
}
```

## Development
### Start the Development Server
```bash
ng serve
```
Navigate to [http://localhost:4200/](http://localhost:4200/). The app will reload automatically on code changes.

### Code Scaffolding
Generate a new component, directive, etc.:
```bash
ng generate component component-name
```

## Linting, Formatting, and Code Style
- Lint the code:
  ```bash
  ng lint
  ```
- Follow Angular and project-specific style guides.
- Use Prettier/ESLint if configured.

## Production Build & Deployment
- Build the project for production:
  ```bash
  ng build --configuration production
  ```
- The output will be in the `dist/` directory. Deploy as static files or use Docker for containerized deployment.

## Running Unit Tests
```bash
ng test
```
Runs unit tests via [Karma](https://karma-runner.github.io).

## Running End-to-End Tests
```bash
ng e2e
```
Executes end-to-end tests. You may need to add a package for e2e testing.

## Troubleshooting & FAQ
- **API errors:** Ensure the backend is running and CORS is configured.
- **JWT issues:** Check token storage and HTTP interceptor setup.
- **Port conflicts:** Make sure nothing else is running on port 4200.
- **Styling issues:** Ensure SCSS is compiled and Angular Material is installed.

## Contributing
Contributions are welcome! Please open an issue or pull request for suggestions or improvements.

## License
This project is licensed under the MIT License.

## Contact
For inquiries, contact us at litoralcreatives@example.com.
