/**
 * Permission constants for the application
 * These define granular access control for different actions
 */
// Product Management Permissions
// const PRODUCT_PERMISSIONS = {
//   // Core product operations
//   VIEW_PRODUCTS: 'view:products',
//   CREATE_PRODUCT: 'create:product',
//   EDIT_PRODUCT: 'edit:product',
//   DELETE_PRODUCT: 'delete:product',

//   // Product details
//   MANAGE_PRODUCT_IMAGES: 'manage:product_images',
//   MANAGE_PRODUCT_DESCRIPTIONS: 'manage:product_descriptions',
//   MANAGE_PRODUCT_SPECIFICATIONS: 'manage:product_specifications',
//   MANAGE_PRODUCT_PRICING: 'manage:product_pricing',
//   MANAGE_PRODUCT_INVENTORY: 'manage:product_inventory',

//   // Category management
//   VIEW_CATEGORIES: 'view:categories',
//   CREATE_CATEGORY: 'create:category',
//   EDIT_CATEGORY: 'edit:category',
//   DELETE_CATEGORY: 'delete:category',

//   // Collection/tag management
//   MANAGE_COLLECTIONS: 'manage:collections',
//   MANAGE_TAGS: 'manage:tags',

//   // Discount and promotion
//   VIEW_DISCOUNTS: 'view:discounts',
//   CREATE_DISCOUNT: 'create:discount',
//   EDIT_DISCOUNT: 'edit:discount',
//   DELETE_DISCOUNT: 'delete:discount',

//   // Product reviews
//   VIEW_PRODUCT_REVIEWS: 'view:product_reviews',
//   MODERATE_PRODUCT_REVIEWS: 'moderate:product_reviews',

//   // Analytics and reporting
//   VIEW_PRODUCT_ANALYTICS: 'view:product_analytics',
//   EXPORT_PRODUCT_REPORTS: 'export:product_reports',

//   // Vendor management (if applicable)
//   VIEW_VENDORS: 'view:vendors',
//   MANAGE_VENDOR_PRODUCTS: 'manage:vendor_products',

//   // Import/export functionality
//   IMPORT_PRODUCTS: 'import:products',
//   EXPORT_PRODUCTS: 'export:products',
// };

// Product Manager Role
// const PRODUCT_MANAGER_ROLE = {
//   name: 'product_manager',
//   description: 'Manages products, categories, and related content',
//   permissions: [
//     // Core product permissions
//     PRODUCT_PERMISSIONS.VIEW_PRODUCTS,
//     PRODUCT_PERMISSIONS.CREATE_PRODUCT,
//     PRODUCT_PERMISSIONS.EDIT_PRODUCT,
//     PRODUCT_PERMISSIONS.DELETE_PRODUCT,

//     // Product details permissions
//     PRODUCT_PERMISSIONS.MANAGE_PRODUCT_IMAGES,
//     PRODUCT_PERMISSIONS.MANAGE_PRODUCT_DESCRIPTIONS,
//     PRODUCT_PERMISSIONS.MANAGE_PRODUCT_SPECIFICATIONS,
//     PRODUCT_PERMISSIONS.MANAGE_PRODUCT_PRICING,
//     PRODUCT_PERMISSIONS.MANAGE_PRODUCT_INVENTORY,

//     // Category permissions
//     PRODUCT_PERMISSIONS.VIEW_CATEGORIES,
//     PRODUCT_PERMISSIONS.CREATE_CATEGORY,
//     PRODUCT_PERMISSIONS.EDIT_CATEGORY,
//     PRODUCT_PERMISSIONS.DELETE_CATEGORY,

//     // Collection/tag permissions
//     PRODUCT_PERMISSIONS.MANAGE_COLLECTIONS,
//     PRODUCT_PERMISSIONS.MANAGE_TAGS,

//     // Discount permissions
//     PRODUCT_PERMISSIONS.VIEW_DISCOUNTS,
//     PRODUCT_PERMISSIONS.CREATE_DISCOUNT,
//     PRODUCT_PERMISSIONS.EDIT_DISCOUNT,
//     PRODUCT_PERMISSIONS.DELETE_DISCOUNT,

//     // Review permissions
//     PRODUCT_PERMISSIONS.VIEW_PRODUCT_REVIEWS,
//     PRODUCT_PERMISSIONS.MODERATE_PRODUCT_REVIEWS,

//     // Analytics permissions
//     PRODUCT_PERMISSIONS.VIEW_PRODUCT_ANALYTICS,
//     PRODUCT_PERMISSIONS.EXPORT_PRODUCT_REPORTS,

//     // Import/export permissions
//     PRODUCT_PERMISSIONS.IMPORT_PRODUCTS,
//     PRODUCT_PERMISSIONS.EXPORT_PRODUCTS,
//   ]
// };

export enum Permission {
  // User management permissions
  VIEW_USERS = 'view:users',
  CREATE_USER = 'create:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
  MANAGE_ROLES = 'manage:roles',
  ASSIGN_ROLES = 'assign:roles',

  // Product management permissions
  VIEW_PRODUCTS = 'view:products',
  CREATE_PRODUCT = 'create:product',
  EDIT_PRODUCT = 'edit:product',
  DELETE_PRODUCT = 'delete:product',
  MANAGE_PRODUCT_IMAGES = 'manage:product_images',
  MANAGE_PRODUCT_INVENTORY = 'manage:product_inventory',
  MANAGE_PRODUCT_PRICING = 'manage:product_pricing',

  // Category management
  VIEW_CATEGORIES = 'view:categories',
  CREATE_CATEGORY = 'create:category',
  EDIT_CATEGORY = 'edit:category',
  DELETE_CATEGORY = 'delete:category',

  // Discount management
  VIEW_DISCOUNTS = 'view:discounts',
  CREATE_DISCOUNT = 'create:discount',
  EDIT_DISCOUNT = 'edit:discount',
  DELETE_DISCOUNT = 'delete:discount',
  MANAGE_DISCOUNTS = 'update:discount',

  // Order management
  VIEW_ORDERS = 'view:orders',
  UPDATE_ORDER_STATUS = 'update:order_status',
  PROCESS_REFUNDS = 'process:refunds',
  VIEW_ORDER_ANALYTICS = 'view:order_analytics',

  // Content management permissions
  VIEW_CONTENT = 'view:content',
  CREATE_CONTENT = 'create:content',
  UPDATE_CONTENT = 'update:content',
  DELETE_CONTENT = 'delete:content',
  MANAGE_MEDIA = 'manage:media',

  // Settings and configuration
  VIEW_SETTINGS = 'view:settings',
  UPDATE_SETTINGS = 'update:settings',
  MANAGE_PAYMENT_METHODS = 'manage:payment_methods',
  MANAGE_SHIPPING_METHODS = 'manage:shipping_methods',

  // Analytics and reporting
  VIEW_ANALYTICS = 'view:analytics',
  EXPORT_REPORTS = 'export:reports',
  VIEW_CUSTOMER_DATA = 'view:customer_data',

  // Marketing
  MANAGE_EMAIL_CAMPAIGNS = 'manage:email_campaigns',
  MANAGE_PROMOTIONS = 'manage:promotions',
}

/**
 * Helper function to check if a user has a specific permission
 * @param userPermissions Array of user permissions
 * @param requiredPermission Permission to check
 * @returns boolean indicating if user has the permission
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Helper function to check if a user has all of the specified permissions
 * @param userPermissions Array of user permissions
 * @param requiredPermissions Permissions to check
 * @returns boolean indicating if user has all the permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );
}

/**
 * Helper function to check if a user has any of the specified permissions
 * @param userPermissions Array of user permissions
 * @param requiredPermissions Permissions to check
 * @returns boolean indicating if user has any of the permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
}
