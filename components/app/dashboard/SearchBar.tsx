import { useEffect, useRef, useState } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { useAI } from "@/app/context/AIContext";
import { Button } from "@/components/ui/Button";

export default function SearchBar({
  onSearch,
  delay = 150,
  onSmartOrganize,
}: {
  onSearch: (term: string) => void;
  delay?: number;
  onSmartOrganize?: () => void;
}) {
  const [value, setValue] = useState("");
  const timer = useRef<number | null>(null);
  const { isLoading } = useAI();

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSearch(v), delay);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="flex gap-2 w-full">
      <div className="rounded-full overflow-hidden shadow-sm border border-border bg-card flex items-center h-11 px-4 flex-1">
        <Search className="text-primary w-5 h-5" />
        <input
          className="flex-1 ml-2 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          placeholder="Search passwords, usernames..."
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Search credentials"
        />
        {value && (
          <button
            onClick={handleClear}
            className="ml-2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {onSmartOrganize && (
        <Button
          variant="outline"
          className="h-11 rounded-full px-4 gap-2 border-border shadow-sm hidden md:flex"
          onClick={onSmartOrganize}
          disabled={isLoading}
          title="AI Smart Organize"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Organize</span>
        </Button>
      )}
    </div>
  );
}
