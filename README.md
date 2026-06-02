# Inventory & Order Management System

React frontend + Flask backend + PostgreSQL. Manage products, customers, orders and inventory.

## Live Links

| Service              | URL                                                        |
| -------------------- | ---------------------------------------------------------- |
| Frontend             | https://ims-navy-delta.vercel.app                          |
| Backend API          | https://ims-o15p.onrender.com                              |
| Health check         | https://ims-o15p.onrender.com/api                          |
| Docker Hub (backend) | https://hub.docker.com/r/sagarsharma3013/inventory-backend |

## Tech Stack

React, Flask, PostgreSQL, Docker, Docker Compose

## Run Locally

### Docker Compose

```bash
copy .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api

Stop: `docker compose down`

### Normal (Without Docker)

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

Backend: http://localhost:8000

Set in `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Set in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

## API Endpoints

Base URL: `http://localhost:8000` | Live: `https://ims-o15p.onrender.com`

| Method | Endpoint | Description  |
| ------ | -------- | ------------ |
| GET    | /api     | Health check |

### Products

| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| POST   | /products        | Create product     |
| GET    | /products        | Get all products   |
| GET    | /products/{id}   | Get product by id  |
| PUT    | /products/{id}   | Update product     |
| DELETE | /products/{id}   | Delete product     |

### Customers

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| POST   | /customers        | Create customer     |
| GET    | /customers        | Get all customers   |
| GET    | /customers/{id}   | Get customer by id  |
| DELETE | /customers/{id}   | Delete customer     |

### Orders

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | /orders        | Create order        |
| GET    | /orders        | Get all orders      |
| GET    | /orders/{id}   | Get order by id     |
| DELETE | /orders/{id}   | Cancel/delete order |

### Dashboard

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | /dashboard/summary  | Dashboard summary |

## Author

Sagar Sharma — https://github.com/Sagarsharma12345/ims
