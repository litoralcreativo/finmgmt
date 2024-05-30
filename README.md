# Financial Management System (FinMGMT)

This project allows the management of financial transactions and accounting balances for an individual or a group of people. It is built using the MEAN stack, comprising a backend, a frontend, and a database.

## Technologies Used

- **Database:** MongoDB
- **Backend:** Express
- **Frontend:** Angular
- **UI Framework:** Angular Material

## Features

- **Financial Transactions Management:** Track and manage your financial transactions easily.
- **Accounting Balance:** Keep track of your accounting balances.
- **User Authentication:** Secure authentication using Passport's local strategy.
- **Session Management:** Sessions are managed with cookies.
- **API Documentation:** API documentation is available via Swagger.

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- Node.js
- npm (Node Package Manager)
- MongoDB

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/financial-management-system.git
   cd financial-management-system
   ```

2. **Backend Setup:**
   Open a terminal and navigate to the backend directory and install the dependencies:

   ```sh
   cd backend
   npm install
   ```

   Create a .env file in the backend directory and add your environment variables:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/financialdb
   SESSION_SECRET=your_secret_key
   ```

   Start the backend server:

   ```sh
   npm start
   ```

3. **Frontend Setup:**
   Open a terminal and navigate to the frontend directory and install the dependencies:

   ```sh
   cd ..
   cd frontend
   npm install
   ```

   Start the frontend server:

   ```sh
   ng serve
   ```

4. **Access the Application:**
   Open your browser and navigate to http://localhost:4200 to access the frontend.
   The backend API is available at http://localhost:3000.

## API Documentation

API documentation is available via Swagger. Once the backend server is running, you can access the documentation at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Authentication

The project uses Passport's local strategy for authentication. Sessions are managed with cookies to ensure secure access to the system.

## Contributing

We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
