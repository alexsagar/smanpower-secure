import { getAdminMediaAssets } from "@/services/admin.service";
import { Image as ImageIcon, Folder, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";

export default async function AdminMediaPage() {
  const assets = await getAdminMediaAssets();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> Module // Assets
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Media Library
          </h1>
          <p className="text-brand-muted mt-2">
            Manage high-resolution photography, videos, and brand assets.
          </p>
        </div>
        <div>
          <MediaUploader cloudName={process.env.CLOUDINARY_CLOUD_NAME} />
        </div>
      </div>

      {/* Visual Analytics Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-brand-black text-white border border-brand-black p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-white/40 uppercase tracking-widest font-semibold mb-4">Total Assets</span>
            <div className="text-4xl font-light tracking-tight">{assets.length}</div>
          </div>
        </div>
        
        <div className="bg-white border border-brand-charcoal/5 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">Approved Imagery</span>
            <div className="text-4xl font-light text-brand-black tracking-tight">
              {assets.filter((a: any) => a.status === 'REAL_APPROVED').length}
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-charcoal/5 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">AI Placeholders</span>
            <div className="text-4xl font-light text-brand-black tracking-tight flex items-center gap-3">
              {assets.filter(a => a.status === 'AI_PLACEHOLDER').length}
              {assets.filter(a => a.status === 'AI_PLACEHOLDER').length > 0 && (
                <AlertCircle className="w-5 h-5 text-brand-gold" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-charcoal/5 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <Folder className="w-4 h-4 text-brand-charcoal/30" /> Storage Used
            </span>
            <div className="text-4xl font-light text-brand-black tracking-tight">
              {(assets.reduce((acc, curr: any) => acc + ((curr as any).fileSize || 0), 0) / (1024 * 1024)).toFixed(1)} <span className="text-lg text-brand-muted">MB</span>
            </div>
          </div>
        </div>
      </div>

      <MediaLibraryClient initialAssets={assets} />
    </div>
  );
}
