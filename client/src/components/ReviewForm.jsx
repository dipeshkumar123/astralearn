import { useState } from 'react'
import { Star } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/clerk-react'

export default function ReviewForm({ courseId, userId, onReviewSubmitted }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [hoveredRating, setHoveredRating] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const { getToken } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setSubmitting(true)
        try {
            const token = await getToken()
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

            const effectiveUserId = userId || (import.meta.env.VITE_TEST_AUTH ? 'test_user_id' : undefined)

            await axios.post('/api/reviews', {
                courseId,
                userId: effectiveUserId,
                rating,
                comment
            }, config)

            toast.success('Review submitted successfully!')
            setRating(0)
            setComment('')
            if (onReviewSubmitted) onReviewSubmitted()
        } catch (error) {
            console.error('Submit review error:', error)
            toast.error(error.response?.data?.error || 'Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What did you think of the course?"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                data-testid="review-submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    )
}
