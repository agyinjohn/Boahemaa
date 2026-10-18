import { ChevronDown, ChevronUp } from "lucide-react";
import { moveItem } from "@/app/actions";

/** Up/down buttons to reorder a team member or project. */
export function OrderButtons({ kind, id, first, last }: { kind: "team" | "projects"; id: string; first: boolean; last: boolean }) {
  return (
    <div className="flex flex-col">
      {(["up", "down"] as const).map((direction) => (
        <form key={direction} action={moveItem}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="direction" value={direction} />
          <button
            disabled={direction === "up" ? first : last}
            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-sand hover:text-forest-900 disabled:opacity-25"
            aria-label={direction === "up" ? "Move up" : "Move down"}
          >
            {direction === "up" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </form>
      ))}
    </div>
  );
}
