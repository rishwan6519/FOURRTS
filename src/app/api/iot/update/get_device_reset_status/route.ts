import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Device from '@/models/Device';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const device_code = searchParams.get('device_code');

  if (!device_code) {
    return new Response('Error: device_code required', { status: 400 });
  }

  try {
    const device = await Device.findOne({ deviceId: device_code });
    if (!device) {
      return new Response('0', { status: 404 }); // Return 0 if not found
    }

    // Return ONLY the numeric value as plain text for hardware compatibility
    const status = device.resetStatus === 1 ? '1' : '0';
    return new Response(status, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (err) {
    return new Response('0', { status: 500 });
  }
}
