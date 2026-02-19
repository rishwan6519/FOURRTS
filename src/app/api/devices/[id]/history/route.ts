import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import History from '@/models/History';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range'); // '24h' (default) or 'all' (for reports)

  try {
    let query: any = { deviceId: id };
    
    // Default to 24 hours unless 'all' is specified (used for reports)
    if (range !== 'all') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.timestamp = { $gte: twentyFourHoursAgo };
    }
    
    // Fetch entries based on the query, sorted descending
    // We limit to 2000 for safety, which is plenty for 24h at high frequency
    const history = await History.find(query)
      .sort({ timestamp: -1 })
      .limit(range === 'all' ? 5000 : 1440); 
      
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
