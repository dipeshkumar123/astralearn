import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ContentIngestion() {
    const { getToken } = useAuth()
    const [selectedFile, setSelectedFile] = useState(null)
    const [courseId, setCourseId] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploadResult, setUploadResult] = useState(null)
    const [rawText, setRawText] = useState('')

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type === 'application/pdf' || file.type.startsWith('text/')) {
                setSelectedFile(file)
            } else {
                toast.error('Please select a PDF or text file')
            }
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !courseId) {
            toast.error('Please select a file and enter a course ID')
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('courseId', courseId)
        formData.append('contentType', selectedFile.type === 'application/pdf' ? 'pdf' : 'text')

        try {
            const token = await getToken()
            const res = await axios.post('/api/ai/ingest', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })

            setUploadResult(res.data)
            toast.success(`Content ingested! ${res.data.chunksCreated} chunks created`)
            setSelectedFile(null)
            setCourseId('')
        } catch (error) {
            console.error(error)
            toast.error('Failed to ingest content')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/teacher" className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-xl font-bold">Content Ingestion</h1>
                        </div>
                        <UserButton />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-2">Upload Course Materials</h2>
                    <p className="text-gray-600 mb-6">
                        Upload PDFs or text files to make them searchable by the AI tutor
                    </p>

                    {/* Course ID Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course ID
                        </label>
                        <input
                            type="text"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            placeholder="Enter course ID"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">Click to upload or drag and drop</p>
                                    <p className="text-sm text-gray-500 mt-2">PDF or TXT files</p>
                                    <input
                                        type="file"
                                        onChange={handleFileSelect}
                                        accept=".pdf,.txt"
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || !courseId || uploading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {uploading ? 'Processing...' : 'Upload and Index Content'}
                    </button>

                    {/* Result */}
                    {uploadResult && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="h-5 w-5" />
                                <p className="font-medium">Success!</p>
                            </div>
                            <p className="text-green-700 mt-2">
                                {uploadResult.chunksCreated} chunks created and indexed
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Upload course materials (PDFs, lecture notes, etc.)</li>
                        <li>• Content is split into searchable chunks</li>
                        <li>• AI generates embeddings for semantic search</li>
                        <li>• Students can ask questions and get answers from your materials</li>
                    </ul>
                </div>
                {/* AI Indexing (Raw Text) */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">AI Indexing</h2>
                    <p className="text-sm text-gray-600 mb-2">Paste any lesson/course text to index for AI.</p>
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full h-32 p-3 border rounded-lg mb-3"
                        placeholder="Paste lesson text here"
                    />
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                        onClick={async () => {
                            try {
                                const token = await getToken()
                                const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                                if (!courseId) { toast.error('Enter course ID'); return }
                                if (!rawText.trim()) { toast.error('Enter some text'); return }
                                await axios.post('/api/ai/ingest-text', { courseId, text: rawText }, cfg)
                                toast.success('Lesson indexed to AI!')
                                setRawText('')
                            } catch (e) {
                                toast.error('Failed to index')
                            }
                        }}
                    >Index Lesson to AI</button>
                </div>
            </div>
        </div>
    )
}
