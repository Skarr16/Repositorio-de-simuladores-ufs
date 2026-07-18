import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  existingTags: string[];
  placeholder?: string;
  disabled?: boolean;
}

const normalizeTag = (tag: string) => {
  return tag.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function TagInput({ label, tags, onChange, existingTags, placeholder, disabled }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const normalizedInput = normalizeTag(inputValue);
      const filtered = existingTags.filter(t => 
        normalizeTag(t).includes(normalizedInput) && 
        !tags.some(selected => normalizeTag(selected) === normalizeTag(t))
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, existingTags, tags]);

  const addTag = (tagToAdd: string) => {
    if (disabled) return;
    const normalizedNew = normalizeTag(tagToAdd);
    if (!normalizedNew) return;

    let finalTag = tagToAdd.trim();
    const existingMatch = existingTags.find(t => normalizeTag(t) === normalizedNew);
    if (existingMatch) {
      finalTag = existingMatch;
    } else {
      finalTag = finalTag.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    if (!tags.some(t => normalizeTag(t) === normalizedNew)) {
      onChange([...tags, finalTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="mb-6 relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className={`flex flex-wrap gap-2 p-2 border rounded-lg bg-white transition-all ${disabled ? 'bg-gray-50 border-gray-200' : 'border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'}`}>
        {tags.map(tag => (
          <span key={tag} className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(tags.filter(t => t !== tag))}
                className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="flex-1 outline-none min-w-[120px] bg-transparent text-sm p-1"
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && !disabled && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {suggestions.map(suggestion => (
            <li
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-700"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-500 mt-1">Pressione Enter para adicionar</p>
    </div>
  );
}
