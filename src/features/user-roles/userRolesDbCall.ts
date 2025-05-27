import mongoose from "mongoose";
import UserModel from "../../db/models/UsersSchema";
import { asyncCall } from "../../utils/utils";

/**
 * Get roles for a specific user
 */
export async function getUserRoles(userId: string) {
  return await asyncCall(
    UserModel.findById(userId).populate("roles")
  );
}

/**
 * Assign roles to a user
 */
export async function assignRolesToUser(userId: string, roleIds: string[]) {
  return await asyncCall(
    UserModel.findByIdAndUpdate(
      userId,
      { 
        $addToSet: { 
          roles: { 
            $each: roleIds.map(id => new mongoose.Types.ObjectId(id)) 
          } 
        } 
      },
      { new: true }
    ).populate("roles")
  );
}

/**
 * Remove roles from a user
 */
export async function removeRolesFromUser(userId: string, roleIds: string[]) {
  return await asyncCall(
    UserModel.findByIdAndUpdate(
      userId,
      { 
        $pull: { 
          roles: { 
            $in: roleIds.map(id => new mongoose.Types.ObjectId(id)) 
          } 
        } 
      },
      { new: true }
    ).populate("roles")
  );
}
