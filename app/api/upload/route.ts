import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    console.log('Upload request received')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })

    // Validate file size
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) return NextResponse.json({ error: 'File too large' }, { status: 400 })

    // Fetch the user to get current image
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Delete old image from Cloudinary if it exists
    if (user.imageUrl) {
      try {
        // Extract public_id from URL
        const parts = user.imageUrl.split('/')
        const filenameWithExtension = parts[parts.length - 1]
        const public_id = `profile_pics/${filenameWithExtension.split('.')[0]}`

        await cloudinary.uploader.destroy(public_id, { invalidate: true })
        console.log('Old image deleted:', public_id)
      } catch (err) {
        console.warn('Failed to delete old image:', err)
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload new image
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: 'profile_pics',
          resource_type: 'image',
          format: file.type.includes('png') ? 'png' : 'jpg',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ],
          overwrite: true,
          invalidate: true,
          unique_filename: true,
          use_filename: false
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(buffer)
    })

    const imageUrl = (uploadResult as any).secure_url

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { imageUrl },
    })

    return NextResponse.json({ 
      success: true, 
      imageUrl, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        imageUrl: updatedUser.imageUrl
      }
    })

  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 })
  }
}
