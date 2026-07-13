import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AlertTriangle, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.demandApplication.findUnique({
    where: { id },
    include: {
      candidate: {
        include: {
          documents: true
        }
      }
    }
  });

  if (!application) notFound();

  const { candidate } = application;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-brand-charcoal/10 pb-6">
        <div>
          <h1 className="text-3xl font-semibold text-brand-black tracking-tight mb-2">
            Application Details
          </h1>
          <div className="flex items-center gap-4 text-sm text-brand-muted">
            <span>Submitted: {new Date(application.createdAt).toLocaleDateString()}</span>
            <span className="px-2 py-1 bg-brand-stone/50 rounded-md font-medium text-brand-charcoal">
              Status: {application.status}
            </span>
          </div>
        </div>
        <Link 
          href="/admin/applications"
          className="px-4 py-2 border border-brand-charcoal/20 rounded-lg text-sm font-medium hover:bg-brand-stone transition-colors"
        >
          Back to List
        </Link>
      </div>

      {application.possibleDuplicate && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">Possible Duplicate Detected</h3>
            <p className="text-sm mt-1 opacity-90">
              This candidate shares a phone number or email with an existing profile. Please verify before processing.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-brand-charcoal/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-brand-off-white px-6 py-4 border-b border-brand-charcoal/5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Candidate Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">Full Name</label>
                <div className="font-medium text-brand-charcoal">{candidate.fullName}</div>
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">Contact</label>
                <div className="font-medium text-brand-charcoal">{candidate.phone}</div>
                {candidate.email && <div className="text-sm text-brand-muted">{candidate.email}</div>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">Province</label>
                  <div className="font-medium text-brand-charcoal">{application.provinceSnapshot || '-'}</div>
                </div>
                <div>
                  <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">District</label>
                  <div className="font-medium text-brand-charcoal">{application.districtSnapshot || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-brand-charcoal/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-brand-off-white px-6 py-4 border-b border-brand-charcoal/5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Professional Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">Education</label>
                <div className="font-medium text-brand-charcoal">{application.education || '-'}</div>
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">Experience</label>
                <div className="font-medium text-brand-charcoal">{application.experience || '-'}</div>
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">Skills</label>
                <div className="font-medium text-brand-charcoal">{application.skills || '-'}</div>
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase tracking-wider block mb-1">Passport Status</label>
                <div className="font-medium text-brand-charcoal">{application.passportStatus || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-brand-charcoal/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-brand-off-white px-6 py-4 border-b border-brand-charcoal/5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Submitted Documents</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-amber-800">
                  This document has not been malware-scanned. Open/download only if authorized and necessary.
                </p>
              </div>

              {candidate.documents && candidate.documents.length > 0 ? (
                <div className="space-y-3">
                  {candidate.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-brand-charcoal/10 rounded-xl hover:bg-brand-off-white transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-brand-muted" />
                        <div>
                          <div className="text-sm font-semibold text-brand-charcoal">{doc.documentType}</div>
                          <div className="text-xs text-brand-muted uppercase">{doc.status}</div>
                        </div>
                      </div>
                      <a 
                        href={`/api/documents/${doc.id}/view`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-2 text-brand-muted hover:text-brand-black hover:bg-brand-stone/50 rounded-lg transition-colors"
                        title="Secure View/Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-brand-muted text-sm">
                  No documents were uploaded with this application.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-brand-charcoal/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-brand-off-white px-6 py-4 border-b border-brand-charcoal/5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Consents & Disclosures</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                {application.demandDetailsRead ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                <span className="text-sm text-brand-charcoal">Read Demand Details</span>
              </div>
              <div className="flex items-start gap-3">
                {application.privacyConsentGiven ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                <span className="text-sm text-brand-charcoal">Privacy Consent Given</span>
              </div>
              <div className="flex items-start gap-3">
                {application.safetyAcknowledgement ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                <span className="text-sm text-brand-charcoal">Acknowledged Safety Notice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
