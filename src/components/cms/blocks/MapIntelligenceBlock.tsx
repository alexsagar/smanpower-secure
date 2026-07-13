import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import TalentDashboard from "@/components/dashboard/TalentDashboard";

export function MapIntelligenceBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const prefix = `/${lang}`;
  
  return (
    <>
      {/* SECTION 9: NEPAL TALENT INTELLIGENCE */}
      <TalentDashboard />


      
    </>
  );
}
