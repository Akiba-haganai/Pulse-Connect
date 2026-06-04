import CampusMapCanvas from "../../components/map/CampusMapCanvas";
import { useAuthStore } from "../../store/authStore";
import { ShieldAlert } from "lucide-react";

export default function ProfessorDashboard() {
  const { profile } = useAuthStore();

  if (
    profile?.role !== "professor" &&
    profile?.role !== "admin"
  ) {
    return (
      <div className="p-6 text-center">
        <ShieldAlert
          className="mx-auto text-red-500 mb-2"
          size={32}
        />
        <p>Access denied</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-xl font-black">
          Professor Tools
        </h1>

        <p className="text-sm text-gray-500">
          Manage campus resources and locations
        </p>
      </div>

      <CampusMapCanvas />
    </div>
  );
}