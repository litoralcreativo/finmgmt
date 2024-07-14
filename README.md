# FINK - Financial Track System

FINK is a financial tracking system for managing account balances, budgets, and more. This application provides tools for managing accounts, transactions, calendar, and financial goals, offering a comprehensive view of personal or business finances.

## Technologies Used

- **Frontend:** Angular 18
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Infrastructure:** Docker, Nginx

## Features

- **Account Management:** Creation and tracking of multiple financial accounts.
- **Transactions:** Detailed recording of income and expenses, with advanced categorization and filtering.
- **Calendar:** Visualization and management of important financial events.
- **Financial Goals:** Definition and tracking of financial objectives.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation and Configuration

Follow these steps to set up and run the project in your local environment.

### Clone the Repository

```bash
git clone https://github.com/litoralcreativo/finmgmt.git
cd finmgmt
```

### Project Structure

The project has the following directory structure:

```graphql
finmgmt/
├── database/         # Database initialization files
├── finkapp/          # Angular Application (frontend)
├── server/           # Node.js API with Express (backend)
├── docker-compose.yml
└── README.md
```

### Environment Configuration

Create a .env file in the server directory with the following content:

```env
PORT=3000
CORS_ORIGINS=http://localhost:4200
MONGODB_URI=mongodb://mongo:27017/finmgmt
DB_NAME=finmgmt
```

### Start the Project with Docker

Make sure Docker is running and follow these steps:

1. Build and start the containers:

```bash
docker-compose up --build
```

2. Access the application:
   - Frontend: http://localhost:4200
   - Backend: http://localhost:3000

### Contributions

Contributions are welcome! If you have any ideas or improvements, feel free to open an issue or a pull request.

### License

This project is licensed under the MIT License. For more details, see the LICENSE file.

### Contact

For any inquiries, you can contact us at litoralcreatives@example.com.

Thank you for using FINK!
