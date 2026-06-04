// lib/mapCategories.ts

// Color mapping - single source of truth
export const COLOR_HEX_MAP: Record<string, string> = {
  blue: "#3b82f6",
  purple: "#a855f7",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  pink: "#ec4899",
  gray: "#9ca3af",
};

export type MapCategory = {
  id: string;
  label: string;
  color: string; // This is the color name (blue, purple, etc.)
  hex?: string;  // Optional pre-computed hex
};

export const MAP_CATEGORIES: MapCategory[] = [
  { id: "lecture_hall", label: "Lecture Hall", color: "blue", hex: COLOR_HEX_MAP.blue },
  { id: "library", label: "Library", color: "purple", hex: COLOR_HEX_MAP.purple },
  { id: "lab", label: "Lab", color: "green", hex: COLOR_HEX_MAP.green },
  { id: "hostel", label: "Hostel", color: "yellow", hex: COLOR_HEX_MAP.yellow },
  { id: "admin", label: "Admin Block", color: "red", hex: COLOR_HEX_MAP.red },
  { id: "event", label: "Event", color: "pink", hex: COLOR_HEX_MAP.pink },
  { id: "other", label: "Other", color: "gray", hex: COLOR_HEX_MAP.gray },
];

// Helper function to get hex color by category id
export const getCategoryHex = (categoryId: string): string => {
  const found = MAP_CATEGORIES.find(c => c.id === categoryId);
  return found?.hex || COLOR_HEX_MAP.gray;
};

// Helper function to get category label by id
export const getCategoryLabel = (categoryId: string): string => {
  const found = MAP_CATEGORIES.find(c => c.id === categoryId);
  return found?.label || categoryId;
};