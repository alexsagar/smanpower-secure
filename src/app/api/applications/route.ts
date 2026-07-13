import { NextRequest, NextResponse } from 'next/server';
import { ApplicationSubmissionService } from '@/services/applicationSubmission.service';
import { getClientIpFromRequest } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  if (process.env.PUBLIC_APPLICATIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Applications are currently disabled' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const ipAddress = getClientIpFromRequest(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const result = await ApplicationSubmissionService.submitApplication(formData, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Validation failed', code: result.formError },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({ success: true, applicationId: result.applicationId });
  } catch (error: unknown) {
    logger.error('Application API Error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

