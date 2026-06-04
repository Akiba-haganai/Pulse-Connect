import type { UserRole } from "../types/database";

export const Permissions = {
  canPostAnnouncement: (role?: UserRole) =>
    role === "admin" || role === "professor" || role === "moderator",

  canDeletePost: (role?: UserRole) =>
    role === "admin" || role === "moderator",

  canUploadMaterial: (role?: UserRole) =>
    role === "admin" || role === "professor",

  canCreateGroups: (role?: UserRole) =>
    role === "admin" || role === "professor",

  canUseMapEditMode: (role?: UserRole) =>
    role === "admin",

  isStaff: (role?: UserRole) =>
    role === "admin" || role === "professor" || role === "moderator",
};
