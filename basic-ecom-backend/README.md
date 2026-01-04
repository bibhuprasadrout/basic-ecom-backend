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