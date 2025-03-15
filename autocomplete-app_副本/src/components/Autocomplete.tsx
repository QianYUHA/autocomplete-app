import { useState, useEffect, useRef } from "react";
import { useFloating, offset, flip, shift } from "@floating-ui/react";

interface OptionType {
  label: string;
  value: string;
}

interface AutocompleteProps {
  label?: string;
  description?: string;
  placeholder?: string;
  options: OptionType[];
  value: OptionType | OptionType[] | null;
  onChange: (value: OptionType | OptionType[] | null) => void;
  onInputChange?: (input: string) => void;
  multiple?: boolean;
  filterOptions?: (option: OptionType, inputValue: string) => boolean;
  renderOption?: (option: OptionType) => React.ReactNode;
  disabled?: boolean;
}

export default function Autocomplete({
  label,
  description,
  placeholder = "Search...",
  options,
  value,
  onChange,
  onInputChange,
  multiple = false,
  filterOptions,
  renderOption,
  disabled = false,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Floating UI 处理下拉框定位
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift()],
  });

  // 处理防抖搜索（300ms）
  useEffect(() => {
    const handler = setTimeout(() => {
      onInputChange?.(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, onInputChange]);

  // 过滤选项
  const filteredOptions = options.filter((option) =>
    filterOptions
      ? filterOptions(option, inputValue)
      : option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: OptionType) => {
    if (multiple) {
      const newValue = Array.isArray(value)
        ? value.some((v) => v.value === option.value)
          ? value.filter((v) => v.value !== option.value)
          : [...value, option]
        : [option];
      onChange(newValue);
    } else {
      onChange(option);
      setInputValue(option.label);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) =>
        prev === 0 ? filteredOptions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && filteredOptions[highlightIndex]) {
      handleSelect(filteredOptions[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {label && <label className="block mb-1 text-gray-700">{label}</label>}
      <div className="relative">
        <input
          type="text"
          placeholder={disabled ? "Loading..." : placeholder} // 显示 "Loading..." 代替 Spinner
          value={inputValue}
          ref={(el) => {
            inputRef.current = el;
            refs.setReference(el);
          }}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full p-2 border rounded-md shadow-sm ${
            disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500"
          }`}
        />
        {isOpen && !disabled && (
          <ul
            ref={refs.setFloating}
            style={{ ...floatingStyles, position: "absolute", zIndex: 50 }}
            className="border border-gray-300 mt-1 rounded-md bg-white shadow-lg max-h-40 overflow-y-auto w-full"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`p-2 cursor-pointer ${
                    index === highlightIndex ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightIndex(index)}
                >
                  {renderOption ? renderOption(option) : option.label}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No matches found</li>
            )}
          </ul>
        )}
      </div>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v.value}
              className="px-2 py-1 bg-blue-500 text-white text-sm rounded-md"
            >
              {v.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
