import type { UserRole } from "../../types/database";

export const MapPermissions = {
  canAddPins: (role?: UserRole) =>
    role === "admin" || role === "professor",

  canEditPins: (role?: UserRole, isOwner?: boolean) =>
    role === "admin" || (role === "professor" && isOwner),

  canDeletePins: (role?: UserRole, isOwner?: boolean) =>
    role === "admin" || role === "moderator" || (role === "professor" && isOwner),

  canManageCategories: (role?: UserRole) =>
    role === "admin",
};