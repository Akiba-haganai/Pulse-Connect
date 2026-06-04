import CampusMapCanvas from "../../components/map/CampusMapCanvas";

export default function MapPage() {
  return (
    <div className="max-w-md mx-auto px-2 pb-20">
      <h1 className="text-sm font-black mb-2">
        Campus Map
      </h1>
      <CampusMapCanvas />
    </div>
  );
}