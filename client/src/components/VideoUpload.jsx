import { useState } from 'react'
import { Upload, Video, X } from 'lucide-react'
import MuxPlayer from '@mux/mux-player-react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function VideoUpload({ lesson, onUploadComplete }) {
    const { getToken } = useAuth()
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('video/')) {
            toast.error('Please select a video file')
            return
        }

        try {
            setUploading(true)
            setUploadProgress(0)

            // Get upload URL from backend
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            const { data } = await axios.post('/api/mux/upload-url', { courseId: lesson.courseId }, cfg)
            const { uploadUrl, uploadId } = data

            // Upload to Mux
            const upload = new XMLHttpRequest()

            upload.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100)
                    setUploadProgress(progress)
                }
            })

            upload.addEventListener('load', async () => {
                if (upload.status === 200 || upload.status === 201) {
                    // Poll for asset status
                    await pollForAsset(uploadId)
                } else {
                    throw new Error('Upload failed')
                }
            })

            upload.addEventListener('error', () => {
                toast.error('Upload failed')
                setUploading(false)
            })

            upload.open('PUT', uploadUrl)
            upload.send(file)

        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload video')
            setUploading(false)
        }
    }

    const pollForAsset = async (uploadId) => {
        // In production, you'd poll the upload status
        // For now, we'll just wait a bit and assume success
        await new Promise(resolve => setTimeout(resolve, 2000))

        toast.success('Video uploaded successfully!')
        setUploading(false)
        setUploadProgress(0)

        if (onUploadComplete) {
            onUploadComplete(uploadId)
        }
    }

    const removeVideo = async () => {
        if (!lesson.muxAssetId) return
        if (!confirm('Remove this video?')) return

        try {
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            await axios.delete(`/api/mux/asset/${lesson.muxAssetId}`, cfg)
            await axios.patch(`/api/lessons/${lesson.id}`, {
                muxAssetId: null,
                muxPlaybackId: null
            }, cfg)
            toast.success('Video removed')
            if (onUploadComplete) {
                onUploadComplete(null)
            }
        } catch (error) {
            toast.error('Failed to remove video')
        }
    }

    if (lesson.muxPlaybackId) {
        return (
            <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                    <MuxPlayer
                        playbackId={lesson.muxPlaybackId}
                        metadata={{
                            video_title: lesson.title
                        }}
                        style={{ width: '100%', aspectRatio: '16/9' }}
                    />
                </div>
                <button
                    onClick={removeVideo}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
                >
                    <X className="h-4 w-4" />
                    Remove Video
                </button>
            </div>
        )
    }

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            {uploading ? (
                <div className="text-center">
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                </div>
            ) : (
                <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <label className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                            Choose Video File
                        </span>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">MP4, MOV, or AVI recommended</p>
                </div>
            )}
        </div>
    )
}
