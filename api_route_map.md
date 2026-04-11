# Complete API Route Map (Postman Testing Guide)

This guide organizes all API endpoints logically, specifying methods, URLs, required middlewares, and sample JSON payloads based on your validation schemas. 

> [!NOTE]
> **Authentication Key**:
> - 🟢 **Public**: No token required.
> - 🟡 **Optional Auth**: Can be accessed as a Guest or with a Bearer Token.
> - 🔴 **Auth Required**: Requires `Authorization: Bearer <token>` in headers.
> - 🟣 **Admin/Seller Only**: Requires Auth + specific roles.

---

## 1. Authentication (`/api/v1/auth`)
*These routes handle user registration, verification, and session management.*

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **POST** | `/api/v1/auth/register` | 🟢 Public | `validate(schemas.auth.register)` |
| **GET** | `/api/v1/auth/verify-email/:token` | 🟢 Public | None |
| **POST** | `/api/v1/auth/login` | 🟢 Public | `validate(schemas.auth.login)` |
| **POST** | `/api/v1/auth/logout` | 🔴 Auth Req | `verifyJWT` |
| **POST** | `/api/v1/auth/refresh-token` | 🟢 Public | None |

**Sample Payloads:**
```json
// POST /register
{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "username": "johndoe123",
  "password": "SecurePassword123!",
  "phoneNumber": "01000000000",
  "role": "Customer"
}

// POST /login
{
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```

---

## 2. User Profile & Management (`/api/v1/users`)
*Handle profile data, wishlists, and Admin user management.*

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **GET** | `/api/v1/users/profile` | 🔴 Auth Req | `verifyJWT` |
| **PATCH** | `/api/v1/users/update-profile` | 🔴 Auth Req | `verifyJWT`, `validate(schemas.user.updateProfile)` |
| **POST** | `/api/v1/users/address` | 🔴 Auth Req | `verifyJWT`, `validate(schemas.user.address)` |
| **GET** | `/api/v1/users/wishlist` | 🔴 Auth Req | `verifyJWT` |
| **POST** | `/api/v1/users/wishlist/:productId` | 🔴 Auth Req | `verifyJWT` |
| **GET** | `/api/v1/users/admin/all-users` | 🟣 Admin | `verifyJWT`, `authorizeRoles("Admin")` |
| **PATCH** | `/api/v1/users/admin/status/:userId` | 🟣 Admin | `verifyJWT`, `authorizeRoles("Admin")` |

> [!TIP]
> **Dependency**: For the **Wishlist** route, you need a `productId` which you can get by calling the **Get All Products** route first.
> For **Admin Status Update**, you need a `userId` from the **Get All Users** route.

**Sample Payloads:**
```json
// PATCH /update-profile
{
  "fullName": "John Updated",
  "phoneNumber": "01111111111"
}

// POST /address
{
  "addressLine1": "123 Main St",
  "city": "Cairo",
  "state": "Cairo",
  "postalCode": "11511",
  "country": "Egypt",
  "isDefault": true
}

// PATCH /admin/status/:userId
{
  "isRestricted": true,
  "restrictionReason": "Spamming",
  "isDeleted": false
}
```

---

## 3. Categories (`/api/v1/categories`)

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **GET** | `/api/v1/categories` | 🟢 Public | None |
| **POST** | `/api/v1/categories` | 🟣 Admin | `verifyJWT`, `authorizeRoles("Admin")`, `validate(schemas.category.add)` |
| **PATCH** | `/api/v1/categories/:id` | 🟣 Admin | `verifyJWT`, `authorizeRoles("Admin")`, `validate(schemas.category.update)` |
| **DELETE** | `/api/v1/categories/:id` | 🟣 Admin | `verifyJWT`, `authorizeRoles("Admin")` |

**Sample Payloads:**
```json
// POST /categories
{
  "name": "Electronics",
  "description": "Electronic gadgets and devices"
}
```

---

## 4. Products (`/api/v1/products`)

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **GET** | `/api/v1/products` | 🟢 Public | None |
| **GET** | `/api/v1/products/:id` | 🟢 Public | None |
| **POST** | `/api/v1/products` | 🟣 Admin/Seller | `verifyJWT`, `authorizeRoles("Admin", "Seller")`, `validate(schemas.product.create)` |
| **PUT** | `/api/v1/products/:id` | 🟣 Admin/Seller | `verifyJWT`, `authorizeRoles("Admin", "Seller")`, `validate(schemas.product.update)` |
| **DELETE**| `/api/v1/products/:id` | 🟣 Admin/Seller | `verifyJWT`, `authorizeRoles("Admin", "Seller")` |

> [!TIP]
> **Dependency**: To create a Product, you MUST provide a valid `categoryId` inside the `category` field obtained from the Categories route.

**Sample Payloads:**
```json
// POST /products
{
  "name": "Smartphone Pro",
  "description": "Latest smartphone with amazing features.",
  "price": 999.99,
  "stock": 50,
  "category": "INSERT_CATEGORY_ID_HERE"
}
```

---

## 5. Reviews (`/api/v1/reviews/:productId`)

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **GET** | `/api/v1/reviews/:productId` | 🟢 Public | None |
| **POST** | `/api/v1/reviews/:productId` | 🔴 Auth Req | `verifyJWT`, `validate(schemas.review.add)` |
| **PATCH** | `/api/v1/reviews/:productId/:reviewId`| 🔴 Auth Req | `verifyJWT`, `validate(schemas.review.update)` |
| **DELETE**| `/api/v1/reviews/:productId/:reviewId`| 🔴 Auth Req | `verifyJWT` |

**Sample Payloads:**
```json
// POST /reviews/:productId
{
  "rating": 5,
  "comment": "Excellent product!"
}
```

---

## 6. Cart (`/api/v1/cart`)
*Relies on `optionalAuth`. Guests can use it via session/cookies, logged-in users use their Token.*

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **GET** | `/api/v1/cart` | 🟡 Optional | `optionalAuth` |
| **DELETE** | `/api/v1/cart` | 🟡 Optional | `optionalAuth` |
| **POST** | `/api/v1/cart/items` | 🟡 Optional | `optionalAuth`, `validate(schemas.cart.addItem)` |
| **PATCH** | `/api/v1/cart/items/:productId` | 🟡 Optional | `optionalAuth`, `validate(schemas.cart.updateItem)` |
| **DELETE**| `/api/v1/cart/items/:productId` | 🟡 Optional | `optionalAuth` |

> [!TIP]
> **Dependency**: You need a `productId` from the Products route to add or update items in the cart.

**Sample Payloads:**
```json
// POST /cart/items
{
  "productId": "INSERT_PRODUCT_ID_HERE",
  "quantity": 2
}

// PATCH /cart/items/:productId
{
  "quantity": 3
}
```

---

## 7. Orders (`/api/v1/orders`)

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **POST** | `/api/v1/orders` | 🟡 Optional | `optionalAuth`, `validate(schemas.order.place)` |
| **GET** | `/api/v1/orders/history` | 🔴 Auth Req | `verifyJWT` |
| **GET** | `/api/v1/orders/:id` | 🟡 Optional | `optionalAuth` |
| **PATCH** | `/api/v1/orders/:id/cancel`| 🔴 Auth Req | `verifyJWT` |
| **PATCH** | `/api/v1/orders/:id/status`| 🟣 Admin | `authorizeRoles("Admin")`, `validate(schemas.order.updateStatus)` |

> [!IMPORTANT]
> **Guest Checkout Dependency**: If you are testing `POST /orders` without a Bearer Token (as a guest), you **MUST** include `guestEmail` in the payload.

**Sample Payloads:**
```json
// POST /orders (Direct Purchase - Without Cart)
{
  "fromCart": false,
  "guestEmail": "guest@example.com", 
  "guestName": "Jane Doe",
  "items": [
    {
      "productId": "INSERT_PRODUCT_ID_HERE",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "addressLine1": "123 Nile St",
    "city": "Cairo",
    "state": "Cairo",
    "postalCode": "11511",
    "country": "Egypt"
  }
}

// POST /orders (From Existing Cart)
{
  "fromCart": true,
  "guestEmail": "guest@example.com",
  "shippingAddress": {
    "addressLine1": "123 Main St",
    "city": "Alexandria",
    "state": "Alexandria",
    "postalCode": "21511",
    "country": "Egypt"
  }
}

// PATCH /orders/:id/status (Admin)
{
  "status": "Shipped"
}
```

---

## 8. Payment (`/api/payment`)

| Method | Endpoint | Auth | Middlewares |
|--------|----------|------|-------------|
| **POST** | `/api/payment/create-checkout-session`| 🟡 Optional | `optionalAuth` |
| **POST** | `/api/payment/webhook` | 🟢 Public | None (Handled by Stripe) |

> [!TIP]
> **Dependency**: You need the `orderId` generated from `POST /api/v1/orders` to create a checkout session.

**Sample Payloads:**
```json
// POST /payment/create-checkout-session
{
  "orderId": "INSERT_ORDER_ID_HERE"
}
```
