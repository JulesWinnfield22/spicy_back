import { Permission, Role } from "src/interface";

export function PermissionDTO(permission: Permission) {
	if (!permission) return {};
	return {
		id: permission._id,
		name: permission.name,
		code: permission.code,
		description: permission.description,
		category: permission.category,
		status: permission.status,
	};
}

export default function RoleDTO(role?: Role) {
	if (!role) return {};
	return {
		id: role._id,
		name: role.name,
		description: role.description,
		permissions: role.permissions.map(PermissionDTO),
		status: role.status,
	};
}
