import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth'; // Import the new auth helper

// Zod schema for password validation
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters long."),
}).refine(data => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
});


export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if(!validation.success) {
        return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || !user.password) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 1. Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 403 });
    }

    // 2. Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update the password in the database
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedNewPassword,
        },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

