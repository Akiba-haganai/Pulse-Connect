import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface MapPin {
  id: string;
  title: string;
  description?: string;
  x_percent: number;
  y_percent: number;
  category: string;
  created_by: string;
  lat?: number;
  lng?: number;
};

export function useMapPins() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = async () => {
    const { data, error } = await supabase.from("map_pins").select("*");
    if (!error) setPins(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPins();

    const channel = supabase
      .channel("map_realtime")
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

  return { pins, loading, refetch: fetchPins };
}