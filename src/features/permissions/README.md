# Permissions Module

This module provides functionality for managing permissions in the application. It works in conjunction with the roles module to implement a comprehensive role-based access control (RBAC) system.

## Features

- Create, read, update, and delete permissions
- Group permissions by category
- Assign permissions to roles
- Check user permissions for route access

## API Endpoints

- `GET /api/v1/permissions` - Get all permissions (paginated)
- `GET /api/v1/permissions/category/:category` - Get permissions by category
- `GET /api/v1/permissions/:permissionId` - Get a specific permission by ID
- `POST /api/v1/permissions` - Create a new permission
- `PUT /api/v1/permissions/:permissionId` - Update a permission
- `DELETE /api/v1/permissions/:permissionId` - Delete a permission (soft delete)

## Permission Categories

Permissions are organized into the following categories:

- `user`: User management permissions
- `product`: Product management permissions
- `content`: Content management permissions
- `order`: Order management permissions
- `system`: System and configuration permissions
- `analytics`: Analytics and reporting permissions
- `marketing`: Marketing and promotion permissions

## Permission Structure

Each permission has the following structure:

- `name`: Human-readable name of the permission
- `description`: Description of what the permission allows
- `code`: Unique code for the permission (e.g., 'view:users')
- `category`: Category the permission belongs to
- `status`: Status of the permission (ACTIVE, DISABLED, PENDING)

## Available Permissions

The system includes a comprehensive set of permissions for various aspects of the application:

### User Management
- `view:users` - View user information
- `create:user` - Create new users
- `update:user` - Update user information
- `delete:user` - Delete users
- `manage:roles` - Manage roles
- `assign:roles` - Assign roles to users

### Product Management
- `view:products` - View products
- `create:product` - Create new products
- `edit:product` - Edit product information
- `delete:product` - Delete products
- `manage:product_images` - Manage product images
- `manage:product_inventory` - Manage product inventory
- `manage:product_pricing` - Manage product pricing

### Category Management
- `view:categories` - View categories
- `create:category` - Create new categories
- `edit:category` - Edit category information
- `delete:category` - Delete categories

### Discount Management
- `view:discounts` - View discounts
- `create:discount` - Create new discounts
- `edit:discount` - Edit discount information
- `delete:discount` - Delete discounts
- `update:discount` - Update discount information

### Order Management
- `view:orders` - View orders
- `update:order_status` - Update order status
- `process:refunds` - Process refunds
- `view:order_analytics` - View order analytics

### Content Management
- `view:content` - View content
- `create:content` - Create new content
- `update:content` - Update content
- `delete:content` - Delete content
- `manage:media` - Manage media files

### Settings and Configuration
- `view:settings` - View system settings
- `update:settings` - Update system settings
- `manage:payment_methods` - Manage payment methods
- `manage:shipping_methods` - Manage shipping methods

### Analytics and Reporting
- `view:analytics` - View analytics
- `export:reports` - Export reports
- `view:customer_data` - View customer data

### Marketing
- `manage:email_campaigns` - Manage email campaigns
- `manage:promotions` - Manage promotions

## Usage

### Creating a New Permission

```typescript
// POST /api/v1/permissions
{
  "name": "Manage Blog Posts",
  "description": "Permission to manage blog posts",
  "code": "manage:blog_posts",
  "category": "content"
}
```

### Updating a Permission

```typescript
// PUT /api/v1/permissions/:permissionId
{
  "name": "Manage Blog Articles",
  "description": "Permission to manage blog articles and posts"
}
```

### Getting Permissions by Category

```
GET /api/v1/permissions/category/content
```

## Integration with Roles

Permissions are assigned to roles, and users are assigned roles. This creates a flexible system where:

1. Permissions define granular access controls
2. Roles group related permissions
3. Users are assigned roles based on their responsibilities

See the Roles module documentation for more information on how roles and permissions work together.
