import { ChevronDown } from "lucide-react";

export default function SelectChevron() {
  return (
    <span className="pointer-events-none absolute bottom-1.5 right-1.5 top-1.5 flex w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
      <ChevronDown size={20} strokeWidth={2.5} />
    </span>
  );
}
