# Roles and Permissions System

This directory contains the implementation of a roles and permissions system for the application.

## Overview

The system provides a flexible way to manage user access to different parts of the application. It consists of:

1. **Permissions**: Granular access controls for specific actions
2. **Roles**: Collections of permissions assigned to users
3. **Middleware**: Functions to check if a user has the required permissions

## Files

- `permissions.ts`: Defines all available permissions and helper functions
- `roles.ts`: Defines roles and maps them to permissions
- `middleware/hasPermission.ts`: Middleware to check for permissions
- `middleware/isAdmin.ts`: Legacy middleware for backward compatibility

## Usage

### Defining Permissions

Permissions are defined in `permissions.ts` as an enum:

```typescript
export enum Permission {
  VIEW_USERS = 'view:users',
  CREATE_USER = 'create:user',
  // ...
}
```

### Defining Roles

Roles are defined in `roles.ts` and mapped to permissions:

```typescript
export enum Role {
  ADMIN = 'Admin',
  SALES = 'Sales',
  // ...
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    // ...
  ],
  // ...
};
```

### Protecting Routes

Use the middleware to protect routes:

```typescript
import { requirePermission, requireAllPermissions } from "../auth/middleware/hasPermission";
import { Permission } from "../auth/permissions";

// Route that requires a single permission
router.get("/users", 
  isLoogedIn, 
  requirePermission(Permission.VIEW_USERS), 
  getAllUsers
);

// Route that requires multiple permissions
router.put("/users/:id", 
  isLoogedIn,
  requireAllPermissions([Permission.VIEW_USERS, Permission.UPDATE_USER]),
  updateUser
);
```

## Migration

To migrate existing users to the new roles system:

1. Uncomment the migration line in `index.ts`:
   ```typescript
   await migrateUsersToRolesSystem();
   ```

2. Run the application once to perform the migration
3. Comment out the line again to avoid running the migration on every startup

## Backward Compatibility

The system maintains backward compatibility with the existing role-based access control:

- The `role` field is still supported in the User schema
- The `ifAdmin` middleware still works with both the old and new systems
- The migration utility converts existing roles to the new format
