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
    const updatedDevice = await Device.findOneAndUpdate(
      { deviceId: device_code },
      { $set: { resetStatus: 0 } },
      { new: true }
    );

    if (!updatedDevice) {
      return new Response('Error: Device not found', { status: 404 });
    }

    // Return 0 to confirm the status has been cleared back to idle
    return new Response('0', {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (err) {
    return new Response('Error', { status: 500 });
  }
}
