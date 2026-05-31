import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Button } from './ui/Button'

export default function SaveCourseButton({ courseId, initialSaved = false, onChange, variant = 'secondary', size = 'sm', className = '' }) {
    const { getToken, isSignedIn } = useAuth()
    const [saved, setSaved] = useState(initialSaved)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setSaved(initialSaved)
    }, [initialSaved])

    const toggleSaved = async (event) => {
        event?.preventDefault()
        event?.stopPropagation()

        if (!isSignedIn) {
            toast.error('Sign in to save courses')
            return
        }

        setLoading(true)
        try {
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

            if (saved) {
                await axios.delete(`/api/saved-courses/${courseId}`, cfg)
                setSaved(false)
                onChange?.(false)
                toast.success('Removed from saved courses')
            } else {
                await axios.post(`/api/saved-courses/${courseId}`, {}, cfg)
                setSaved(true)
                onChange?.(true)
                toast.success('Saved for later')
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not update saved course')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button type="button" variant={variant} size={size} disabled={loading} onClick={toggleSaved} className={className}>
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? 'Saved' : 'Save'}
        </Button>
    )
}
