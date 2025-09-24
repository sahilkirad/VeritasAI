import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    let allowedTypes: string[] = [];
    let maxSize = 30 * 1024 * 1024; // 30MB default
    
    switch (type) {
      case 'deck':
        allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        break;
      case 'video':
        allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime'];
        maxSize = 100 * 1024 * 1024; // 100MB for videos
        break;
      case 'audio':
        allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/m4a'];
        maxSize = 50 * 1024 * 1024; // 50MB for audio
        break;
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Please upload only ${type === 'deck' ? 'PDF or PowerPoint' : type === 'video' ? 'video' : 'audio'} files.` 
      }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Please upload files smaller than ${Math.round(maxSize / (1024 * 1024))}MB.` 
      }, { status: 400 });
    }

    // Convert file to base64 for backend processing
    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');

    // Get the backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_ON_FILE_UPLOAD_URL;
    
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_ON_FILE_UPLOAD_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Backend configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Call your deployed Python function using environment variable
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        content_type: type,
        file_data: base64Data,
        timestamp: Date.now(),
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend processing failed:', errorText);
      return NextResponse.json(
        { error: 'Backend processing failed. Please try again.' },
        { status: 500 }
      );
    }

    const result = await backendResponse.json();

    return NextResponse.json({
      success: true,
      url: result.download_url || result.url || 'uploaded',
      fileName: result.file_name || file.name,
      type: type,
      message: 'File uploaded and processing started',
      memoId: result.memo_id || `memo_${Date.now()}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}