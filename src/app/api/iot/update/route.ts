import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Device from '@/models/Device';
import History from '@/models/History';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('device_code');
  
  // Parse timestamp from query or default to now
  let timestampDate = new Date();
  const queryTimestamp = searchParams.get('timestamp');
  if (queryTimestamp) {
    // If hardware sends a local string without TZ, assume IST (+05:30)
    const tzFix = (queryTimestamp.includes('T') || queryTimestamp.includes('Z') || queryTimestamp.includes('+')) 
      ? queryTimestamp 
      : `${queryTimestamp} +05:30`;
    
    const parsed = new Date(tzFix);
    if (!isNaN(parsed.getTime())) {
      timestampDate = parsed;
    }
  }

  if (!deviceId) {
    return NextResponse.json({ error: 'device_code is required' }, { status: 400 });
  }

  try {
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const data: any = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('field')) {
        data[key] = parseFloat(value);
      }
    });
    
    // Log for debug (hardware integration verification)
    console.log(`Payload from ${deviceId}:`, data,queryTimestamp,"new time stamp",timestampDate);

    // Record raw measurement in History Audit Log
    await History.create({
      deviceId,
      timestamp: timestampDate,
      data
    });

    // Update Live Registry (Heartbeat & Latest Measurements)
    // We use findOneAndUpdate to ensure the record is updated if it exists
    await Device.findOneAndUpdate(
      { deviceId }, 
      { 
        $max: { lastUpdate: timestampDate },
        $set: { 
          lastSeen: new Date(),
          lastData: data 
        } 
      }
    );

    // Return the EXACT status response requested by hardware protocol
    return NextResponse.json({ "status": true });
  } catch (err) {
    console.error('Handshake Error:', err);
    return NextResponse.json({ "status": "false", "error": "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}

