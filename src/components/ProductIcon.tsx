import { CarFront, HeartPulse, Sprout, Store, type LucideProps } from "lucide-react";

const icons = { HeartPulse, Sprout, CarFront, Store };

export function ProductIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? HeartPulse;
  return <Icon {...props} />;
}
