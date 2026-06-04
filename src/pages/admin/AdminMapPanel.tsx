import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { MapPermissions } from "../../lib/permissions/mapPermissions";
import { Trash2, MapPin, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

type MapPinType = {
  id: string;
  title: string;
  description: string;
  x_percent: number;
  y_percent: number;
  created_by: string;
  created_at: string;
  profiles?: { full_name: string; username: string };
};

export default function MapModerationPanel() {
  const { profile } = useAuthStore();

  const [pins, setPins] = useState<MapPinType[]>([]);
  const [loading, setLoading] = useState(true);

  const canDelete = MapPermissions.canDeletePins(profile?.role);

  useEffect(() => {
    fetchPins();

    // realtime updates
    const channel = supabase
      .channel("admin-map-moderation")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "map_pins" },
        () => fetchPins()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPins = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("map_pins")
      .select("*, profiles(full_name, username)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load map pins");
      console.error(error);
      setPins([]);
    } else {
      setPins(data || []);
    }
    setLoading(false);
  };

  const deletePin = async (id: string) => {
    if (!canDelete) {
      toast.error("You are not allowed to delete pins");
      return;
    }

    const { error } = await supabase
      .from("map_pins")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete pin");
      return;
    }

    toast.success("Pin removed");
    setPins((prev) => prev.filter((p) => p.id !== id));
  };

  const groupedStats = useMemo(() => {
    return {
      total: pins.length,
      today: pins.filter(
        (p) =>
          new Date(p.created_at).toDateString() === new Date().toDateString()
      ).length,
    };
  }, [pins]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-indigo-600" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-black flex items-center gap-2 text-gray-900 dark:text-white">
          <MapPin size={20} className="text-indigo-600" /> Map Moderation Panel
        </h1>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Total Pins: {groupedStats.total} | Today: {groupedStats.today}
        </div>
      </div>

      {/* LIST */}
      {pins.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
          <MapPin size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No pins created yet</p>
          <p className="text-xs text-gray-400 mt-1">Pins will appear here for moderation</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex justify-between items-start hover:shadow-md transition-shadow"
            >
              <div className="space-y-1 flex-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">{pin.title}</p>
                {pin.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pin.description}</p>
                )}

                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                  X: {pin.x_percent.toFixed(2)}% | Y: {pin.y_percent.toFixed(2)}%
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
                  <span>Created: {new Date(pin.created_at).toLocaleString()}</span>
                  {pin.profiles && (
                    <span className="flex items-center gap-1">
                      <User size={10} /> by {pin.profiles.full_name || pin.profiles.username}
                    </span>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              {canDelete && (
                <button
                  onClick={() => deletePin(pin.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Delete pin"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}