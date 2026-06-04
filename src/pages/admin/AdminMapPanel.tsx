import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { MapPermissions } from "../../lib/permissions/mapPermissions";
import { Trash2, MapPin, Loader2, User, Search } from "lucide-react";
import toast from "react-hot-toast";

type MapPinType = {
  id: string;
  title: string;
  description: string;
  category?: string;
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
  const [search, setSearch] = useState("");

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

  // ✅ Updated groupedStats with category breakdown
  const groupedStats = useMemo(() => {
    const today = pins.filter(
      (p) =>
        new Date(p.created_at).toDateString() ===
        new Date().toDateString()
    ).length;

    const byCategory = pins.reduce(
      (acc, pin) => {
        const category = pin.category ?? "other";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: pins.length,
      today,
      byCategory,
    };
  }, [pins]);

  // ✅ Filter pins by search
  const filteredPins = pins.filter(
    (pin) =>
      pin.title.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Helper to get category color class
  const getCategoryColorClass = (category?: string) => {
    const colorMap: Record<string, string> = {
      lecture_hall: "bg-blue-50 text-blue-600",
      library: "bg-purple-50 text-purple-600",
      lab: "bg-green-50 text-green-600",
      hostel: "bg-yellow-50 text-yellow-600",
      admin: "bg-red-50 text-red-600",
      event: "bg-pink-50 text-pink-600",
      other: "bg-gray-50 text-gray-600",
    };
    return colorMap[category || "other"] || colorMap.other;
  };

  // ✅ Helper to get category label
  const getCategoryLabel = (category?: string) => {
    const labelMap: Record<string, string> = {
      lecture_hall: "Lecture Hall",
      library: "Library",
      lab: "Lab",
      hostel: "Hostel",
      admin: "Admin",
      event: "Event",
      other: "Other",
    };
    return labelMap[category || "other"] || category || "Other";
  };

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

        {/* ✅ Stats Cards Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Pins
            </p>
            <p className="font-black text-lg text-indigo-600 dark:text-indigo-400">
              {groupedStats.total}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Today
            </p>
            <p className="font-black text-lg text-green-600 dark:text-green-400">
              {groupedStats.today}
            </p>
          </div>
        </div>

        {/* ✅ Category Stats (if any categories exist) */}
        {Object.keys(groupedStats.byCategory).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {Object.entries(groupedStats.byCategory).map(([category, count]) => (
              <div key={category} className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {getCategoryLabel(category)}: {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pins by title..."
          className="
            w-full
            rounded-xl
            border border-gray-200 dark:border-gray-800
            p-3
            pl-9
            text-sm
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-white
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
        />
      </div>

      {/* LIST */}
      {filteredPins.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
          <MapPin size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {search ? "No pins match your search" : "No pins created yet"}
          </p>
          {search && (
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPins.map((pin) => (
            <div
              key={pin.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex justify-between items-start hover:shadow-md transition-shadow"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{pin.title}</p>
                  {/* ✅ Category Badge */}
                  {pin.category && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColorClass(pin.category)}`}>
                      {getCategoryLabel(pin.category)}
                    </span>
                  )}
                </div>
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