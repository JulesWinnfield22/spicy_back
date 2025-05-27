import { User } from "../interface";
import RoleDTO from "./RoleDto";

export default function UserDTO(user?: User) {
  if (!user) return {};
  return {
    id: user._id,
    firstName: user.firstName,
    fathersName: user.fathersName,
    grandFathersName: user.grandFathersName,
    email: user.email,
    roles: user?.roles ? user.roles.map(RoleDTO) : [],
    phone_number: user.phone_number,
    profile_pic: user.profile_pic,
    createdAt: user.createdAt,
    status: user.status,
    updatedAt: user.updatedAt,
  };
}
