"use client";

import React, { useState, useActionState, useEffect, useRef } from "react";
import Script from "next/script";
import { Upload, AlertCircle, CheckCircle, Loader2, FileText, X } from "lucide-react";
import { applyToCareerAction } from "@/actions/career-applications";

interface CareerApplyFormProps {
  careerOpeningId: string;
}

// Floating label wrapper component
const InputWrapper = ({ children, label, required, value }: any) => (
  <div className="relative group">
    {children}
    <label className={`absolute left-4 transition-all duration-300 pointer-events-none text-brand-charcoal/50
      ${value ? "top-2 text-[10px] uppercase tracking-widest font-bold" : "top-4 text-sm"}
      group-focus-within:top-2 group-focus-within:text-[10px] group-focus-within:uppercase group-focus-within:tracking-widest group-focus-within:font-bold group-focus-within:text-brand-gold
    `}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  </div>
);

export function CareerApplyForm({ careerOpeningId }: CareerApplyFormProps) {
  const [state, formAction, isPending] = useActionState(applyToCareerAction, null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    coverLetter: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state?.success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (state?.success) {
    return (
      <div className="bg-white border border-green-200 p-12 text-center shadow-2xl shadow-green-900/5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600" />
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-bold font-serif mb-4 text-green-950 tracking-tight">Application Submitted!</h2>
        <p className="text-green-800/80 max-w-lg mx-auto text-lg">
          Thank you for applying. Our talent acquisition team will review your profile and get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white border border-brand-charcoal/10 rounded-2xl p-8 md:p-12 mt-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden" aria-busy={isPending}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold via-brand-gold/80 to-brand-gold/40" />
      
      <div className="mb-10 text-center">
        <h3 className="text-3xl font-bold font-serif mb-3 text-brand-black tracking-tight">Join the Team</h3>
        <p className="text-brand-charcoal/60 text-lg">Submit your details below to apply for this position.</p>
      </div>

      <input type="hidden" name="careerOpeningId" value={careerOpeningId} />
      
      {state?.formError && (
        <div className="bg-red-50/50 text-red-800 p-4 rounded-xl border border-red-100 mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold text-sm">{state.formError}</p>
            <p className="text-sm opacity-90">{state.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <InputWrapper label="Full Name" required value={formData.fullName}>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full bg-brand-off-white border-transparent focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 rounded-xl pt-6 pb-2 px-4 transition-all outline-none text-brand-black font-medium"
          />
        </InputWrapper>
        
        <InputWrapper label="Email Address" required value={formData.email}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-brand-off-white border-transparent focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 rounded-xl pt-6 pb-2 px-4 transition-all outline-none text-brand-black font-medium"
          />
        </InputWrapper>

        <div className="md:col-span-2">
          <InputWrapper label="Phone Number" required value={formData.phone}>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full bg-brand-off-white border-transparent focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 rounded-xl pt-6 pb-2 px-4 transition-all outline-none text-brand-black font-medium"
            />
          </InputWrapper>
        </div>
      </div>

      <div className="mb-8">
        <InputWrapper label="Cover Letter / Message (Optional)" required={false} value={formData.coverLetter}>
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            rows={5}
            className="w-full bg-brand-off-white border-transparent focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 rounded-xl pt-7 pb-3 px-4 transition-all outline-none text-brand-black font-medium resize-none"
          />
        </InputWrapper>
      </div>

      <div className="mb-10">
        <label className="block text-xs font-bold text-brand-charcoal/50 mb-3 uppercase tracking-widest pl-1">
          Resume / CV <span className="text-red-500">*</span>
        </label>
        
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[160px]
            ${dragActive ? "border-brand-gold bg-brand-gold/5 scale-[1.01]" : "border-brand-charcoal/20 bg-brand-off-white/50 hover:bg-brand-off-white hover:border-brand-charcoal/40"}
            ${file ? "border-solid border-green-500/30 bg-green-50/30" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isPending && !file && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            name="cvFile" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf" 
            className="hidden" 
            disabled={isPending}
          />
          
          {file ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-4 relative group">
                <FileText className="w-8 h-8 text-green-600" />
                <button 
                  type="button" 
                  disabled={isPending}
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md disabled:opacity-40"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="font-semibold text-brand-black text-sm max-w-[200px] truncate">{file.name}</p>
              <p className="text-xs text-brand-charcoal/50 mt-1 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-brand-gold" />
              </div>
              <p className="font-semibold text-brand-black text-sm">
                Click to upload <span className="font-normal text-brand-charcoal/70">or drag and drop</span>
              </p>
              <p className="text-xs text-brand-charcoal/50 mt-2 font-mono uppercase tracking-wider">PDF only (Max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true" && (
        <div className="mb-10 flex justify-center transform scale-95 origin-center">
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !file}
        aria-busy={isPending}
        className="w-full relative overflow-hidden group bg-brand-black text-brand-white py-5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_-10px_rgba(0,0,0,0.4)] hover:shadow-[0_0_60px_-15px_rgba(212,175,55,0.6)]"
      >
        <div className="absolute inset-0 bg-brand-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-brand-black transition-colors duration-300">
          {isPending ? (
            <><Loader2 className="w-5 h-5 motion-safe:animate-spin motion-reduce:animate-none" /> Submitting...</>
          ) : (
            "Submit Application"
          )}
        </span>
      </button>
    </form>
  );
}
