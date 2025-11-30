import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ContentUpload() {
  const { courseId } = useParams()
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('courseId', courseId)
    formData.append('contentType', file.type === 'application/pdf' ? 'pdf' : 'text')

    try {
      const res = await axios.post('/api/ai/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success(`Successfully processed ${res.data.chunksProcessed} content chunks!`)
      fetchStats()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload content')
    } finally {
      setUploading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`/api/ai/context/${courseId}`)
      setStats(res.data)
    } catch (error) {
      console.error('Stats error:', error)
    }
  }

  useState(() => {
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to={`/teacher/courses/${courseId}`} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold">Upload Course Content</h1>
            </div>
            <UserButton />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload Course Materials</h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload PDF or text files to enable AI-powered Q&A for your students.
            The content will be processed and indexed automatically.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {uploading ? (
              <div>
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-600">Processing content...</p>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <label className="cursor-pointer">
                  <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
                    Choose File
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PDF or TXT files</p>
              </div>
            )}
          </div>
        </div>

        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Indexed Content</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalChunks}</div>
                <div className="text-sm text-gray-600">Total Chunks</div>
              </div>
              {stats.byType && stats.byType.map((type) => (
                <div key={type.contentType} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{type._count}</div>
                  <div className="text-sm text-gray-600 capitalize">{type.contentType} files</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
