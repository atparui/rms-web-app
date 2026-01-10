# API Structure & Endpoints Design

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### 1. Authentication Endpoints

#### Get Current User
```
GET /auth/me
Roles: All authenticated users
Response: UserDto
```

#### Refresh Token
```
POST /auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }
```

---

### 2. Restaurant Configuration

#### Get All Restaurants
```
GET /restaurants
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Response: RestaurantDto[]
```

#### Get Restaurant by ID
```
GET /restaurants/:id
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Response: RestaurantDto
```

#### Create Restaurant
```
POST /restaurants
Roles: ROLE_ADMIN
Body: CreateRestaurantDto
Response: RestaurantDto
```

#### Update Restaurant
```
PUT /restaurants/:id
Roles: ROLE_ADMIN
Body: UpdateRestaurantDto
Response: RestaurantDto
```

#### Delete Restaurant
```
DELETE /restaurants/:id
Roles: ROLE_ADMIN
Response: { message: string }
```

---

### 3. Menu Management

#### Get All Menus
```
GET /menus?restaurantId=:id
Roles: All authenticated users
Response: MenuDto[]
```

#### Get Menu by ID
```
GET /menus/:id
Roles: All authenticated users
Response: MenuDto
```

#### Create Menu
```
POST /menus
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Body: CreateMenuDto
Response: MenuDto
```

#### Update Menu
```
PUT /menus/:id
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Body: UpdateMenuDto
Response: MenuDto
```

#### Delete Menu
```
DELETE /menus/:id
Roles: ROLE_ADMIN
Response: { message: string }
```

#### Get Menu Items
```
GET /menus/:id/items
Roles: All authenticated users
Response: MenuItemDto[]
```

#### Add Menu Item
```
POST /menus/:id/items
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Body: CreateMenuItemDto
Response: MenuItemDto
```

#### Update Menu Item
```
PUT /menus/:id/items/:itemId
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Body: UpdateMenuItemDto
Response: MenuItemDto
```

#### Delete Menu Item
```
DELETE /menus/:id/items/:itemId
Roles: ROLE_ADMIN
Response: { message: string }
```

---

### 4. Table Management

#### Get All Tables
```
GET /tables?restaurantId=:id
Roles: ROLE_ADMIN, ROLE_SUPERVISOR, ROLE_WAITER
Response: TableDto[]
```

#### Get Table by ID
```
GET /tables/:id
Roles: ROLE_ADMIN, ROLE_SUPERVISOR, ROLE_WAITER
Response: TableDto
```

#### Create Table
```
POST /tables
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Body: CreateTableDto
Response: TableDto
```

#### Update Table
```
PUT /tables/:id
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Body: UpdateTableDto
Response: TableDto
```

#### Delete Table
```
DELETE /tables/:id
Roles: ROLE_ADMIN
Response: { message: string }
```

#### Update Table Status
```
PATCH /tables/:id/status
Roles: ROLE_WAITER, ROLE_SUPERVISOR, ROLE_ADMIN
Body: { status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' }
Response: TableDto
```

---

### 5. Order Management

#### Get All Orders
```
GET /orders?restaurantId=:id&status=:status&date=:date
Roles: ROLE_ADMIN, ROLE_SUPERVISOR, ROLE_CASHIER, ROLE_WAITER, ROLE_CHEF
Response: OrderDto[]
```

#### Get Order by ID
```
GET /orders/:id
Roles: ROLE_ADMIN, ROLE_SUPERVISOR, ROLE_CASHIER, ROLE_WAITER, ROLE_CHEF
Response: OrderDto
```

#### Create Order
```
POST /orders
Roles: ROLE_WAITER, ROLE_SUPERVISOR, ROLE_ADMIN
Body: CreateOrderDto
Response: OrderDto
```

#### Update Order
```
PUT /orders/:id
Roles: ROLE_WAITER, ROLE_SUPERVISOR, ROLE_ADMIN
Body: UpdateOrderDto
Response: OrderDto
```

#### Update Order Status
```
PATCH /orders/:id/status
Roles: ROLE_CHEF, ROLE_WAITER, ROLE_CASHIER, ROLE_SUPERVISOR, ROLE_ADMIN
Body: { status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED' }
Response: OrderDto
```

#### Add Item to Order
```
POST /orders/:id/items
Roles: ROLE_WAITER, ROLE_SUPERVISOR, ROLE_ADMIN
Body: { menuItemId: string, quantity: number, notes?: string }
Response: OrderItemDto
```

#### Remove Item from Order
```
DELETE /orders/:id/items/:itemId
Roles: ROLE_WAITER, ROLE_SUPERVISOR, ROLE_ADMIN
Response: { message: string }
```

#### Process Payment
```
POST /orders/:id/payment
Roles: ROLE_CASHIER, ROLE_SUPERVISOR, ROLE_ADMIN
Body: ProcessPaymentDto
Response: PaymentDto
```

---

### 6. User Management (Admin Only)

#### Get All Users
```
GET /users
Roles: ROLE_ADMIN
Response: UserDto[]
```

#### Get User by ID
```
GET /users/:id
Roles: ROLE_ADMIN
Response: UserDto
```

#### Create User
```
POST /users
Roles: ROLE_ADMIN
Body: CreateUserDto
Response: UserDto
```

#### Update User
```
PUT /users/:id
Roles: ROLE_ADMIN
Body: UpdateUserDto
Response: UserDto
```

#### Assign Role to User
```
POST /users/:id/roles
Roles: ROLE_ADMIN
Body: { role: string }
Response: UserDto
```

#### Remove Role from User
```
DELETE /users/:id/roles/:role
Roles: ROLE_ADMIN
Response: UserDto
```

---

### 7. Reports & Analytics

#### Get Sales Report
```
GET /reports/sales?restaurantId=:id&startDate=:date&endDate=:date
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Response: SalesReportDto
```

#### Get Order Statistics
```
GET /reports/orders?restaurantId=:id&startDate=:date&endDate=:date
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Response: OrderStatisticsDto
```

#### Get Menu Item Popularity
```
GET /reports/menu-popularity?restaurantId=:id&startDate=:date&endDate=:date
Roles: ROLE_ADMIN, ROLE_SUPERVISOR
Response: MenuPopularityDto[]
```

---

## DTO Examples

### RestaurantDto
```typescript
{
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    [key: string]: { open: string; close: string };
  };
  settings: {
    currency: string;
    taxRate: number;
    serviceCharge: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderDto
```typescript
{
  id: string;
  restaurantId: string;
  tableId: string;
  waiterId: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
  items: OrderItemDto[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL';
  createdAt: Date;
  updatedAt: Date;
}
```

### MenuItemDto
```typescript
{
  id: string;
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  allergens?: string[];
  dietaryInfo?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Error Responses

### Standard Error Format
```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Swagger Documentation

Once implemented, access Swagger UI at:
```
http://localhost:3001/api/docs
```

All endpoints will be automatically documented with:
- Request/Response schemas
- Authentication requirements
- Role requirements
- Example requests/responses
- Try-it-out functionality

