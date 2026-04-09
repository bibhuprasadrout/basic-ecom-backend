# basic-ecom-backend
This is the backend microservice of the toy ecommerce application I am building. This is a project to help myself learn how backend works using NodeJS.


# Auth Router APIs
POST /api/v1/signup
POST /api/v1/login
GET /api/v1/auth/profile
PATCH /api/v1/auth/profile
PATCH /api/v1/auth/password
POST /api/v1/auth/refresh // ===TODO===
POST /api/v1/auth/logout
DELETE /api/v1/auth/profile

# Product Router APIs
GET /api/v1/products with params category and pagination
GET /api/v1/products/:id
GET /api/v1/products/slug/:slug

# Category Router APIs
GET /api/v1/categories

# Cart Router APIs
GET  /api/v1/cart
POST /api/v1/cart/add
POST /api/v1/cart/update // ===TODO===
POST /api/v1/cart/remove
DELETE /api/v1/cart/:productId
DELETE /api/v1/cart

# Wishlist APIs
GET /api/v1/wishlist/all
GET /api/v1/wishlist/:wishlist
DELETE /api/v1/wishlist/:wishlistId
POST /api/v1/wishlist/:productId
DELETE /api/v1/wishlist/:productId

# Checkout Router APIs
POST /api/v1/orders
POST /api/v1/checkout/validate
POST /api/v1/checkout/payment


# User Router APIs // for admin use
GET /api/v1/user/profile
PUT /api/v1/user/profile
GET /api/v1/user/orders
GET /api/v1/user/wishlist
POST /api/v1/user/wishlist
DELETE /api/v1/user/wishlist/:id

## Overview
`basic-ecom-backend` is the Node.js + Express + MongoDB backend for the basic-ecom learning project. It exposes REST-style APIs for authentication, products, categories, cart, wishlist, and (future) checkout. The project is intentionally written in a readable, “learning-first” style with heavy in-file explanations, while still using real-world patterns like middleware pipelines, JWT auth, and centralized error handling.

## Tech stack
- **Runtime**: Node.js (CommonJS modules)
- **Web framework**: Express
- **Database**: MongoDB via Mongoose
- **Auth**: JWT stored in HTTP-only cookies (cookie-parser)
- **Utilities**: `validator`, `bcrypt`, `uuid`

## Project structure (high level)
- `src/app.js`: app bootstrap (middleware, CORS, cookie parsing, route mounting, DB startup)
- `src/config/database.js`: MongoDB connection
- `src/routes/`: Express routers (URL → middleware chain → controller)
- `src/middlewares/`: validation/sanitization/auth and request “preparation” helpers
- `src/controllers/`: request handlers (business logic + DB calls + JSON responses)
- `src/models/`: Mongoose schemas/models
- `src/utils/`: shared helpers + error handler

## Getting started
### Prerequisites
- Node.js installed
- MongoDB running (local instance or a cloud URI)

### Install
```bash
cd basic-ecom-backend
npm install
```

### Environment variables
This service reads configuration from environment variables (`process.env`). For local development you can use an env file like `.env.development`.

Common variables used by this backend:
- **`PORT`**: Port for the HTTP server (example: `5000`)
- **`NODE_ENV`**: `development` or `production`
- **`DB_CONNECTION_STRING`**: MongoDB connection string (example: `mongodb://127.0.0.1:27017/basic-ecom`)
- **`JWT_SECRET_KEY`**: Secret used to sign/verify JWT tokens

Example `.env.development`:
```bash
PORT=5000
NODE_ENV=development
DB_CONNECTION_STRING=mongodb://127.0.0.1:27017/basic-ecom
JWT_SECRET_KEY=replace_with_a_long_random_secret
```

## Running the server
### Development (recommended)
```bash
npm run dev
```
This uses nodemon and auto-restarts when files change.

### Production-like
```bash
npm start
```

## Health check
```text
GET /test
```
Returns a simple message so you can confirm the server is up.

## Authentication model (important)
This backend issues a **JWT** on successful sign-in and stores it in a **HTTP-only cookie** named `jwt`.
- Because it is **HTTP-only**, browser JavaScript cannot read it (reduces XSS token theft).
- The browser will automatically send the cookie on future API requests (depending on CORS + cookie settings).

If your frontend is on a different origin (example: `http://localhost:5173`), you must:
- Configure backend CORS with `credentials: true`
- Call axios/fetch on the frontend with `withCredentials: true`
- Ensure cookie flags (`sameSite`, `secure`, `domain`, `path`) match your environment

## API notes (actual code is source of truth)
The section above lists planned endpoints. The implemented paths are defined in `src/routes/`. If there is a mismatch between this README and the code, treat the code as authoritative and update this README.

## Error handling
This service uses a centralized Express error handler (`src/utils/errorHandlers.js`). Controllers and middleware typically call `next(err)` (or throw errors) and the error handler converts them into a consistent JSON response shape:
- `success: false`
- `status`
- `message`

## Common troubleshooting
### CORS/cookies not working in browser
Symptoms: login works in Postman but not in the browser, or cookie not set/sent.
Checklist:
- Backend CORS has `credentials: true` and an explicit `origin`
- Frontend requests include `withCredentials: true`
- In production, `secure: true` requires HTTPS
- `sameSite: "none"` requires `secure: true`

### Port already in use
If you see `EADDRINUSE`, change `PORT` or stop the other process using that port.

### Mongo connection errors
- Verify `DB_CONNECTION_STRING`
- Ensure MongoDB is running and reachable
- Check `NODE_ENV` and which `.env.*` file is being loaded

## License
ISC (as specified in `package.json`).