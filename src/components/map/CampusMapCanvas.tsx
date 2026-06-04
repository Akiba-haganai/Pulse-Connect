import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useMapPins } from "../../hooks/useMapPins";
import { useAuthStore } from "../../store/authStore";
import { MapPermissions } from "../../lib/permissions/mapPermissions";
import PinEditorModal from "./PinEditorModal";
import MapCategoryFilter from "./MapCategoryFilter";
import type { MapPin } from "../../hooks/useMapPins";
import { getCategoryHex } from "../../lib/mapCategories";

export default function CampusMapCanvas() {
  const { pins, refetch } = useMapPins();
  const { profile } = useAuthStore();

  const [professorMode, setProfessorMode] = useState(false);

  const canAdd = MapPermissions.canAddPins(profile?.role);
  const canEdit = MapPermissions.canEditPins(profile?.role);
  const isProfessor = profile?.role === "professor";

  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createCoords, setCreateCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

  // 🎬 STEP 1 — Add animation state
  const [visiblePins, setVisiblePins] = useState<string[]>([]);
  const hasAnimatedRef = useRef(false);

  const filteredPins =
    activeCategories.length > 0
      ? pins.filter((p) => activeCategories.includes(p.category))
      : pins;

  // ✅ Simple - just use the helper from mapCategories
  const getCategoryColor = (category: string) => getCategoryHex(category);

  // 🎬 STEP 2 — Stagger pin reveal logic
  useEffect(() => {
    // Skip if already animated
    if (hasAnimatedRef.current) return;

    setVisiblePins([]);

    filteredPins.forEach((pin, index) => {
      setTimeout(() => {
        setVisiblePins((prev) => [...prev, pin.id]);
      }, index * 60); // 👈 stagger speed (adjustable)
    });

    hasAnimatedRef.current = true;
  }, [filteredPins]);

  // 🎬 Optional reset for refresh UX (replay animation on new pins)
  useEffect(() => {
    return () => {
      hasAnimatedRef.current = false;
    };
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canAdd) return;
    if (!professorMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCreateCoords({ x, y });
    setCreateOpen(true);
  };

  const handleCreate = async (data: {
    title: string;
    description: string;
    category: string;
  }) => {
    if (!createCoords) return;

    const { error } = await supabase
      .from("map_pins")
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        x_percent: createCoords.x,
        y_percent: createCoords.y,
      });

    if (!error) {
      refetch();
      // Reset animation flag so new pin animates in
      hasAnimatedRef.current = false;
    }

    setCreateCoords(null);
    setCreateOpen(false);
  };

  const handleUpdate = async (data: {
    title: string;
    description: string;
    category: string;
  }) => {
    if (!selectedPin) return;

    const { error } = await supabase
      .from("map_pins")
      .update({
        title: data.title,
        description: data.description,
        category: data.category,
      })
      .eq("id", selectedPin.id);

    if (!error) {
      refetch();
    }

    setEditOpen(false);
  };

  // Generate random delay for organic feel
  const getRandomDelay = () => {
    return `${Math.random() * 100}ms`;
  };

  return (
    <div className="space-y-4 select-none">
      {isProfessor && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">
            Professor Tools
          </p>
          <button
            onClick={() => setProfessorMode(!professorMode)}
            className={`px-3 py-1 text-xs rounded-lg transition
              ${professorMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"}
            `}
          >
            {professorMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          </button>
        </div>
      )}

      <MapCategoryFilter
        selected={activeCategories}
        onChange={setActiveCategories}
      />

      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <div
          onClick={handleMapClick}
          className={`relative overflow-hidden bg-white ${
            professorMode && canAdd ? "cursor-crosshair" : "cursor-default"
          }`}
        >
          <img
            src="/campus-map-base.png"
            alt="Campus Map"
            className="w-full h-auto select-none pointer-events-none"
            draggable={false}
          />

          {filteredPins.map((pin) => (
            <button
              key={pin.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!canEdit) return;
                if (!professorMode) return;
                setSelectedPin(pin);
                setEditOpen(true);
              }}
              // 🎬 Tailwind v4 animation with inline keyframes
              className={`
                absolute -translate-x-1/2 -translate-y-1/2 group
                transition-all duration-300 ease-out
                ${
                  visiblePins.includes(pin.id)
                    ? "opacity-100 scale-100 animate-[pinDrop_0.35s_ease-out]"
                    : "opacity-0 scale-75"
                }
              `}
              style={{
                left: `${pin.x_percent}%`,
                top: `${pin.y_percent}%`,
                // 🎬 STEP 4 — Organic staggered motion
                transitionDelay: getRandomDelay(),
              }}
            >
              <div
                className={`relative h-5 w-5 rounded-full border-2 border-white shadow-md transition-all duration-200 ease-out ${
                  professorMode && canEdit
                    ? "hover:scale-125 hover:z-10 active:scale-110 cursor-pointer"
                    : "cursor-default"
                }`}
                style={{
                  backgroundColor: getCategoryColor(pin.category),
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              />

              {pin.category === "admin" && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
              )}

              <span className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                px-2 py-1 text-[10px] rounded-md
                bg-black/80 text-white whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-all duration-150
                pointer-events-none
                backdrop-blur-sm
                text-center
              ">
                {pin.title}
              </span>
            </button>
          ))}

          {createCoords && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${createCoords.x}%`,
                top: `${createCoords.y}%`,
              }}
            >
              <div className="h-3 w-3 rounded-full bg-indigo-600" />
              <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-40" />
            </div>
          )}
        </div>
      </div>

      <PinEditorModal
        open={createOpen}
        mode="create"
        onClose={() => {
          setCreateCoords(null);
          setCreateOpen(false);
        }}
        onSubmit={handleCreate}
      />

      <PinEditorModal
        open={editOpen}
        mode="edit"
        initialTitle={selectedPin?.title}
        initialDescription={selectedPin?.description}
        initialCategory={selectedPin?.category}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}