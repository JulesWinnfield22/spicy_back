# Roles and Permissions Module

This module provides a comprehensive role-based access control (RBAC) system for the application. It allows for the management of roles and permissions, and provides middleware for protecting routes based on user permissions.

## Features

- Create, read, update, and delete roles
- Assign and remove permissions from roles
- Check user permissions for route access
- Support for multiple roles per user
- Database-driven permission system

## API Endpoints

### Roles

- `GET /api/v1/roles` - Get all roles (paginated)
- `GET /api/v1/roles/:roleId` - Get a specific role by ID
- `POST /api/v1/roles` - Create a new role
- `PUT /api/v1/roles/:roleId` - Update a role
- `DELETE /api/v1/roles/:roleId` - Delete a role (soft delete)
- `POST /api/v1/roles/:roleId/permissions` - Add permissions to a role
- `DELETE /api/v1/roles/:roleId/permissions` - Remove permissions from a role

### Permissions

- `GET /api/v1/permissions` - Get all permissions (paginated)
- `GET /api/v1/permissions/category/:category` - Get permissions by category
- `GET /api/v1/permissions/:permissionId` - Get a specific permission by ID
- `POST /api/v1/permissions` - Create a new permission
- `PUT /api/v1/permissions/:permissionId` - Update a permission
- `DELETE /api/v1/permissions/:permissionId` - Delete a permission (soft delete)

## Usage

### Protecting Routes

Use the middleware to protect routes based on permissions:

```typescript
import { requirePermission, requireAllPermissions, requireAnyPermission } from "../../auth/middleware/hasPermission";
import { Permission } from "../../auth/permissions";

// Route that requires a single permission
router.get(
  "/users",
  isLoogedIn,
  requirePermission(Permission.VIEW_USERS),
  getAllUsers
);

// Route that requires all of the specified permissions
router.put(
  "/users/:id",
  isLoogedIn,
  requireAllPermissions([Permission.VIEW_USERS, Permission.UPDATE_USER]),
  updateUser
);

// Route that requires any of the specified permissions
router.delete(
  "/users/:id",
  isLoogedIn,
  requireAnyPermission([Permission.DELETE_USER, Permission.MANAGE_ROLES]),
  deleteUser
);
```

### Available Roles

The system comes with the following predefined roles:

- **Admin**: Has all permissions
- **Product Manager**: Can manage products, categories, and discounts
- **Order Manager**: Can view and manage orders
- **Content Manager**: Can manage content and media
- **Marketing Manager**: Can manage discounts, promotions, and marketing campaigns
- **Customer Service**: Can view orders and customer data
- **Inventory Manager**: Can manage product inventory
- **Analytics Viewer**: Can view analytics and reports
- **Store Manager**: Can manage store operations

### Available Permissions

The system includes a comprehensive set of permissions for various aspects of the application:

- User management permissions
- Product management permissions
- Category management permissions
- Discount management permissions
- Order management permissions
- Content management permissions
- Settings and configuration permissions
- Analytics and reporting permissions
- Marketing permissions

## Setup

To set up the roles and permissions system:

1. Ensure the database models are properly set up
2. Run the migration script to populate the database with roles and permissions:

```typescript
// In index.ts
await migrateRolesAndPermissions();
```

3. Assign roles to users as needed

## Database Models

The system uses the following database models:

- `RoleSchema`: Stores role information and associated permissions
- `PermissionSchema`: Stores permission information
- `UserSchema`: Contains a reference to assigned roles

## Extending the System

To add new permissions:

1. Add the permission to the `Permission` enum in `src/auth/permissions.ts`
2. Run the migration script to add the new permission to the database
3. Assign the permission to the appropriate roles

To add new roles:

1. Add the role to the `Role` enum in `src/auth/roles.ts`
2. Define the permissions for the role in the `RolePermissions` object
3. Run the migration script to add the new role to the database
