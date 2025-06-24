# FINK - Financial Track System

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

FINK is a comprehensive financial tracking system designed to help individuals and businesses manage account balances, budgets, transactions, and financial goals. It provides a unified platform for tracking finances, visualizing trends, and planning for the future.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation and Configuration](#installation-and-configuration)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Contributions](#contributions)
- [License](#license)
- [Contact](#contact)

---

## Features
- **Account Management:** Create and track multiple financial accounts.
- **Transactions:** Record income and expenses with advanced categorization and filtering.
- **Calendar:** Visualize and manage important financial events.
- **Financial Goals:** Define and track financial objectives.
- **Responsive UI:** Modern Angular frontend for desktop and mobile.
- **API-first:** RESTful backend with Swagger documentation.

## Architecture
```
[ Angular (finkapp) ] <--> [ Node.js/Express (server) ] <--> [ MongoDB (database) ]
```
- **Frontend:** Angular SPA served via Nginx (in production)
- **Backend:** Node.js/Express REST API
- **Database:** MongoDB (Dockerized)
- **Infrastructure:** Docker Compose for orchestration

## Technologies Used
- **Frontend:** Angular 18
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Infrastructure:** Docker, Nginx

## Project Structure
```
finmgmt/
├── database/         # Database initialization files
├── finkapp/          # Angular Application (frontend)
├── server/           # Node.js API with Express (backend)
├── docker-compose.yml
└── README.md
```

## Environment Variables
Create a `.env` file in the `server/` directory with the following variables:

| Variable         | Description                                 | Example                        |
|------------------|---------------------------------------------|--------------------------------|
| PORT             | Backend server port                         | 3000                           |
| CORS_ORIGINS     | Allowed frontend origins (comma-separated)  | http://localhost:4200          |
| MONGODB_URI      | MongoDB connection string                   | mongodb://mongo:27017/finmgmt  |
| DB_NAME          | MongoDB database name                       | finmgmt                        |

## Installation and Configuration
### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Clone the Repository
```bash
git clone https://github.com/litoralcreativo/finmgmt.git
cd finmgmt
```

### Start the Project with Docker
1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
2. Access the application:
   - Frontend: http://localhost:4200
   - Backend: http://localhost:3000

## Running Tests
- **Frontend:**
  - Navigate to `finkapp/` and run `ng test` for unit tests.
- **Backend:**
  - Navigate to `server/` and run `npm test` (if tests are available).

## API Documentation
- The backend exposes Swagger documentation at: `http://localhost:3000/api/docs`

## Troubleshooting & FAQ
- **Docker container fails to start:** Ensure no other service is using ports 3000 or 4200.
- **MongoDB connection error:** Check your `.env` file and ensure Docker is running.
- **Frontend not loading:** Make sure the backend is running and CORS is configured correctly.
- **Where are logs?**
  - Backend logs are visible in the Docker container output.
  - Frontend errors appear in the browser console.

## Contributions
Contributions are welcome! Please open an issue or pull request for suggestions or improvements.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For inquiries, contact us at litoralcreatives@example.com.

Thank you for using FINK!
