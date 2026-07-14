# ShopLite Backend REST API Reference

The ShopLite backend is built using Node.js, Express.js, and MongoDB (via Mongoose ODM). It handles user authentication, product catalogs, shopping order submissions, coupon validation, contact forms, and Stripe payment processor integrations (including webhook tracking).

* **Base URL**: `http://localhost:5000/api`
* **Content-Type**: `application/json` (except for Stripe webhooks which require `application/json` parsed as a raw buffer)

---

## 🔒 Authentication & Route Authorization

The backend secures endpoints using JSON Web Tokens (JWT) and role checks. Clients must send the JWT token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token_here>
```

### Authentication Middlewares

Located in [auth.js](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/src/middleware/auth.js):
1. **`protect`**: Validates the JWT in the Authorization header. Decodes the token, fetches the user from the database (excluding password), and attaches it to `req.user`. Returns `401 Unauthorized` if validation fails.
2. **`authorize(...roles)`**: Restricts access to users holding specific roles (e.g., `Admin`). Runs after `protect`. Returns `403 Forbidden` if user does not match required role.
3. **`optionalProtect`**: Attempts to decode the JWT if present but allows the request to pass as a guest (`req.user` remains undefined) if no token is provided. Used for endpoints supporting guest operations (e.g., guest checkouts).

---

## 🗄️ Database Schemas (Mongoose Models)

All database models reside in the [models/](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/src/models/) directory.

### 1. User Schema ([User.js](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/src/models/User.js))
Represents platform members.
* `name` (String, required): Full name.
* `email` (String, required, unique): Contact and login email.
* `password` (String, required): Bcyrpt-hashed password string.
* `role` (String, enum: `['Customer', 'Seller', 'Admin']`, default: `'Customer'`).
* `phone` (String, optional): Mobile phone number.
* `address` (String, optional): Standard billing/shipping address.
* `isRestricted` (Boolean, default: `false`): Restricts active user privileges.
* `isApproved` (Boolean, default: `true`): Signifies approval status.
* `isDeleted` (Boolean, default: `false`): Used for soft deleting records.

### 2. Product Schema ([Product.js](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/src/models/Product.js))
Represents inventory items.
* `title` / `name` (String, required): Item identifier.
* `description` (String, required): Details and specifications.
* `price` (Number, required): Current sale price.
* `originalPrice` (Number, optional): Pre-discount price.
* `discountPercentage` (Number, default: `0`).
* `rating` (Number, default: `0`): Average calculated customer rating.
* `stock` (Number, required, default: `0`).
* `brand` (String): Brand/Manufacturer name.
* `category` (ObjectId, ref: `'Category'`, required).
* `seller` (ObjectId, ref: `'User'`, optional).
* `image` / `thumbnail` (String): Cover image URL.
* `images` (Array of Strings): Additional gallery image URLs.
* `availabilityStatus` (String, default: `'In Stock'`).
* `sku` (String): Stock Keeping Unit.
* `tags` (Array of Strings).
* `sales` (Number, default: `0`): Accumulator tracking total sales.
* `isFeatured` (Boolean, default: `false`): Appears on featured list.
* `isOnSale` (Boolean, default: `false`): Appears on discount list.
* `reviews` (Array of sub-documents):
  * `user` (ObjectId, ref: `'User'`)
  * `rating` (Number, 1 to 5)
  * `comment` (String)
  * `date` (Date)
  * `reviewerName` (String)
  * `reviewerEmail` (String)

### 3. Category Schema ([Category.js](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/src/models/Category.js))
Used to classify products.
* `name` (String, required, unique).
* `image` (String): Reference banner/thumbnail URL.
* `description` (String).

### 4. Order Schema ([Order.js](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/src/models/Order.js))
Represents customer purchases.
* `user` (ObjectId, ref: `'User'`, optional): Undefined for guest orders.
* `guestCustomer` (Sub-document, optional): Name, email, phone, and address (filled for guest checkouts).
* `items` (Array, required):
  * `product` (ObjectId, ref: `'Product'`, required)
  * `quantity` (Number, required, default: `1`)
  * `price` (Number, required): Unit price at purchase.
* `totalAmount` (Number, required): Total price of order.
* `shippingAddress` (String, required).
* `paymentMethod` (String, enum: `['cod', 'card']`, default: `'cod'`).
* `paymentIntentId` (String, optional): Stripe PaymentIntent ID.
* `paymentStatus` (String, enum: `['unpaid', 'paid', 'failed']`, default: `'unpaid'`).
* `status` (String, enum: `['Pending', 'Dispatched', 'Delivered', 'Cancelled']`, default: `'Pending'`).

### 5. Coupon Schema ([Coupon.js](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/src/models/Coupon.js))
Promo codes.
* `code` (String, required, unique, uppercase, trimmed).
* `discountType` (String, enum: `['percentage', 'fixed']`, required).
* `discountValue` (Number, required).
* `isActive` (Boolean, default: `true`).
* `expirationDate` (Date, optional).

---

## 📡 API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### Register User
* **Method**: `POST`
* **Path**: `/register`
* **Access**: Public
* **Body Request**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword",
    "phone": "555-0199",
    "address": "123 Main St, New York"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "_id": "64b0f...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Customer",
    "token": "ey..."
  }
  ```

#### Login User
* **Method**: `POST`
* **Path**: `/login`
* **Access**: Public
* **Body Request**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "64b0f...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Customer",
    "token": "ey..."
  }
  ```

#### Get Current Profile
* **Method**: `GET`
* **Path**: `/me`
* **Access**: Private (JWT protect)
* **Success Response (200 OK)**: User profile document (excluding password).

#### Update Current Profile
* **Method**: `PUT`
* **Path**: `/me`
* **Access**: Private (JWT protect)
* **Body Request**: Accepts any updates to `name`, `phone`, `address`, or `password`.
* **Success Response (200 OK)**: Updated user document.

---

### 2. User & Administrative Stats Routes (`/api/users`)

#### Get Admin Stats
* **Method**: `GET`
* **Path**: `/stats`
* **Access**: Private (Admin Only)
* **Success Response (200 OK)**:
  ```json
  {
    "totalProducts": 42,
    "activeUsers": 12,
    "pendingOrders": 3,
    "totalRevenue": 2499.50
  }
  ```

#### List All Users
* **Method**: `GET`
* **Path**: `/`
* **Access**: Private (Admin Only)
* **Success Response (200 OK)**: List of all users (where `isDeleted` is not `true`).

#### Update User Approval or Restrictions
* **Method**: `PUT`
* **Path**: `/:id/status`
* **Access**: Private (Admin Only)
* **Body Request**:
  ```json
  {
    "isApproved": true,
    "isRestricted": false
  }
  ```
* **Success Response (200 OK)**: Updated user document.

#### Update User Role
* **Method**: `PUT`
* **Path**: `/:id/role`
* **Access**: Private (Admin Only)
* **Body Request**:
  ```json
  {
    "role": "Seller"
  }
  ```
* **Success Response (200 OK)**: Updated user document.

#### Soft-Delete User
* **Method**: `DELETE`
* **Path**: `/:id`
* **Access**: Private (Admin Only)
* **Success Response (200 OK)**:
  ```json
  { "message": "User soft-deleted successfully" }
  ```

---

### 3. Categories Routes (`/api/categories`)

#### List All Categories
* **Method**: `GET`
* **Path**: `/`
* **Access**: Public
* **Success Response (200 OK)**: Array of all category documents.

#### Create Category
* **Method**: `POST`
* **Path**: `/`
* **Access**: Private (Admin Only)
* **Body Request**: `{ "name": "Electronics", "image": "/images/electronics.png", "description": "Laptops & Gadgets" }`
* **Success Response (210 Created)**: Newly created Category document.

#### Update Category
* **Method**: `PUT`
* **Path**: `/:id`
* **Access**: Private (Admin Only)
* **Body Request**: Partial payload of Category fields.
* **Success Response (200 OK)**: Updated Category document.

#### Delete Category
* **Method**: `DELETE`
* **Path**: `/:id`
* **Access**: Private (Admin Only)
* **Success Response (200 OK)**: `{ "message": "Category deleted successfully" }`

---

### 4. Product Routes (`/api/products`)

#### Query Product Catalog
* **Method**: `GET`
* **Path**: `/`
* **Access**: Public
* **Query Parameters (All Optional)**:
  * `search` (String): Search keyword (searches matching titles, brands, descriptions, and category names).
  * `category` (String): Filter by Category ID or exact Category name.
  * `brand` (String): Filter by Brand name (or comma-separated list of brands).
  * `minPrice` / `maxPrice` (Number).
  * `minRating` (Number): Filter by minimum rating.
  * `availabilityStatus` (String): e.g. `In Stock`, or comma-separated list.
  * `stock` (String, options: `'inStock'` [stock > 0], `'lowStock'` [1-5], `'outOfStock'` [stock = 0]).
  * `sort` (String, options: `'newest'`, `'oldest'`, `'priceAsc'`, `'priceDesc'`, `'ratingDesc'`, `'alphaAsc'`, `'alphaDesc'`).
  * `page` (Number, default `1`).
  * `limit` (Number, default `12`).
  * `isFeatured` / `isOnSale` (Boolean string, e.g. `'true'`).
* **Success Response (200 OK)**:
  ```json
  {
    "products": [...],
    "total": 35,
    "pages": 3,
    "page": 1,
    "limit": 12,
    "hasNext": true,
    "hasPrevious": false
  }
  ```

#### List Distinct Brands
* **Method**: `GET`
* **Path**: `/brands`
* **Access**: Public
* **Success Response (200 OK)**: Flat string array of distinct brands in the catalog, e.g., `["Apple", "Samsung", "Sony"]`.

#### Get Product Details
* **Method**: `GET`
* **Path**: `/:id`
* **Access**: Public
* **Success Response (200 OK)**: Product details document with populated `category` references.

#### Add Review
* **Method**: `POST`
* **Path**: `/:id/reviews`
* **Access**: Private (JWT protect)
* **Body Request**:
  ```json
  {
    "rating": 5,
    "comment": "Outstanding quality, very satisfied."
  }
  ```
* **Success Response (201 Created)**: Updated Product document featuring recalculated `rating` and populated `category`.

#### Create Product (Admin / Seller)
* **Method**: `POST`
* **Path**: `/`
* **Access**: Private (Admin / Seller Only)
* **Body Request**: Fully qualified Product object fields.
* **Success Response (201 Created)**: Saved Product document.

#### Update Product
* **Method**: `PUT`
* **Path**: `/:id`
* **Access**: Private (Admin / Seller Only)
* **Success Response (200 OK)**: Updated Product document.

#### Delete Product
* **Method**: `DELETE`
* **Path**: `/:id`
* **Access**: Private (Admin / Seller Only)
* **Success Response (200 OK)**: `{ "message": "Product deleted successfully" }`

---

### 5. Order Routes (`/api/orders`)

#### Place Order
* **Method**: `POST`
* **Path**: `/`
* **Access**: Optional (Authenticated users OR Guest shoppers)
* **Body Request**:
  ```json
  {
    "items": [
      { "productId": "64b0f...", "quantity": 2 }
    ],
    "shippingAddress": "123 Main St, New York, NY",
    "paymentMethod": "card", 
    "guestCustomer": {
      "name": "Jane Guest",
      "email": "guest@example.com",
      "phone": "555-1234",
      "address": "123 Main St, New York, NY"
    }
  }
  ```
  * Note: `guestCustomer` is required if request does not contain a valid user token.
* **Success Response (201 Created)**:
  * **For cash-on-delivery (`cod`) / Free checkout**:
    ```json
    {
      "order": { ...order details... }
    }
    ```
  * **For card payment (`card`)**:
    ```json
    {
      "order": { ...order details... },
      "clientSecret": "pi_12345_secret_abcde"
    }
    ```
    *(The clientSecret must be passed to Stripe Elements in the frontend to complete the payment).*

#### List All Orders
* **Method**: `GET`
* **Path**: `/`
* **Access**: Private (Admin Only)
* **Success Response (200 OK)**: Array of all order documents, sorted by newest first with populated item details and user metadata.

#### Get User's Own Orders
* **Method**: `GET`
* **Path**: `/my-orders`
* **Access**: Private (JWT protect)
* **Success Response (200 OK)**: Array of orders belonging to the authenticated user.

#### Update Order Status
* **Method**: `PUT`
* **Path**: `/:id/status`
* **Access**: Private (Admin Only)
* **Body Request**:
  ```json
  {
    "status": "Dispatched"
  }
  ```
* **Success Response (200 OK)**: Updated order document.

---

### 6. Coupon Routes (`/api/coupons`)

#### List All Coupons
* **Method**: `GET`
* **Path**: `/`
* **Access**: Private (Admin Only)
* **Success Response (200 OK)**: List of all coupon documents.

#### Create Coupon
* **Method**: `POST`
* **Path**: `/`
* **Access**: Private (Admin Only)
* **Body Request**:
  ```json
  {
    "code": "WINTER20",
    "discountType": "percentage",
    "discountValue": 20,
    "isActive": true,
    "expirationDate": "2026-12-31"
  }
  ```
* **Success Response (201 Created)**: Saved Coupon document.

#### Delete Coupon
* **Method**: `DELETE`
* **Path**: `/:id`
* **Access**: Private (Admin Only)
* **Success Response (200 OK)**: `{ "message": "Coupon deleted successfully" }`

#### Validate Coupon
* **Method**: `POST`
* **Path**: `/validate`
* **Access**: Private (JWT protect)
* **Body Request**: `{ "code": "WINTER20" }`
* **Success Response (200 OK)**:
  ```json
  {
    "valid": true,
    "code": "WINTER20",
    "discountType": "percentage",
    "discountValue": 20
  }
  ```

---

### 7. Utility & Static Routes

#### Get Configuration (Stripe Key)
* **Method**: `GET`
* **Path**: `/config/stripe-key`
* **Access**: Public
* **Success Response (200 OK)**: `{ "publishableKey": "pk_test_..." }`

#### Get Global Reviews
* **Method**: `GET`
* **Path**: `/reviews`
* **Access**: Public
* **Success Response (200 OK)**: Array of the first 3 global website testimonials.

#### Get Home Layout Data
* **Method**: `GET`
* **Path**: `/home`
* **Access**: Public
* **Success Response (200 OK)**:
  ```json
  {
    "categories": [...],
    "bestSelling": [...],
    "featuredItems": [...],
    "latestItems": [...],
    "onSaleItems": [...],
    "bestReviewed": [...]
  }
  ```

#### Get About Data
* **Method**: `GET`
* **Path**: `/about`
* **Access**: Public
* **Success Response (200 OK)**: Static layout titles and paragraphs.

#### Submit Contact Message
* **Method**: `POST`
* **Path**: `/contact`
* **Access**: Public
* **Body Request**: `{ "name": "Joe", "email": "joe@example.com", "phone": "123", "subject": "Hi", "message": "Help!" }`
* **Success Response (201 Created)**: Saved contact message document.

#### List Contact Messages
* **Method**: `GET`
* **Path**: `/contact`
* **Access**: Public (Admin dashboard view, paginated)
* **Success Response (200 OK)**: Paginated messages.

---

## 💳 Stripe Webhook Integration

* **Method**: `POST`
* **Path**: `/api/orders/webhook`
* **Access**: Stripe verification signature required

### Important Handling Instructions
The Stripe webhook endpoint is registered directly in `server.js` before `app.use(express.json())`:

```javascript
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), require('./src/routes/ordersWebhook'));
```

This ensures the payload arrives as a raw buffer, which is necessary for Stripe's SDK to verify signature cryptographic authenticity via `stripe.webhooks.constructEvent(req.body, sig, endpointSecret)`.

### Event Handlers
1. **`payment_intent.succeeded`**: Resolves the `orderId` via the PaymentIntent metadata, then sets that order's `paymentStatus` to `'paid'`.
2. **`payment_intent.payment_failed`**: Resolves the `orderId` via the PaymentIntent metadata, then sets that order's `paymentStatus` to `'failed'`.

---

## 📋 Environment Variables

The backend relies on the following configurations in its [local environment configuration](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/.env):

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Listening server port. | `5000` |
| `MONGO_URI` | MongoDB connection string. | `mongodb://127.0.0.1:27017/shoplite` |
| `JWT_SECRET` | Cryptographic sign-key for JWTs. | `your_secret_signing_key_here` |
| `STRIPE_PUBLISHABLE_KEY` | Public test Stripe token. | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Secret api Stripe token. | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for webhook verification. | `whsec_...` |
