# AssetFlow

AssetFlow is an asset and resource management system for tracking employees, departments, assets, bookings, allocations, maintenance work, audits, notifications, and transfers. The project is split into a React frontend and an Express/MongoDB backend.

## Overview

The repository contains two applications:

- `client/`: Vite + React frontend
- `server/`: Express API with MongoDB, authentication, file handling, email, and admin workflows

## Features

- User authentication and role-based access
- Department and employee management
- Asset categories and asset lifecycle tracking
- Asset allocation and transfer requests
- Booking workflow for bookable resources
- Maintenance requests and maintenance history
- Audit cycles and audit items
- Notifications and activity logging
- Seed script for populating a demo database

## Tech Stack

- Frontend: React, Vite, React Router, React Query, Tailwind CSS, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- Utilities: JWT, bcryptjs, Cloudinary, Nodemailer, Multer, QR code generation

## Project Structure

```text
assetflow/
  client/   # Frontend app
  server/   # Backend API
```

Key backend folders:

- `server/config/`: database, Cloudinary, and email configuration
- `server/controllers/`: request handlers
- `server/middlewares/`: auth, validation, uploads, and error handling
- `server/models/`: Mongoose models
- `server/routes/`: API route modules
- `server/services/`: business logic helpers
- `server/utils/`: shared utilities

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd assetflow
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### Client

Create a `client/.env` file with the frontend API base URL.

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Project

### Start the backend

```bash
cd server
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Start the frontend

```bash
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Seed Data

The backend includes a seed script that clears the database and inserts demo data.

```bash
cd server
npm run seed
```

Important: the seed script expects `MONGODB_URI` to be set in `server/.env`.

## Available Scripts

### Server

- `npm run start`: start the API in production mode
- `npm run dev`: start the API with Nodemon
- `npm run seed`: populate the database with sample data
- `npm run lint`: run ESLint

### Client

- `npm run dev`: start the Vite development server
- `npm run build`: build the frontend for production
- `npm run preview`: preview the production build locally

## API Endpoints

The API is mounted under `/api` and includes routes for:

- Authentication
- Admin operations
- Users
- Departments
- Employees
- Asset categories
- Assets
- Allocations
- Transfers
- Bookings
- Maintenance
- Audits
- Notifications
- Dashboard data

Health check:

```bash
GET /api/health
```
## i am working on it since morning and by mistakenly i had commited the credentials so i was deleted the all commits you seen in my history and that why there is only one commit is present.
