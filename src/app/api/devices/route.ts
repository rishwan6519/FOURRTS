import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Device from '@/models/Device';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const dashboardOnly = searchParams.get('dashboardOnly') === 'true';
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const query: any = { owner: userId };
    
    // Mode: Dashboard view only returns non-hidden devices
    if (dashboardOnly) {
      query.showOnDashboard = { $ne: false };
    }

    // Sort by lastUpdate - Latest data devices come first
    const devices = await Device.find(query).sort({ lastUpdate: -1 });
    return NextResponse.json(devices);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
