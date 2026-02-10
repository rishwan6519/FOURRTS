import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Device from '@/models/Device';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  try {
    console.log('Searching for deviceId:', id);
    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      console.log('Device NOT found in DB for ID:', id);
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    // Map MongoDB fields to frontend expectations
    const formattedDevice = {
      ...device.toObject(),
      id: device.deviceId
    };
    
    return NextResponse.json(formattedDevice);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch device' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  try {
    const body = await req.json();
    const updatedDevice = await Device.findOneAndUpdate(
      { deviceId: id },
      { $set: body },
      { new: true }
    );
    
    if (!updatedDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedDevice);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 });
  }
}
