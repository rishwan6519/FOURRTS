import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import History from '@/models/History';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  try {
    // Fetch last 100 entries for the device
    const history = await History.find({ deviceId: id })
      .sort({ timestamp: -1 })
      .limit(100);
      
    // Format for frontend (reversing back to chronological for charts)
    const formattedHistory = history.map(h => ({
      timestamp: h.timestamp,
      ...(h.data instanceof Map ? Object.fromEntries(h.data) : h.data)
    })).reverse();
    
    return NextResponse.json(formattedHistory);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
