'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Mic, Video, FileText, CheckCircle, AlertTriangle, Camera, MicIcon, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useRef, useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { uploadFile, API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Info } from "lucide-react";

// Enhanced file type with processing status and scores
interface UploadedFile {
    file: File;
    status: 'uploading' | 'processing' | 'processed' | 'error';
    uploadTime: Date;
    fileName?: string; // Firebase storage filename
    memoId?: string; // Memo 1 ID from ingestionResults
    diligenceId?: string; // Diligence ID from diligenceResults
    error?: string;
}

export default function DocumentsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoFileInputRef = useRef<HTMLInputElement>(null);
    const audioFileInputRef = useRef<HTMLInputElement>(null);
    
    // Helper function to update file status with proper typing
    const updateFileStatus = (files: UploadedFile[], targetFile: File, updates: Partial<UploadedFile>): UploadedFile[] => {
        return files.map(f => f.file === targetFile ? { ...f, ...updates } : f);
    };
    
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [activeTab, setActiveTab] = useState("deck");
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [uploadedVideoFiles, setUploadedVideoFiles] = useState<UploadedFile[]>([]);
    const [uploadedAudioFiles, setUploadedAudioFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);

    // Function to check processing status and get scores
    const checkProcessingStatus = async (uploadedFile: UploadedFile) => {
        try {
            // Check if we have a memo ID, if not, try to find it by filename
            let memoId = uploadedFile.memoId;
            
            if (!memoId && uploadedFile.fileName) {
                // Search for memo by filename in ingestionResults
                const response = await fetch(`${API_ENDPOINTS.CHECK_MEMO}?fileName=${encodeURIComponent(uploadedFile.fileName)}`);
                const data = await response.json();
                if (data.memoId) {
                    memoId = data.memoId;
                    // Update the file with memo ID
                    const updateFile = (files: UploadedFile[]) => 
                        files.map(f => f.file === uploadedFile.file ? { ...f, memoId } : f);
                    
                    setUploadedFiles(updateFile);
                    setUploadedVideoFiles(updateFile);
                    setUploadedAudioFiles(updateFile);
                }
            }

            if (memoId) {
                // Check diligence results for this memo
                const diligenceResponse = await fetch(`${API_ENDPOINTS.CHECK_DILIGENCE}?memoId=${memoId}`);
                const diligenceData = await diligenceResponse.json();
                
                if (diligenceData.status === 'completed') {
                    // Update file status to processed (without score)
                    setUploadedFiles(prev => updateFileStatus(prev, uploadedFile.file, { 
                        status: 'processed', 
                        diligenceId: diligenceData.diligenceId
                    }));
                    setUploadedVideoFiles(prev => updateFileStatus(prev, uploadedFile.file, { 
                        status: 'processed', 
                        diligenceId: diligenceData.diligenceId
                    }));
                    setUploadedAudioFiles(prev => updateFileStatus(prev, uploadedFile.file, { 
                        status: 'processed', 
                        diligenceId: diligenceData.diligenceId
                    }));
                } else if (diligenceData.status === 'error') {
                    // Update file status to error
                    setUploadedFiles(prev => updateFileStatus(prev, uploadedFile.file, { 
                        status: 'error',
                        error: diligenceData.error
                    }));
                    setUploadedVideoFiles(prev => updateFileStatus(prev, uploadedFile.file, { 
                        status: 'error',
                        error: diligenceData.error
                    }));
                    setUploadedAudioFiles(prev => updateFileStatus(prev, uploadedFile.file, { 
                        status: 'error',
                        error: diligenceData.error
                    }));
                }
            }
        } catch (error) {
            console.error('Error checking processing status:', error);
        }
    };

    // Poll for processing status updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Check all files that are currently processing
            [...uploadedFiles, ...uploadedVideoFiles, ...uploadedAudioFiles]
                .filter(f => f.status === 'processing')
                .forEach(f => checkProcessingStatus(f));
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [uploadedFiles, uploadedVideoFiles, uploadedAudioFiles]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'deck' | 'video' | 'audio') => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Create uploaded file object with initial status
                const uploadedFile: UploadedFile = {
                    file,
                    status: 'uploading',
                    uploadTime: new Date()
                };

                // Add to appropriate state immediately
                switch (type) {
                    case 'deck':
                        setUploadedFiles(prev => [...prev, uploadedFile]);
                        break;
                    case 'video':
                        setUploadedVideoFiles(prev => [...prev, uploadedFile]);
                        break;
                    case 'audio':
                        setUploadedAudioFiles(prev => [...prev, uploadedFile]);
                        break;
                }

                // Validate file type based on category
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
                    // Update status to error
                    switch (type) {
                        case 'deck':
                            setUploadedFiles(prev => updateFileStatus(prev, file, { status: 'error', error: 'Invalid file type' }));
                            break;
                        case 'video':
                            setUploadedVideoFiles(prev => updateFileStatus(prev, file, { status: 'error', error: 'Invalid file type' }));
                            break;
                        case 'audio':
                            setUploadedAudioFiles(prev => updateFileStatus(prev, file, { status: 'error', error: 'Invalid file type' }));
                            break;
                    }
                    
                    toast({
                        variant: 'destructive',
                        title: 'Invalid File Type',
                        description: `Please upload only ${type === 'deck' ? 'PDF or PowerPoint' : type === 'video' ? 'video' : 'audio'} files.`,
                    });
                    continue;
                }

                if (file.size > maxSize) {
                    // Update status to error
                    switch (type) {
                        case 'deck':
                            setUploadedFiles(prev => updateFileStatus(prev, file, { status: 'error', error: 'File too large' }));
                            break;
                        case 'video':
                            setUploadedVideoFiles(prev => updateFileStatus(prev, file, { status: 'error', error: 'File too large' }));
                            break;
                        case 'audio':
                            setUploadedAudioFiles(prev => updateFileStatus(prev, file, { status: 'error', error: 'File too large' }));
                            break;
                    }
                    
                    toast({
                        variant: 'destructive',
                        title: 'File Too Large',
                        description: `Please upload files smaller than ${Math.round(maxSize / (1024 * 1024))}MB.`,
                    });
                    continue;
                }

                // Upload to Firebase Storage via API
                const result = await uploadFile(file, user?.email || 'unknown@example.com');
                
                if (result.success) {
                    // Update status to processing with filename
                    switch (type) {
                        case 'deck':
                            setUploadedFiles(prev => updateFileStatus(prev, file, { 
                                status: 'processing', 
                                fileName: result.fileName 
                            }));
                            break;
                        case 'video':
                            setUploadedVideoFiles(prev => updateFileStatus(prev, file, { 
                                status: 'processing', 
                                fileName: result.fileName 
                            }));
                            break;
                        case 'audio':
                            setUploadedAudioFiles(prev => updateFileStatus(prev, file, { 
                                status: 'processing', 
                                fileName: result.fileName 
                            }));
                            break;
                    }
                    
                    toast({
                        title: 'File Uploaded Successfully',
                        description: `${file.name} has been uploaded and is being processed.`,
                    });
                } else {
                    // Update status to error
                    switch (type) {
                        case 'deck':
                            setUploadedFiles(prev => updateFileStatus(prev, file, { 
                                status: 'error', 
                                error: result.error || 'Upload failed' 
                            }));
                            break;
                        case 'video':
                            setUploadedVideoFiles(prev => updateFileStatus(prev, file, { 
                                status: 'error', 
                                error: result.error || 'Upload failed' 
                            }));
                            break;
                        case 'audio':
                            setUploadedAudioFiles(prev => updateFileStatus(prev, file, { 
                                status: 'error', 
                                error: result.error || 'Upload failed' 
                            }));
                            break;
                    }
                    
                    toast({
                        variant: 'destructive',
                        title: 'Upload Failed',
                        description: result.error || 'Failed to upload file. Please try again.',
                    });
                }
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'There was an error uploading your file. Please try again.',
            });
        } finally {
            setIsUploading(false);
            // Reset file input
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleDragOver = (event: React.DragEvent, type: 'deck' | 'video' | 'audio') => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: React.DragEvent, type: 'deck' | 'video' | 'audio') => {
        event.preventDefault();
        event.stopPropagation();
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            // Create a fake input event to reuse the upload logic
            const fakeEvent = {
                target: { files }
            } as React.ChangeEvent<HTMLInputElement>;
            handleFileUpload(fakeEvent, type);
        }
    };

    const requestCameraPermission = async () => {
        if (isRequestingPermission) return;
        
        setIsRequestingPermission(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            setHasCameraPermission(true);
            setHasMicrophonePermission(true);
            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            }
            toast({
                title: 'Permissions Granted',
                description: 'Camera and microphone access enabled successfully.',
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            setHasMicrophonePermission(false);
            toast({
                variant: 'destructive',
                title: 'Media Access Required',
                description: 'Camera and microphone permissions are required to record video pitches. Please enable them in your browser settings and try again.',
            });
        } finally {
            setIsRequestingPermission(false);
        }
    };

    const requestMicrophonePermission = async () => {
        if (isRequestingPermission) return;
        
        setIsRequestingPermission(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true 
            });
            setHasMicrophonePermission(true);
            toast({
                title: 'Microphone Access Granted',
                description: 'You can now record audio pitches.',
            });
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setHasMicrophonePermission(false);
            toast({
                variant: 'destructive',
                title: 'Microphone Access Required',
                description: 'Microphone permission is required to record audio pitches. Please enable it in your browser settings and try again.',
            });
        } finally {
            setIsRequestingPermission(false);
        }
    };

    const startVideoRecording = async () => {
        if (!hasCameraPermission) {
            await requestCameraPermission();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const file = new File([blob], `video-pitch-${Date.now()}.webm`, { type: 'video/webm' });
                
                // Upload to Firebase Storage via API
                const result = await uploadFile(file, user?.email || 'unknown@example.com');
                
                if (result.success) {
                    // Create uploaded file object with initial status
                    const uploadedFile: UploadedFile = {
                        file,
                        status: 'processing',
                        uploadTime: new Date()
                    };
                    setUploadedVideoFiles(prev => [...prev, uploadedFile]);
                    toast({
                        title: 'Video Recorded',
                        description: 'Your video pitch has been saved successfully.',
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Upload Failed',
                        description: 'Video recorded but failed to save. Please try again.',
                    });
                }
            };

            setMediaRecorder(recorder);
            setRecordedChunks(chunks);
            recorder.start();
            setIsRecording(true);
            
            toast({
                title: 'Recording Started',
                description: 'Video recording is now active.',
            });
        } catch (error) {
            toast({
            variant: 'destructive',
                title: 'Recording Failed',
                description: 'Could not start video recording. Please check your camera permissions.',
            });
        }
        };

    const startAudioRecording = async () => {
        if (!hasMicrophonePermission) {
            await requestMicrophonePermission();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], `audio-pitch-${Date.now()}.webm`, { type: 'audio/webm' });
                
                // Upload to Firebase Storage via API
                const result = await uploadFile(file, user?.email || 'unknown@example.com');
                
                if (result.success) {
                    // Create uploaded file object with initial status
                    const uploadedFile: UploadedFile = {
                        file,
                        status: 'processing',
                        uploadTime: new Date()
                    };
                    setUploadedAudioFiles(prev => [...prev, uploadedFile]);
                    toast({
                        title: 'Audio Recorded',
                        description: 'Your audio pitch has been saved successfully.',
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Upload Failed',
                        description: 'Audio recorded but failed to save. Please try again.',
                    });
                }
            };

            setMediaRecorder(recorder);
            setRecordedChunks(chunks);
            recorder.start();
            setIsRecording(true);
            
            toast({
                title: 'Recording Started',
                description: 'Audio recording is now active.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Recording Failed',
                description: 'Could not start audio recording. Please check your microphone permissions.',
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
            toast({
                title: 'Recording Stopped',
                description: 'Your recording has been saved.',
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper function to get status badge with score
    const getStatusBadge = (uploadedFile: UploadedFile) => {
        switch (uploadedFile.status) {
            case 'uploading':
                return <Badge variant="outline" className="text-blue-600 border-blue-600">Uploading</Badge>;
            case 'processing':
                return <Badge variant="secondary" className="text-yellow-600 border-yellow-600">Processing</Badge>;
            case 'processed':
                return <Badge variant="default" className="text-green-600 border-green-600 bg-green-50">Processed</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Pitch Hub</CardTitle>
            <CardDescription>Tell your story, your way. Upload a deck, or record a video or audio pitch.</CardDescription>
        </CardHeader>
        <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="deck"><FileText className="mr-2 h-4 w-4" />Pitch Deck</TabsTrigger>
                    <TabsTrigger value="video"><Video className="mr-2 h-4 w-4"/>Video Pitch</TabsTrigger>
                    <TabsTrigger value="audio"><Mic className="mr-2 h-4 w-4"/>Audio Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="deck" className="mt-6">
                        {/* Only show uploaded files if they exist */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-4 mb-6">
                                <h3 className="font-semibold">Uploaded Files</h3>
                                {uploadedFiles.map((uploadedFile, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-primary" />
                        <div>
                                                <p className="font-medium">{uploadedFile.file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFileSize(uploadedFile.file.size)} • Uploaded {uploadedFile.uploadTime.toLocaleTimeString()}
                                                </p>
                                                {uploadedFile.error && (
                                                    <p className="text-sm text-red-500">{uploadedFile.error}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(uploadedFile)}
                                            <Button variant="outline" size="sm">View</Button>
                                        </div>
                        </div>
                                ))}
                    </div>
                        )}

                        {/* Waiting message - shown always */}
                        <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-600">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Wait a couple of minutes until the status of uploaded file changes from Uploading to Processing.
                          </AlertDescription>
                        </Alert>

                        {/* Upload Area */}
                        <div 
                            className="flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                            onDragOver={(e) => handleDragOver(e, 'deck')}
                            onDrop={(e) => handleDrop(e, 'deck')}
                            onClick={() => fileInputRef.current?.click()}
                        >
                        <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Drag & drop files here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Supports PDF, PPT, PPTX (max 30MB)
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.ppt,.pptx"
                                    onChange={(e) => handleFileUpload(e, 'deck')}
                                    className="hidden"
                                />
                                {isUploading && (
                                    <div className="mt-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                                        <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="video" className="mt-6">
                        <div className="space-y-6">
                            {/* Uploaded Video Files */}
                            {uploadedVideoFiles.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Uploaded Video Files</h3>
                                    {uploadedVideoFiles.map((uploadedFile, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <Video className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="font-medium">{uploadedFile.file.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatFileSize(uploadedFile.file.size)} • Uploaded {uploadedFile.uploadTime.toLocaleTimeString()}
                                                    </p>
                                                    {uploadedFile.error && (
                                                        <p className="text-sm text-red-500">{uploadedFile.error}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(uploadedFile)}
                                                <Button variant="outline" size="sm">Play</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Video File */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Upload Video File</CardTitle>
                                    <CardDescription>Upload a pre-recorded video pitch</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div 
                                        className="flex h-24 w-full items-center justify-center rounded-md border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                                        onDragOver={(e) => handleDragOver(e, 'video')}
                                        onDrop={(e) => handleDrop(e, 'video')}
                                        onClick={() => videoFileInputRef.current?.click()}
                                    >
                                        <div className="text-center">
                                            <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Click to upload video
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                MP4, WebM, AVI, MOV (max 100MB)
                                            </p>
                                            <input
                                                ref={videoFileInputRef}
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleFileUpload(e, 'video')}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Record Video */}
                    <Card className="overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg">Record Video Pitch</CardTitle>
                                    <CardDescription>Record a live video pitch using your camera</CardDescription>
                                </CardHeader>
                        <CardContent className="p-0">
                            <div className="aspect-video bg-muted relative">
                                        {hasCameraPermission ? (
                               <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <div className="text-center">
                                                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">Camera access required for video recording</p>
                                                </div>
                                    </div>
                               )}
                            </div>
                            <div className="p-4 border-t">
                               <p className="text-sm text-muted-foreground mb-2">Record a passionate 3-minute video pitch.</p>
                                        {hasCameraPermission ? (
                                            <div className="flex gap-2">
                                                {!isRecording ? (
                                                    <Button onClick={startVideoRecording}>
                                                        <Play className="mr-2 h-4 w-4"/>
                                   Start Recording
                                </Button>
                                                ) : (
                                                    <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700">
                                                        <Square className="mr-2 h-4 w-4"/>
                                                        Stop Recording
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <Button 
                                                onClick={requestCameraPermission}
                                                disabled={isRequestingPermission}
                                            >
                                                <Camera className="mr-2 h-4 w-4"/>
                                                {isRequestingPermission ? "Requesting..." : "Enable Camera & Microphone"}
                                            </Button>
                                        )}
                            </div>
                        </CardContent>
                    </Card>
                        </div>
                </TabsContent>

                <TabsContent value="audio" className="mt-6">
                        <div className="space-y-6">
                            {/* Uploaded Audio Files */}
                            {uploadedAudioFiles.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Uploaded Audio Files</h3>
                                    {uploadedAudioFiles.map((uploadedFile, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <Mic className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="font-medium">{uploadedFile.file.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatFileSize(uploadedFile.file.size)} • Uploaded {uploadedFile.uploadTime.toLocaleTimeString()}
                                                    </p>
                                                    {uploadedFile.error && (
                                                        <p className="text-sm text-red-500">{uploadedFile.error}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(uploadedFile)}
                                                <Button variant="outline" size="sm">Play</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Audio File */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Upload Audio File</CardTitle>
                                    <CardDescription>Upload a pre-recorded audio pitch</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div 
                                        className="flex h-24 w-full items-center justify-center rounded-md border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                                        onDragOver={(e) => handleDragOver(e, 'audio')}
                                        onDrop={(e) => handleDrop(e, 'audio')}
                                        onClick={() => audioFileInputRef.current?.click()}
                                    >
                                        <div className="text-center">
                                            <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Click to upload audio
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                MP3, WAV, M4A, OGG (max 50MB)
                                            </p>
                                            <input
                                                ref={audioFileInputRef}
                                                type="file"
                                                accept="audio/*"
                                                onChange={(e) => handleFileUpload(e, 'audio')}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Record Audio */}
                     <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Record Audio Pitch</CardTitle>
                                    <CardDescription>Record a live audio pitch using your microphone</CardDescription>
                                </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                    <MicIcon className="h-12 w-12 text-primary" />
                            <p className="mt-4 text-muted-foreground">Record a concise 90-second audio summary of your vision.</p>
                                    {hasMicrophonePermission ? (
                                        <div className="flex gap-2 mt-4">
                                            {!isRecording ? (
                                                <Button onClick={startAudioRecording}>
                                                    <Play className="mr-2 h-4 w-4" />
                                Start Recording
                            </Button>
                                            ) : (
                                                <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700">
                                                    <Square className="mr-2 h-4 w-4" />
                                                    Stop Recording
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <Button 
                                            onClick={requestMicrophonePermission} 
                                            className="mt-4"
                                            disabled={isRequestingPermission}
                                        >
                                            <MicIcon className="mr-2 h-4 w-4" />
                                            {isRequestingPermission ? "Requesting..." : "Enable Microphone Access"}
                                        </Button>
                                    )}
                        </CardContent>
                    </Card>
                        </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
