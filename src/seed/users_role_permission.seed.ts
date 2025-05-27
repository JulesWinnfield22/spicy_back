import mongoose, { Types } from "mongoose";
import Permission from "../db/models/PermissionSchema";
import Role from "../db/models/RoleSchema";
import userSchema from '../db/models/UsersSchema';
import { Role as RoleEnum, RolePermissions } from "../auth/roles";
import { Permission as PermissionEnum } from "../auth/permissions";
import doenv from "dotenv";


export async function migrateRolesAndPermissions() {
  try {
    console.log("Starting migration of roles and permissions...");

    // Step 1: Create permissions based on the enum
    const permissionMap = new Map<PermissionEnum, mongoose.Types.ObjectId>();

    for (const permissionCode of Object.values(PermissionEnum)) {
      // Skip if already processed
      if (permissionMap.has(permissionCode)) continue;

      // Determine category based on permission code
      let category = 'system';
      if (permissionCode.includes('user')) category = 'user';
      if (permissionCode.includes('product')) category = 'product';
      if (permissionCode.includes('content')) category = 'content';
      if (permissionCode.includes('order')) category = 'order';
      if (permissionCode.includes('analytics')) category = 'analytics';
      if (permissionCode.includes('discount') || permissionCode.includes('promotion')) category = 'marketing';
      if (permissionCode.includes('setting')) category = 'system';

      // Format the name from the code
      const name = permissionCode
        .split(':')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      // Check if permission already exists
      let permission = await Permission.findOne({ code: permissionCode });

      if (!permission) {
        permission = await Permission.create({
          name,
          description: `Permission to ${permissionCode.split(':')[0]} ${permissionCode.split(':')[1]}`,
          code: permissionCode,
          category,
          status: 'ACTIVE'
        });
        console.log(`Created permission: ${name}`);
      }

      permissionMap.set(permissionCode, new Types.ObjectId(permission._id?.toString()));
    }

    // Step 2: Create roles based on the enum
    for (const roleKey of Object.keys(RoleEnum)) {
      const roleName = roleKey;
      const readableName = RoleEnum[roleKey as keyof typeof RoleEnum];

      // Get permission IDs for this role
      const rolePermissions = RolePermissions[RoleEnum[roleKey as keyof typeof RoleEnum]];
      const permissionIds = rolePermissions.map(p => permissionMap.get(p)).filter(Boolean) as mongoose.Types.ObjectId[];

      // Check if role already exists
      let role = await Role.findOne({ name: roleName });

      if (!role) {
        role = await Role.create({
          name: roleName,
          description: `Role for ${readableName}`,
          permissions: permissionIds,
          status: 'ACTIVE'
        });
        console.log(`Created role: ${readableName}`);
      } else {
        // Update permissions if role exists
        role.permissions = permissionIds;
        await role.save();
        console.log(`Updated permissions for role: ${readableName}`);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

// Run the migration if this file is executed directly
  (async function() {
    doenv.config();
    const DB_URL = process.env?.DB_URL;
    const DB_NAME = process.env?.DB_NAME;

    try {
      await mongoose.connect(`${DB_URL}${DB_NAME}`);
      console.log(`Connected to DB [${DB_NAME}]`);
      await migrateRolesAndPermissions();
      console.log("Migration completed");
      process.exit(0);
    } catch (err: any) {
      console.error("Migration failed:", err.message);
      process.exit(1);
    }
  })();
