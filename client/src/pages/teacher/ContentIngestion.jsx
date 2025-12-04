import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Upload, FileText, CheckCircle, Sparkles, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import TeacherHeader from '../../components/TeacherHeader'

export default function ContentIngestion() {
    const { getToken } = useAuth()
    const [selectedFile, setSelectedFile] = useState(null)
    const [courseId, setCourseId] = useState('')
    const [courses, setCourses] = useState([])
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadResult, setUploadResult] = useState(null)
    const [rawText, setRawText] = useState('')

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            const res = await axios.get('/api/courses/instructor', cfg)
            setCourses(res.data || [])
            if (res.data && res.data.length > 0) {
                setCourseId(res.data[0].id)
            }
        } catch (err) {
            console.error('Error fetching courses:', err)
            toast.error('Failed to load your courses')
        } finally {
            setLoadingCourses(false)
        }
    }

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
            toast.error('Please select a file and a course')
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
        } catch (error) {
            console.error(error)
            const errorMsg = error.response?.data?.error || 'Failed to ingest content'
            toast.error(errorMsg)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <TeacherHeader 
                title="AI Content Indexing" 
                subtitle="Upload materials for AI tutor"
                backLink="/teacher"
            />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold mb-2">Upload Course Materials</h2>
                    <p className="text-gray-600 mb-6">
                        Upload PDFs or text files to make them searchable by the AI tutor
                    </p>

                    {loadingCourses ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                            <p className="text-slate-600">Loading your courses...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                            <p className="text-amber-800 font-medium mb-2">No courses found</p>
                            <p className="text-amber-700 text-sm mb-4">You need to create a course first before indexing content.</p>
                            <Link 
                                to="/teacher/courses"
                                className="inline-block bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                            >
                                Create Your First Course
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Course Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Select Course
                                </label>
                                <select
                                    value={courseId}
                                    onChange={(e) => setCourseId(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white"
                                >
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.title} {course.isPublished ? '(Published)' : '(Draft)'}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-2">
                                    Content will be indexed for the AI tutor in the selected course
                                </p>
                            </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Select File
                        </label>
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-primary transition-colors">
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl">
                                        <FileText className="h-10 w-10 text-blue-600" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload className="h-8 w-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-900 font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-sm text-slate-500">PDF or TXT files (max 10MB)</p>
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
                        disabled={!selectedFile || !courseId || uploading || courses.length === 0}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Upload and Index Content
                            </>
                        )}
                    </button>

                    {/* Result */}
                    {uploadResult && (
                        <div className="mt-6 p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                            <div className="flex items-center gap-3 text-emerald-800">
                                <div className="bg-emerald-500 p-2 rounded-full">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">Success!</p>
                                    <p className="text-emerald-700 text-sm">
                                        {uploadResult.chunksCreated} chunks created and indexed
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                        </>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        How AI Indexing Works
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>Upload course materials (PDFs, lecture notes, transcripts)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>Content is intelligently split into searchable chunks with overlap</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>AI generates semantic embeddings for accurate context matching</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>Students can ask questions and get instant answers from your materials</span>
                        </li>
                    </ul>
                </div>

                {/* AI Indexing (Raw Text) */}
                {!loadingCourses && courses.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Index Text Content</h2>
                            <p className="text-slate-600 text-sm">Paste lesson content directly for AI indexing</p>
                        </div>
                    </div>
                    
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full h-40 p-4 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                        placeholder="Paste lesson text, notes, or any educational content here..."
                    />
                    
                    <button
                        onClick={async () => {
                            try {
                                const token = await getToken()
                                const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                                if (!courseId) { toast.error('Select a course'); return }
                                if (!rawText.trim()) { toast.error('Enter some text'); return }
                                await axios.post('/api/ai/ingest-text', { courseId, text: rawText }, cfg)
                                toast.success('Lesson indexed to AI!')
                                setRawText('')
                            } catch (e) {
                                const errorMsg = e.response?.data?.error || 'Failed to index'
                                toast.error(errorMsg)
                            }
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg font-semibold flex items-center justify-center gap-2 transition"
                    >
                        <Sparkles className="h-5 w-5" />
                        Index Lesson to AI
                    </button>
                </div>
                )}
            </div>
        </div>
    )
}
