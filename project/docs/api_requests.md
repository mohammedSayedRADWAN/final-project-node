# API Request Examples (Postman/cURL)

Base URL: `http://localhost:8000/api/v1`

## 1. Authentication

### Register User
**POST** `/auth/register`
```json
{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "username": "johndoe123",
    "password": "StrongPassword123!",
    "phoneNumber": "+1234567890",
    "role": "Customer"
}
```
*(After successful registration, an email will be sent with a verification token)*

### Verify Email
**GET** `/auth/verify-email/:token`
(Example: `/auth/verify-email/7df9a...`)

### Login User
**POST** `/auth/login`
```json
{
    "email": "john.doe@example.com",
    "password": "StrongPassword123!"
}
```

### Refresh Token
**POST** `/auth/refresh-token`
(Send `refreshToken` in cookies or body)

---

## 2. User Profile

### Get Profile
**GET** `/users/profile`
(Header: `Authorization: Bearer <accessToken>`)

### Update Address
**POST** `/users/address`
```json
{
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true
}
```

---

## 3. Wishlist

### Toggle Product in Wishlist
**POST** `/users/wishlist/:productId`

### Get Wishlist
**GET** `/users/wishlist`

---

## 4. Reviews

### Add Review
**POST** `/reviews/:productId`
*(Requires auth)*
```json
{
    "rating": 5,
    "comment": "Excellent product, highly recommended!"
}
```

### Get Product Reviews
**GET** `/reviews/:productId`
*(Public, supports query params for pagination)*
`GET /reviews/:productId?page=1&limit=10`

### Update Review
**PATCH** `/reviews/:productId/:reviewId`
*(Requires auth, only review owner can update)*
```json
{
    "rating": 4,
    "comment": "Updated: Still good, but noticed some minor issues."
}
```

### Delete Review
**DELETE** `/reviews/:reviewId`
*(Requires auth, only review owner can delete)*

---

## 5. Shopping cart

Each logged-in user has **one cart** stored in MongoDB (`Cart` collection). Use these routes to add lines, change quantities, remove lines, then checkout with `fromCart: true` (see Orders).

### Get cart (with product details)
**GET** `/cart`
*(Requires auth)*

Returns the cart document: `items[]` with populated `productId` (name, price, stock, images, category).

### Add to cart
**POST** `/cart/items`
*(Requires auth)*

Adds `quantity` to an existing line for that product, or creates a new line.

```json
{
    "productId": "65f1a...",
    "quantity": 2
}
```

### Set quantity for a line
**PATCH** `/cart/items/:productId`
*(Requires auth)*

Sets the line quantity to an absolute value (must be ≥ 1). To remove a product, use DELETE below.

```json
{
    "quantity": 3
}
```

### Remove one product from cart
**DELETE** `/cart/items/:productId`
*(Requires auth)*

### Clear entire cart
**DELETE** `/cart`
*(Requires auth)*

---

## 6. Orders

### Place order (explicit items)
**POST** `/orders`
*(Requires auth)*

Send line items and **shipping address** only. **Shipping is a fixed fee** set in code: `SHIPPING_FEE` in `project/config/shipping.js` (default **50**). The response includes **`subtotal`**, **`shipping`**, and **`totalAmount`** (`subtotal + shipping`).

```json
{
  "fromCart": true,
  "shippingAddress": {
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  }
}
```

### Place order from saved cart
**POST** `/orders`
*(Requires auth)*

Uses the current server cart as line items, then **clears the cart** after a successful order. Same constant **shipping** fee as above.

```json
{
    "fromCart": true,
    "shippingAddress": {
        "addressLine1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA"
    }
}
```

*(Do not send `items` when using `fromCart: true`; the controller ignores them for checkout.)*

### Get Order History
**GET** `/orders/history`
*(Requires auth)*

### Get Order Details
**GET** `/orders/:id`
*(Requires auth)*

### Cancel Order
**PATCH** `/orders/:id/cancel`
*(Requires auth, only if status is "Pending")*

### Update Order Status
**PATCH** `/orders/:id/status`
*(Requires auth & Admin role)*
```json
{
    "status": "Shipped"
}
```
---

## 7. Products

### Get All Products
**GET** `/products?search=smart&category=ID&minPrice=100&maxPrice=500&page=1&limit=10`
*(Public, supports search, filtering, and pagination)*

### Categories

#### Add Category (Admin only)
**POST** `/categories`
```json
{
    "name": "Electronics",
    "description": "Smartphones, Laptops, and gadgets"
}
```

#### Get All Categories (Public)
**GET** `/categories`

---

### Create Product
**POST** `/products`
*(Requires auth & Admin/Seller role)*
```json
{
    "name": "Smartphone Pro Max",
    "description": "The ultimate smartphone with a stunning display and powerful camera.",
    "price": 999.99,
    "stock": 50,
    "category": "CATEGORY_ID_HERE",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

### Update Product
**PUT** `/products/:id`
*(Requires auth & Admin/Seller role)*
```json
{
    "price": 899.99,
    "stock": 45
}
```

### Delete Product
**DELETE** `/products/:id`
*(Requires auth & Admin/Seller role)*
