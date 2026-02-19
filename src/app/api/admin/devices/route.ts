import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Device from '@/models/Device';
import User from '@/models/User';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { userId, type, count } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const devices: any[] = [];
    const baseIdNum = Math.floor(10000000 + Math.random() * 90000000); // Random starting point

    const sensors = type === 'RST' 
      ? [
          { field: 'field1', name: 'Temperature', unit: '°C', min: 20, max: 25 },
          { field: 'field2', name: 'Humidity', unit: '%', min: 30, max: 45 }
        ]
      : [
          { field: 'field1', name: 'Differential Pressure', unit: 'Pa', min: -2, max: 2 }
        ];

    for (let i = 1; i <= count; i++) {
      const deviceId = `${type}${baseIdNum + i}`;
      const device = await Device.create({
        deviceId,
        displayName: `${type} Device ${i}`,
        type,
        sensors,
        owner: userId,
      });
      devices.push(device);
    }

    return NextResponse.json(devices);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create devices' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const devices = await Device.find({ owner: userId }).sort({ createdAt: -1 });
    return NextResponse.json(devices);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId');

  if (!deviceId) {
    return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
  }

  try {
    const deleted = await Device.findOneAndDelete({ deviceId });
    if (!deleted) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Device deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 });
  }
}
