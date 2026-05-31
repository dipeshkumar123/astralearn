export function getCourseLessons(course) {
    return course?.sections?.flatMap((section) => section.lessons || []) || []
}

export function buildCourseProgress(course, progressRecords = []) {
    const lessons = getCourseLessons(course)
    const completedLessons = progressRecords
        .filter((record) => record.isCompleted)
        .map((record) => record.lessonId || record.lesson?.id)
        .filter(Boolean)

    return {
        completedLessons,
        totalLessons: lessons.length,
        percentComplete: lessons.length > 0
            ? Math.round((completedLessons.length / lessons.length) * 100)
            : 0,
    }
}

export async function hydrateCoursesWithProgress(courses, token, axiosClient) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined

    const progressByCourse = await Promise.all(
        courses.map(async (course) => {
            try {
                const response = await axiosClient.get(`/api/progress/course/${course.id}`, headers ? { headers } : {})
                return [course.id, buildCourseProgress(course, response.data)]
            } catch (error) {
                console.error(`Failed to fetch progress for course ${course.id}:`, error)
                return [course.id, buildCourseProgress(course)]
            }
        })
    )

    return Object.fromEntries(progressByCourse)
}
