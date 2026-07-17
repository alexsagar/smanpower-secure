import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  if (process.env.QA_MODE !== 'true') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const host = request.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Forbidden: QA Mutations are restricted to localhost' }, { status: 403 });
  }

  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl.includes('smanpower_qa')) {
    return NextResponse.json({ error: 'Forbidden: QA Mutations are restricted to the QA database' }, { status: 403 });
  }

  const { action, slug, data } = await request.json();

  try {
    if (action === 'publish') {
      const demand = await prisma.demand.findUnique({ where: { slug } });
      if (demand) {
        await prisma.demand.update({
          where: { id: demand.id },
          data: { status: 'PUBLISHED', isPublic: true, publishedAt: new Date() }
        });
        revalidatePath('/demands');
        revalidatePath(`/demands/${slug}`);
      }
    } else if (action === 'close') {
      const demand = await prisma.demand.findUnique({ where: { slug } });
      if (demand) {
        await prisma.demand.update({
          where: { id: demand.id },
          data: { status: 'CLOSED', enableApplication: false }
        });
        revalidatePath('/demands');
        revalidatePath(`/demands/${slug}`);
      }
    } else if (action === 'archive') {
      const demand = await prisma.demand.findUnique({ where: { slug } });
      if (demand) {
        await prisma.demand.update({
          where: { id: demand.id },
          data: { status: 'ARCHIVED', isPublic: false, deletedAt: new Date() }
        });
        revalidatePath('/demands');
        revalidatePath(`/demands/${slug}`);
      }
    } else if (action === 'update_content') {
      const demand = await prisma.demand.findUnique({ where: { slug } });
      if (demand) {
        await prisma.demand.update({
          where: { id: demand.id },
          data: { companyName: data.companyName }
        });
        revalidatePath('/demands');
        revalidatePath(`/demands/${slug}`);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
