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

## 5. Orders

### Place Order
**POST** `/orders`
*(Requires auth)*
```json
{
    "items": [
        {
            "productId": "65f1a...",
            "quantity": 2
        }
    ],
    "shippingAddress": {
        "addressLine1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA"
    }
}
```

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

## 6. Products

### Get All Products
**GET** `/products`
*(Public)*

### Get Product by ID
**GET** `/products/:id`
*(Public)*

### Create Product
**POST** `/products`
*(Requires auth & Admin/Seller role)*
```json
{
    "name": "Smartphone Pro Max",
    "description": "The ultimate smartphone with a stunning display and powerful camera.",
    "price": 999.99,
    "stock": 50,
    "category": "Electronics",
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
