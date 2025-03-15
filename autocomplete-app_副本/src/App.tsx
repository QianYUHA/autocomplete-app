import Autocomplete from "./components/Autocomplete";
import { useState } from "react";

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Grape", value: "grape" },
];

export default function App() {
  const [singleSelect, setSingleSelect] = useState<OptionType | null>(null);
  const [multiSelect, setMultiSelect] = useState<OptionType[]>([]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Autocomplete Demo</h1>

      <Autocomplete
        label="Select a fruit"
        placeholder="Type to search..."
        options={options}
        value={singleSelect}
        onChange={setSingleSelect}
      />

      <Autocomplete
        label="Select multiple fruits"
        placeholder="Type to search..."
        options={options}
        value={multiSelect}
        onChange={setMultiSelect}
        multiple
      />
    </div>
  );
}

