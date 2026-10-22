import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <div className="text-[#003366]">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
