# Employee Monitoring System

This repository contains the complete Employee Monitoring System with separate admin and employee frontends and a backend server.

## Project Structure

- `admin-emp/` - Root workspace directory
  - `server.js` - Backend server with Node.js, Express, MongoDB, and Socket.IO
  - `admin-frontend/` - Admin and TL frontend built with Vue.js and Tailwind CSS
  - `employee-frontend/` - Employee frontend built with Vue.js and Tailwind CSS

## Prerequisites

- Node.js (v16 or higher recommended)
- MongoDB (running locally or accessible remotely)
- npm or yarn package manager

## Setup Instructions

### Backend Server

1. Navigate to the root workspace:
   ```
   cd admin-emp
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure MongoDB connection string in `.env` file or update `server.js`:
   ```
   MONGO_URI=mongodb://localhost:27017/employee_monitoring
   ```
4. Start the backend server:
   ```
   npm start
   ```
   The server will run on `http://localhost:3000`.

### Admin Frontend

1. Navigate to the admin frontend directory:
   ```
   cd admin-emp/admin-frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the admin frontend:
   ```
   npm run serve
   ```
4. Access the admin panel at `http://localhost:8080`.

### Employee Frontend

1. Navigate to the employee frontend directory:
   ```
   cd admin-emp/employee-frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the employee frontend:
   ```
   npm run serve
   ```
4. Access the employee dashboard at `http://localhost:8081`.

## Usage

- Use the login pages to authenticate as Admin, Team Leader (TL), or Employee.
- Admins can view all TLs, employees, activities, and app installation notifications.
- TLs can view their team members, activities, and receive notifications.
- Employees can view their own activity dashboard.
- Real-time updates are provided via WebSocket (Socket.IO).

## Troubleshooting

- Ensure MongoDB is running and accessible.
- Verify backend server is running before starting frontends.
- Update API URLs in frontend code if backend server is hosted on a different IP or port.
- Check browser console for errors and network requests.

## Contact

For support or questions, please contact the project maintainer.
