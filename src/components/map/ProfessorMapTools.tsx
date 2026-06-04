import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { MapPermissions } from "../../lib/permissions/mapPermissions";

export default function ProfessorMapTools({
  onCreate: _onCreate,
}: {
  onCreate?: (x: number, y: number) => void;
}) {
  const { profile } = useAuthStore();
  const canAdd = MapPermissions.canAddPins(profile?.role);

  const [active, setActive] = useState(false);

  if (!canAdd) return null;

  return (
    <button
      onClick={() => setActive(!active)}
      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg"
    >
      {active ? "Exit Add Mode" : "Add Pin Mode"}
    </button>
  );
}