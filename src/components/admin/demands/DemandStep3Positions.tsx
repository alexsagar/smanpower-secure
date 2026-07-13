import React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

export function DemandStep3Positions({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const addPosition = () => {
    const newPositions = [
      ...(data.positions || []),
      {
        id: `temp_${Date.now()}`,
        title: "",
        totalCount: 1,
        salaryCurrency: "AED",
        salaryAmount: "",
        nprEquivalent: "",
        foodFacilityStatus: "NOT_PROVIDED",
        accommodationStatus: "NOT_PROVIDED",
        overtimeStatus: "NOT_SPECIFIED",
        workHoursPerDay: "8",
        workDaysPerWeek: "6",
      },
    ];
    updateData({ positions: newPositions });
  };

  const removePosition = (id: string) => {
    const newPositions = data.positions.filter((p: any) => p.id !== id);
    updateData({ positions: newPositions });
  };

  const updatePosition = (id: string, field: string, value: any) => {
    const newPositions = data.positions.map((p: any) => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    updateData({ positions: newPositions });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-bold font-serif mb-1">Vacancy Positions</h3>
          <p className="text-sm text-brand-charcoal/70">Add the specific job roles and headcounts required.</p>
        </div>
        <button
          onClick={addPosition}
          className="flex items-center gap-2 bg-brand-gold text-brand-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-brand-black hover:text-brand-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Position
        </button>
      </div>

      {!data.positions || data.positions.length === 0 ? (
        <div className="border-2 border-dashed border-brand-charcoal/20 p-12 text-center rounded-sm">
          <h4 className="font-bold text-brand-black mb-1">No positions added</h4>
          <p className="text-sm text-brand-charcoal/60 mb-4">Add at least one position to this demand.</p>
          <button
            onClick={addPosition}
            className="text-sm font-bold text-brand-gold hover:text-brand-black transition-colors"
          >
            + Add First Position
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.positions.map((pos: any, index: number) => (
            <div key={pos.id} className="border border-brand-charcoal/20 rounded-sm bg-white overflow-hidden shadow-sm">
              <div className="bg-brand-charcoal/5 px-4 py-3 border-b border-brand-charcoal/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-brand-charcoal/30 cursor-move" />
                  <span className="font-bold text-sm uppercase tracking-wider text-brand-black">Position {index + 1}</span>
                </div>
                <button
                  onClick={() => removePosition(pos.id)}
                  className="text-red-500 hover:text-red-700 transition-colors text-sm font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>

              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Position Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={pos.title}
                    onChange={(e) => updatePosition(pos.id, "title", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                    placeholder="e.g. Security Guard"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Total Count <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={pos.totalCount}
                    onChange={(e) => updatePosition(pos.id, "totalCount", parseInt(e.target.value) || 1)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                    min="1"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Currency <span className="text-red-500">*</span></label>
                  <select
                    value={pos.salaryCurrency}
                    onChange={(e) => updatePosition(pos.id, "salaryCurrency", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                  >
                    <option value="AED">AED</option>
                    <option value="SAR">SAR</option>
                    <option value="QAR">QAR</option>
                    <option value="OMR">OMR</option>
                    <option value="BHD">BHD</option>
                    <option value="KWD">KWD</option>
                    <option value="MYR">MYR</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Salary Amount <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={pos.salaryAmount}
                    onChange={(e) => updatePosition(pos.id, "salaryAmount", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                    placeholder="e.g. 1200"
                    required
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">NPR Equivalent (Approx)</label>
                  <input
                    type="text"
                    value={pos.nprEquivalent || ""}
                    onChange={(e) => updatePosition(pos.id, "nprEquivalent", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                    placeholder="e.g. ~44,000"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Food</label>
                  <select
                    value={pos.foodFacilityStatus}
                    onChange={(e) => updatePosition(pos.id, "foodFacilityStatus", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                  >
                    <option value="PROVIDED">Provided</option>
                    <option value="NOT_PROVIDED">Not Provided</option>
                    <option value="ALLOWANCE_PROVIDED">Allowance Provided</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Accommodation</label>
                  <select
                    value={pos.accommodationStatus}
                    onChange={(e) => updatePosition(pos.id, "accommodationStatus", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                  >
                    <option value="PROVIDED">Provided</option>
                    <option value="NOT_PROVIDED">Not Provided</option>
                    <option value="ALLOWANCE_PROVIDED">Allowance Provided</option>
                  </select>
                </div>
                <div className="md:col-span-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Hours/Day</label>
                    <input
                      type="number"
                      value={pos.workHoursPerDay || ""}
                      onChange={(e) => updatePosition(pos.id, "workHoursPerDay", e.target.value)}
                      className="w-full border border-brand-charcoal/20 rounded-sm text-sm px-2 py-1.5"
                      min="1"
                      max="24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Days/Week</label>
                    <input
                      type="number"
                      value={pos.workDaysPerWeek || ""}
                      onChange={(e) => updatePosition(pos.id, "workDaysPerWeek", e.target.value)}
                      className="w-full border border-brand-charcoal/20 rounded-sm text-sm px-2 py-1.5"
                      min="1"
                      max="7"
                    />
                  </div>
                </div>

                <div className="md:col-span-8">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Min Qualification</label>
                  <input
                    type="text"
                    value={pos.minimumQualification || ""}
                    onChange={(e) => updatePosition(pos.id, "minimumQualification", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                    placeholder="e.g. SLC pass or relevant experience"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Other Benefits</label>
                  <input
                    type="text"
                    value={pos.otherBenefits || ""}
                    onChange={(e) => updatePosition(pos.id, "otherBenefits", e.target.value)}
                    className="w-full border border-brand-charcoal/20 rounded-sm text-sm px-2 py-1.5"
                    placeholder="e.g. Medical, Insurance"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
