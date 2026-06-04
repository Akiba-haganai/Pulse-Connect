import { MAP_CATEGORIES, getCategoryHex } from "../../lib/mapCategories";

type Props = {
  selected: string[];
  onChange: (categories: string[]) => void;
};

export default function MapCategoryFilter({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((c) => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap p-2">
      {MAP_CATEGORIES.map((cat) => {
        const active = selected.includes(cat.id);
        const hexColor = cat.hex || getCategoryHex(cat.id);

        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition
              ${active
                ? "text-white"
                : "text-gray-500 bg-white dark:bg-black"}
            `}
            style={{
              backgroundColor: active ? hexColor : undefined,
              borderColor: hexColor,
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}