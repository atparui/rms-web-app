# Role-Based Access Control (RBAC) Matrix

## Role Hierarchy

```
ROLE_ADMIN (Highest)
    ↓
ROLE_SUPERVISOR
    ↓
ROLE_CASHIER, ROLE_WAITER, ROLE_CHEF (Same level)
    ↓
ROLE_CUSTOMER (Lowest)
```

## Permission Matrix

| Feature/Endpoint | ADMIN | SUPERVISOR | CASHIER | WAITER | CHEF | CUSTOMER |
|-----------------|-------|------------|---------|--------|------|----------|
| **Restaurant Management** |
| View Restaurants | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Restaurant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update Restaurant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Restaurant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Menu Management** |
| View Menus | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Menu | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update Menu | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Menu | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Add Menu Items | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update Menu Items | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Menu Items | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Table Management** |
| View Tables | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Create Table | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update Table | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Table | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update Table Status | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Order Management** |
| View All Orders | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Own Orders | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Order | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Update Order | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cancel Order | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Update Order Status (Kitchen) | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Update Order Status (Service) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Process Payment | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **User Management** |
| View Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reports & Analytics** |
| View Sales Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Order Statistics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Menu Popularity | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **System Configuration** |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| API Configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Keycloak Configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Role Descriptions

### ROLE_ADMIN
**Full System Access**
- Complete control over all system features
- Restaurant configuration and management
- User management and role assignment
- System settings and configuration
- Access to all reports and analytics
- API configuration and management

**Use Cases:**
- System administrators
- Restaurant owners
- IT managers

---

### ROLE_SUPERVISOR
**Management & Oversight**
- View and manage restaurant operations
- Create and update menus
- Manage tables
- Oversee orders and payments
- Access to reports and analytics
- Cannot delete critical resources
- Cannot manage users or system settings

**Use Cases:**
- Restaurant managers
- Shift supervisors
- Operations managers

---

### ROLE_CASHIER
**Payment Processing**
- View orders
- Process payments
- Complete order transactions
- View payment history
- Cannot create or modify orders
- Cannot access configuration

**Use Cases:**
- Cashiers
- Payment processors
- Front desk staff

---

### ROLE_WAITER
**Order & Table Management**
- View menus and tables
- Create and manage orders
- Update table status
- Update order status (service-related)
- Cannot process payments
- Cannot access kitchen operations

**Use Cases:**
- Waiters
- Waitresses
- Service staff
- Hosts/hostesses

---

### ROLE_CHEF
**Kitchen Operations**
- View orders
- Update order status (kitchen-related: PREPARING, READY)
- View menu items
- Cannot create orders
- Cannot process payments
- Cannot access front-of-house operations

**Use Cases:**
- Chefs
- Cooks
- Kitchen staff
- Kitchen managers

---

### ROLE_CUSTOMER
**Limited Read Access**
- View menus
- View own orders (if applicable)
- Cannot create or modify anything
- Read-only access

**Use Cases:**
- Customer portal access
- Self-service kiosks
- Limited dashboard access

---

## Route Protection Examples

### Frontend Routes

```typescript
// Admin only
/admin/** → ROLE_ADMIN

// Supervisor and Admin
/supervisor/** → ROLE_SUPERVISOR, ROLE_ADMIN

// Cashier, Supervisor, Admin
/cashier/** → ROLE_CASHIER, ROLE_SUPERVISOR, ROLE_ADMIN

// Waiter, Supervisor, Admin
/waiter/** → ROLE_WAITER, ROLE_SUPERVISOR, ROLE_ADMIN

// Chef, Supervisor, Admin
/chef/** → ROLE_CHEF, ROLE_SUPERVISOR, ROLE_ADMIN

// Customer (and all above)
/customer/** → All roles
```

### Backend Guards

```typescript
// Example: Admin only endpoint
@Roles('ROLE_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete('/restaurants/:id')
deleteRestaurant() { ... }

// Example: Multiple roles
@Roles('ROLE_ADMIN', 'ROLE_SUPERVISOR')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('/menus')
createMenu() { ... }

// Example: All authenticated users
@UseGuards(JwtAuthGuard)
@Get('/menus')
getMenus() { ... }
```

---

## Keycloak Role Mapping

### Client Roles
In Keycloak, create these roles under the `rms-web-app` client:

1. `ROLE_ADMIN`
2. `ROLE_SUPERVISOR`
3. `ROLE_CASHIER`
4. `ROLE_WAITER`
5. `ROLE_CHEF`
6. `ROLE_CUSTOMER`

### Role Assignment
- Assign roles to users in Keycloak Admin Console
- Roles are included in JWT token as `realm_access.roles` or `resource_access.rms-web-app.roles`
- Backend validates roles from token claims

---

## Implementation Notes

1. **Role Inheritance**: Higher roles inherit permissions of lower roles
2. **Token Validation**: Always validate roles on backend, never trust frontend
3. **UI Hiding**: Hide UI elements based on roles, but always enforce on backend
4. **Error Messages**: Return generic 403 errors to prevent role enumeration
5. **Audit Logging**: Log all role-based access attempts for security

---

## Security Best Practices

1. **Principle of Least Privilege**: Users should have minimum required permissions
2. **Role Separation**: Different roles for different responsibilities
3. **Regular Audits**: Review role assignments periodically
4. **Token Expiration**: Short-lived access tokens (5-15 minutes)
5. **Refresh Tokens**: Secure refresh token storage and rotation
6. **Role Validation**: Always validate roles server-side
7. **Audit Trail**: Log all role-based actions

