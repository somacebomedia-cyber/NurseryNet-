import { NextRequest, NextResponse } from 'next/server';
import { extractRealPhotosFromWebsiteUrl } from '@/lib/website-photo-extractor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteUrl = '', schoolName = '' } = body || {};

    if (!websiteUrl.trim() && !schoolName.trim()) {
      return NextResponse.json(
        { error: 'Please provide a preschool website URL or school name.' },
        { status: 400 }
      );
    }

    const result = await extractRealPhotosFromWebsiteUrl(websiteUrl, schoolName);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unable to extract photos from website.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteUrl = searchParams.get('url') || '';
  const schoolName = searchParams.get('name') || '';

  const result = await extractRealPhotosFromWebsiteUrl(websiteUrl, schoolName);
  return NextResponse.json(result);
}
