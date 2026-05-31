import { useEffect, useState } from 'react'
import { Star, User } from 'lucide-react'
import axios from 'axios'

export default function ReviewList({ courseId, reviews: reviewsProp, refreshKey = 0 }) {
    const [reviews, setReviews] = useState(Array.isArray(reviewsProp) ? reviewsProp : [])
    const [loading, setLoading] = useState(!Array.isArray(reviewsProp) && !!courseId)

    useEffect(() => {
        if (Array.isArray(reviewsProp)) {
            setReviews(reviewsProp)
            setLoading(false)
            return
        }

        if (!courseId) {
            setReviews([])
            setLoading(false)
            return
        }

        let isCancelled = false
        setLoading(true)

        const fetchReviews = async () => {
            try {
                const res = await axios.get(`/api/reviews/course/${courseId}`)
                if (!isCancelled) {
                    setReviews(res.data || [])
                }
            } catch {
                if (!isCancelled) {
                    setReviews([])
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchReviews()

        return () => {
            isCancelled = true
        }
    }, [courseId, reviewsProp, refreshKey])

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">
                Loading reviews...
            </div>
        )
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review!
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="mb-2 flex items-start gap-3">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-semibold text-gray-900 break-words">
                                {review.user.firstName} {review.user.lastName}
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                                <span className="text-xs text-gray-500 ml-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{review.comment}</p>
                </div>
            ))}
        </div>
    )
}
