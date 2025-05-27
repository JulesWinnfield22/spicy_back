import { Permission } from "./permissions";

/**
 * Role definitions with associated permissions
 */
export enum Role {
  ADMIN = "ADMIN",
  PRODUCT_MANAGER = "PRODUCT MANAGER",
  ORDER_MANAGER = "ORDER MANAGER",
  CONTENT_MANAGER = "CONTENT MANAGER",
  MARKETING_MANAGER = "MARKETING MANAGER",
  CUSTOMER_SERVICE = "CUSTOMER SERVICE",
  INVENTORY_MANAGER = "INVENTORY MANAGER",
  ANALYTICS_VIEWER = "ANALYTICS VIEWER",
  STORE_MANAGER = "STORE MANAGER",
}

/**
 * Maps roles to their associated permissions
 */
export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin has all permissions
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_ROLES,
    Permission.ASSIGN_ROLES,

    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.MANAGE_PRODUCT_IMAGES,
    Permission.MANAGE_PRODUCT_INVENTORY,
    Permission.MANAGE_PRODUCT_PRICING,

    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORY,
    Permission.EDIT_CATEGORY,
    Permission.DELETE_CATEGORY,

    Permission.VIEW_DISCOUNTS,
    Permission.CREATE_DISCOUNT,
    Permission.EDIT_DISCOUNT,
    Permission.DELETE_DISCOUNT,
    Permission.MANAGE_DISCOUNTS,

    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.PROCESS_REFUNDS,
    Permission.VIEW_ORDER_ANALYTICS,

    Permission.VIEW_CONTENT,
    Permission.CREATE_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.MANAGE_MEDIA,

    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,
    Permission.MANAGE_PAYMENT_METHODS,
    Permission.MANAGE_SHIPPING_METHODS,

    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_CUSTOMER_DATA,

    Permission.MANAGE_EMAIL_CAMPAIGNS,
    Permission.MANAGE_PROMOTIONS
  ],

  [Role.PRODUCT_MANAGER]: [
    // Product manager permissions
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.MANAGE_PRODUCT_IMAGES,
    Permission.MANAGE_PRODUCT_INVENTORY,
    Permission.MANAGE_PRODUCT_PRICING,

    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORY,
    Permission.EDIT_CATEGORY,
    Permission.DELETE_CATEGORY,

    Permission.VIEW_DISCOUNTS,
    Permission.CREATE_DISCOUNT,
    Permission.EDIT_DISCOUNT,
    Permission.DELETE_DISCOUNT
  ],

  [Role.ORDER_MANAGER]: [
    // Order manager permissions
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.PROCESS_REFUNDS,
    Permission.VIEW_ORDER_ANALYTICS,
    Permission.VIEW_CUSTOMER_DATA
  ],

  [Role.CONTENT_MANAGER]: [
    // Content manager permissions
    Permission.VIEW_CONTENT,
    Permission.CREATE_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.MANAGE_MEDIA
  ],

  [Role.MARKETING_MANAGER]: [
    // Marketing manager permissions
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_DISCOUNTS,
    Permission.CREATE_DISCOUNT,
    Permission.EDIT_DISCOUNT,
    Permission.MANAGE_DISCOUNTS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_EMAIL_CAMPAIGNS,
    Permission.MANAGE_PROMOTIONS
  ],

  [Role.CUSTOMER_SERVICE]: [
    // Customer service permissions
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.VIEW_CUSTOMER_DATA,
    Permission.VIEW_PRODUCTS
  ],

  [Role.INVENTORY_MANAGER]: [
    // Inventory manager permissions
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_PRODUCT_INVENTORY,
    Permission.VIEW_ORDER_ANALYTICS
  ],

  [Role.ANALYTICS_VIEWER]: [
    // Analytics viewer permissions
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_ORDER_ANALYTICS
  ],

  [Role.STORE_MANAGER]: [
    // Store manager permissions
    Permission.VIEW_PRODUCTS,
    Permission.EDIT_PRODUCT,
    Permission.MANAGE_PRODUCT_PRICING,
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.VIEW_DISCOUNTS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_CUSTOMER_DATA,
    Permission.VIEW_SETTINGS
  ]
};

/**
 * Get permissions for a specific role
 * @param role The role to get permissions for
 * @returns Array of permissions for the role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return RolePermissions[role] || [];
}

/**
 * Get all permissions for a user with multiple roles
 * @param roles Array of user roles
 * @returns Array of unique permissions for all roles
 */
export function getAllPermissionsForRoles(roles: Role[]): Permission[] {
  const allPermissions = roles.flatMap((role) => getPermissionsForRole(role));
  return [...new Set(allPermissions)];
}
