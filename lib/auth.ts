import { type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "secretkey123";

interface DecodedToken {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Extracts and verifies JWT from request cookies.
 * @param request - The Next.js request object.
 * @returns The user ID from the token, or null if invalid or not found.
 */
export const getUserIdFromRequest = (request: NextRequest): number | null => {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log("No token found in cookies.");
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded.id;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
};
