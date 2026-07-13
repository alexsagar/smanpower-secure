import { notFound } from "next/navigation";
import { TrainingForm } from "@/components/admin/TrainingForm";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function NewTrainingPage() {
  notFound();
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <GraduationCap className="w-3 h-3" /> Module // Training // New
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Add Training Facility
          </h1>
          <p className="text-brand-muted mt-2">
            Register a new training center or facility in the database.
          </p>
        </div>
        <div>
          <Link href="/admin/training" className="text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
            Back to Training
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-8 shadow-sm">
        <TrainingForm />
      </div>
    </div>
  );
}
