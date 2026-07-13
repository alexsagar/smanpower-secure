"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/actions/forms";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { CheckCircle, AlertCircle } from "lucide-react";

const initialState: ContactFormState = { success: false };

interface ContactFormProps {
  dict: Record<string, Record<string, string>>;
}

export function ContactForm({ dict }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState
  );

  if (state.success) {
    return (
      <div className="bg-brand-off-white border border-brand-charcoal/5 p-12 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-brand-black mb-2">
          Message Sent
        </h3>
        <p className="text-brand-muted text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.message && !state.success && (
        <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-500/30 text-sm text-red-200 rounded-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group">
          <Input id="name" name="name" required error={state.errors?.name?.[0]} className="peer bg-white border-brand-charcoal/10 text-brand-black placeholder-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all duration-300 pt-6 pb-2" placeholder=" " />
          <Label htmlFor="name" required className="absolute left-3 top-2 text-[10px] uppercase tracking-widest text-brand-gold/80 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-gold">{dict.common.fullName || dict.common.name}</Label>
        </div>
        <div className="relative group">
          <Input id="email" name="email" type="email" required error={state.errors?.email?.[0]} className="peer bg-white border-brand-charcoal/10 text-brand-black placeholder-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all duration-300 pt-6 pb-2" placeholder=" " />
          <Label htmlFor="email" required className="absolute left-3 top-2 text-[10px] uppercase tracking-widest text-brand-gold/80 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-gold">{dict.common.email}</Label>
        </div>
        <div className="relative group">
          <Input id="phone" name="phone" type="tel" className="peer bg-white border-brand-charcoal/10 text-brand-black placeholder-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all duration-300 pt-6 pb-2" placeholder=" " />
          <Label htmlFor="phone" className="absolute left-3 top-2 text-[10px] uppercase tracking-widest text-brand-gold/80 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-gold">{dict.common.phone}</Label>
        </div>
        <div className="relative group">
          <Input id="company" name="company" className="peer bg-white border-brand-charcoal/10 text-brand-black placeholder-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all duration-300 pt-6 pb-2" placeholder=" " />
          <Label htmlFor="company" className="absolute left-3 top-2 text-[10px] uppercase tracking-widest text-brand-gold/80 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-gold">Company</Label>
        </div>
      </div>

      <div className="relative group">
        <Input id="subject" name="subject" className="peer bg-white border-brand-charcoal/10 text-brand-black placeholder-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all duration-300 pt-6 pb-2" placeholder=" " />
        <Label htmlFor="subject" className="absolute left-3 top-2 text-[10px] uppercase tracking-widest text-brand-gold/80 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-gold">Subject</Label>
      </div>

      <div className="relative group">
        <Textarea id="message" name="message" required rows={6} error={state.errors?.message?.[0]} className="peer bg-white border-brand-charcoal/10 text-brand-black placeholder-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all duration-300 pt-8" placeholder=" " />
        <Label htmlFor="message" required className="absolute left-3 top-3 text-[10px] uppercase tracking-widest text-brand-gold/80 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-brand-gold">{dict.common.message || dict.contact?.message || "Message"}</Label>
      </div>

      <Button type="submit" className="w-full bg-brand-gold text-white hover:bg-brand-black hover:text-white transition-colors duration-500 font-semibold tracking-widest uppercase py-6" disabled={pending}>
        {pending ? "Sending..." : (dict.common.submit || dict.common.send || "Send Message")}
      </Button>
    </form>
  );
}
