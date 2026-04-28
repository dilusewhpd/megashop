# MegaShop Backend

A Node.js backend for the MegaShop e-commerce application built with Express.js and PostgreSQL.

## Features

- User authentication with JWT
- Product management with filtering and sorting
- Shopping cart functionality
- Order management
- Wishlist functionality
- Promo code system
- Token blacklist for secure logout

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Environment variables are already configured in `.env` file:
   ```
   DATABASE_URL=postgresql://postgres:MegaShop@2026DB!@db.hdecmqepqkylvulmushf.supabase.co:5432/postgres
   JWT_SECRET=megashop_jwt_secret_key_2026
   NODE_ENV=development
   ```

## Database Setup

### Option 1: Local PostgreSQL
1. Create a PostgreSQL database named `megashop_db`
2. Run the setup script:
   ```bash
   npm run setup-db
   ```

### Option 2: Cloud Database (Supabase/Neon)
1. Create a new project on [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Get your database connection string
3. Update the `DATABASE_URL` in your `.env` file
4. Run the SQL schema from `DATABASE_SETUP.sql` in your database console
5. Run the setup script to add sample data:
   ```bash
   npm run setup-db
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 5000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with filtering/sorting)
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:id` - Get product by ID

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders/checkout` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:orderNumber` - Get order details
- `PUT /api/orders/:orderNumber/status` - Update order status
- `DELETE /api/orders/:orderNumber` - Delete order

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

## Deployment

### Vercel Deployment
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Render Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |

## Database Schema

The application uses the following tables:
- `users` - User accounts
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items
- `wishlist` - User wishlists
- `promo_codes` - Discount codes
- `token_blacklist` - Invalidated JWT tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.