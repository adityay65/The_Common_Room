import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth'; // Import the new auth helper

// Zod schema for input validation
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(100, "Name is too long."),
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional().nullable(),
  hobbies: z.string().max(200, "Hobbies cannot exceed 200 characters.").optional().nullable(),
});

export async function PATCH(request: NextRequest) { // Changed to NextRequest
  try {
    // Authenticate user using the JWT from the cookie
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = updateProfileSchema.safeParse({
        name: body.name,
        bio: body.bio,
        hobbies: body.hobbies
    });

    if(!validation.success) {
        return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { name, bio, hobbies } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Use the id from the token, not clerkId
      data: {
        name,
        bio,
        hobbies,
      },
      select: { // Select only the fields needed by the client
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        bio: true,
        hobbies: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

