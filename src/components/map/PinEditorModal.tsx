import { useEffect, useState } from "react";
import { MAP_CATEGORIES } from "../../lib/mapCategories";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  initialCategory?: string;
  onClose: () => void;
  onSubmit: (data: {
  title: string;
  description: string;
  category: string;
}) => void;
};

export default function PinEditorModal({
  open,
  mode,
  initialTitle = "",
  initialDescription = "",
  initialCategory = "other",
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setCategory(initialCategory);
  }, [initialTitle, initialDescription, initialCategory, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title,
      description,
      category,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl w-[90%] max-w-sm space-y-3">

        <h2 className="text-sm font-bold">
          {mode === "create" ? "Create Pin" : "Edit Pin"}
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Pin title"
          className="w-full p-2 text-xs border rounded-lg"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 text-xs border rounded-lg"
        />
        <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 text-xs border rounded-lg"
        >
          {MAP_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
              </option>
            ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-xs px-3 py-1">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}