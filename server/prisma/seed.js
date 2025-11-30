const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // 1. Cleanup existing data
    console.log('🧹 Cleaning up old data...')
    await prisma.discussionReply.deleteMany()
    await prisma.discussion.deleteMany()
    await prisma.review.deleteMany()
    await prisma.quizAttempt.deleteMany()
    await prisma.question.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.progress.deleteMany()
    await prisma.purchase.deleteMany()
    await prisma.enrollment.deleteMany()
    await prisma.lesson.deleteMany()
    await prisma.section.deleteMany()
    await prisma.courseContent.deleteMany()
    await prisma.chatMessage.deleteMany()
    await prisma.course.deleteMany()
    await prisma.user.deleteMany()

    // 2. Create Users
    console.log('👥 Creating users...')

    const teacher1 = await prisma.user.create({
        data: {
            clerkId: 'user_teacher1',
            email: 'sarah.johnson@astralearn.com',
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: 'TEACHER',
            stripeCustomerId: 'cus_teacher1'
        }
    })

    const teacher2 = await prisma.user.create({
        data: {
            clerkId: 'user_teacher2',
            email: 'michael.chen@astralearn.com',
            firstName: 'Michael',
            lastName: 'Chen',
            role: 'TEACHER',
            stripeCustomerId: 'cus_teacher2'
        }
    })

    const teacher3 = await prisma.user.create({
        data: {
            clerkId: 'user_teacher3',
            email: 'emily.rodriguez@astralearn.com',
            firstName: 'Emily',
            lastName: 'Rodriguez',
            role: 'TEACHER',
            stripeCustomerId: 'cus_teacher3'
        }
    })

    const student1 = await prisma.user.create({
        data: {
            clerkId: 'user_student1',
            email: 'alex.smith@student.com',
            firstName: 'Alex',
            lastName: 'Smith',
            role: 'STUDENT',
            stripeCustomerId: 'cus_student1',
            points: 1250,
            streak: 5,
            badges: ['early_adopter', 'quiz_master']
        }
    })

    const student2 = await prisma.user.create({
        data: {
            clerkId: 'user_student2',
            email: 'jamie.williams@student.com',
            firstName: 'Jamie',
            lastName: 'Williams',
            role: 'STUDENT',
            stripeCustomerId: 'cus_student2',
            points: 850,
            streak: 3,
            badges: ['fast_learner']
        }
    })

    const student3 = await prisma.user.create({
        data: {
            clerkId: 'user_student3',
            email: 'taylor.brown@student.com',
            firstName: 'Taylor',
            lastName: 'Brown',
            role: 'STUDENT',
            stripeCustomerId: 'cus_student3',
            points: 450,
            streak: 1,
            badges: []
        }
    })

    const student4 = await prisma.user.create({
        data: {
            clerkId: 'user_student4',
            email: 'jordan.davis@student.com',
            firstName: 'Jordan',
            lastName: 'Davis',
            role: 'STUDENT',
            stripeCustomerId: 'cus_student4',
            points: 200,
            streak: 0,
            badges: []
        }
    })

    console.log('📚 Creating courses...')

    // Course 1 - FREE Web Development
    const course1 = await prisma.course.create({
        data: {
            title: 'Complete Web Development Bootcamp',
            description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch.',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
            instructorId: teacher1.id,
            isPublished: true,
            price: 0,
            category: 'Development',
            level: 'Beginner'
        }
    })

    const c1section1 = await prisma.section.create({
        data: { title: 'HTML & CSS Fundamentals', position: 1, courseId: course1.id }
    })

    const c1s1l1 = await prisma.lesson.create({
        data: {
            title: 'Introduction to HTML',
            description: '<h2>What is HTML?</h2><p>HTML is the standard markup language for creating web pages.</p>',
            position: 1,
            isPublished: true,
            isFree: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            sectionId: c1section1.id,
            courseId: course1.id
        }
    })

    const c1s1l2 = await prisma.lesson.create({
        data: {
            title: 'CSS Styling Basics',
            description: '<h2>Cascading Style Sheets</h2><p>CSS is used to style web pages.</p>',
            position: 2,
            isPublished: true,
            isFree: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            sectionId: c1section1.id,
            courseId: course1.id
        }
    })

    const c1s1l3 = await prisma.lesson.create({
        data: {
            title: 'Responsive Design',
            description: '<h2>Mobile-First Design</h2><p>Create websites that work on all devices.</p>',
            position: 3,
            isPublished: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            sectionId: c1section1.id,
            courseId: course1.id
        }
    })

    const c1section2 = await prisma.section.create({
        data: { title: 'JavaScript Essentials', position: 2, courseId: course1.id }
    })

    const c1s2l1 = await prisma.lesson.create({
        data: {
            title: 'Variables and Data Types',
            description: '<h2>JavaScript Fundamentals</h2><p>Learn about variables and data types.</p>',
            position: 1,
            isPublished: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            sectionId: c1section2.id,
            courseId: course1.id
        }
    })

    const c1s2l2 = await prisma.lesson.create({
        data: {
            title: 'Functions and Arrow Functions',
            description: '<h2>Reusable Code Blocks</h2><p>Master JavaScript functions.</p>',
            position: 2,
            isPublished: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            sectionId: c1section2.id,
            courseId: course1.id
        }
    })

    // Course 2 - PAID React
    const course2 = await prisma.course.create({
        data: {
            title: 'React - The Complete Guide',
            description: 'Master React.js including Hooks, Context API, Redux, and Next.js.',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
            instructorId: teacher1.id,
            isPublished: true,
            price: 49.99,
            category: 'Development',
            level: 'Intermediate'
        }
    })

    const c2section1 = await prisma.section.create({
        data: { title: 'React Fundamentals', position: 1, courseId: course2.id }
    })

    const c2s1l1 = await prisma.lesson.create({
        data: {
            title: 'Components and JSX',
            description: '<h2>Building Blocks of React</h2><p>Components are the foundation.</p>',
            position: 1,
            isPublished: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            sectionId: c2section1.id,
            courseId: course2.id
        }
    })

    const c2s1l2 = await prisma.lesson.create({
        data: {
            title: 'State and Props',
            description: '<h2>Managing Component Data</h2><p>Learn state and props.</p>',
            position: 2,
            isPublished: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            sectionId: c2section1.id,
            courseId: course2.id
        }
    })

    // Course 3 - PAID Python
    const course3 = await prisma.course.create({
        data: {
            title: 'Python for Beginners',
            description: 'Learn Python from scratch. Perfect for absolute beginners.',
            thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
            instructorId: teacher2.id,
            isPublished: true,
            price: 29.99,
            category: 'Development',
            level: 'Beginner'
        }
    })

    const c3section1 = await prisma.section.create({
        data: { title: 'Python Basics', position: 1, courseId: course3.id }
    })

    const c3s1l1 = await prisma.lesson.create({
        data: {
            title: 'Your First Python Program',
            description: '<h2>Hello, Python!</h2><p>Write your first Python program.</p>',
            position: 1,
            isPublished: true,
            isFree: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            sectionId: c3section1.id,
            courseId: course3.id
        }
    })

    // Course 4 - PAID Data Science
    const course4 = await prisma.course.create({
        data: {
            title: 'Data Science Masterclass',
            description: 'Master data analysis, visualization, and machine learning.',
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            instructorId: teacher2.id,
            isPublished: true,
            price: 79.99,
            category: 'Data Science',
            level: 'Advanced'
        }
    })

    const c4section1 = await prisma.section.create({
        data: { title: 'Data Analysis with Pandas', position: 1, courseId: course4.id }
    })

    const c4s1l1 = await prisma.lesson.create({
        data: {
            title: 'Introduction to Pandas',
            description: '<h2>DataFrames and Series</h2><p>Pandas data analysis library.</p>',
            position: 1,
            isPublished: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            sectionId: c4section1.id,
            courseId: course4.id
        }
    })

    // Course 5 - PAID Marketing
    const course5 = await prisma.course.create({
        data: {
            title: 'Digital Marketing Fundamentals',
            description: 'Learn SEO, social media marketing, and content marketing.',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            instructorId: teacher3.id,
            isPublished: true,
            price: 39.99,
            category: 'Marketing',
            level: 'Beginner'
        }
    })

    const c5section1 = await prisma.section.create({
        data: { title: 'SEO Fundamentals', position: 1, courseId: course5.id }
    })

    const c5s1l1 = await prisma.lesson.create({
        data: {
            title: 'Introduction to SEO',
            description: '<h2>Search Engine Optimization</h2><p>Rank higher on Google.</p>',
            position: 1,
            isPublished: true,
            isFree: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
            sectionId: c5section1.id,
            courseId: course5.id
        }
    })

    // Course 6 - FREE UI/UX Design
    const course6 = await prisma.course.create({
        data: {
            title: 'UI/UX Design Principles',
            description: 'Create beautiful interfaces. Learn Figma and design systems.',
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
            instructorId: teacher3.id,
            isPublished: true,
            price: 0,
            category: 'Design',
            level: 'Beginner'
        }
    })

    const c6section1 = await prisma.section.create({
        data: { title: 'Design Fundamentals', position: 1, courseId: course6.id }
    })

    const c6s1l1 = await prisma.lesson.create({
        data: {
            title: 'Color Theory',
            description: '<h2>Understanding Colors</h2><p>Choose the right colors for designs.</p>',
            position: 1,
            isPublished: true,
            isFree: true,
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            sectionId: c6section1.id,
            courseId: course6.id
        }
    })

    console.log('📝 Creating quizzes...')

    const quiz1 = await prisma.quiz.create({
        data: {
            lessonId: c1s1l2.id,
            title: 'CSS Fundamentals Quiz',
            description: 'Test your CSS knowledge',
            passingScore: 70,
            questions: {
                create: [
                    {
                        type: 'multiple_choice',
                        question: 'What does CSS stand for?',
                        options: ['Cascading Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
                        correctAnswer: 'Cascading Style Sheets',
                        explanation: 'CSS stands for Cascading Style Sheets.',
                        order: 1,
                        points: 10
                    },
                    {
                        type: 'true_false',
                        question: 'CSS can change webpage layout.',
                        correctAnswer: 'True',
                        explanation: 'CSS is used for layout with flexbox and grid.',
                        order: 2,
                        points: 10
                    }
                ]
            }
        }
    })

    const quiz2 = await prisma.quiz.create({
        data: {
            lessonId: c1s2l1.id,
            title: 'JavaScript Variables Quiz',
            passingScore: 80,
            questions: {
                create: [
                    {
                        type: 'multiple_choice',
                        question: 'Which keyword declares a constant?',
                        options: ['const', 'var', 'let', 'constant'],
                        correctAnswer: 'const',
                        explanation: 'The const keyword creates read-only references.',
                        order: 1,
                        points: 10
                    }
                ]
            }
        }
    })

    console.log('🎓 Enrolling students...')

    await prisma.enrollment.create({ data: { userId: student1.id, courseId: course1.id, progress: 40 } })
    await prisma.enrollment.create({ data: { userId: student1.id, courseId: course2.id, progress: 20 } })
    await prisma.enrollment.create({ data: { userId: student2.id, courseId: course1.id, progress: 80 } })
    await prisma.enrollment.create({ data: { userId: student2.id, courseId: course3.id, progress: 10 } })
    await prisma.enrollment.create({ data: { userId: student2.id, courseId: course6.id, progress: 50 } })
    await prisma.enrollment.create({ data: { userId: student3.id, courseId: course4.id, progress: 5 } })
    await prisma.enrollment.create({ data: { userId: student3.id, courseId: course5.id, progress: 30 } })
    await prisma.enrollment.create({ data: { userId: student4.id, courseId: course6.id, progress: 100 } })

    console.log('📈 Creating progress...')

    await prisma.progress.create({ data: { userId: student1.id, lessonId: c1s1l1.id, isCompleted: true } })
    await prisma.progress.create({ data: { userId: student1.id, lessonId: c1s1l2.id, isCompleted: true } })
    await prisma.progress.create({ data: { userId: student2.id, lessonId: c1s1l1.id, isCompleted: true } })
    await prisma.progress.create({ data: { userId: student2.id, lessonId: c1s1l2.id, isCompleted: true } })
    await prisma.progress.create({ data: { userId: student2.id, lessonId: c1s1l3.id, isCompleted: true } })
    await prisma.progress.create({ data: { userId: student2.id, lessonId: c1s2l1.id, isCompleted: true } })

    console.log('📊 Creating quiz attempts...')

    await prisma.quizAttempt.create({
        data: {
            userId: student1.id,
            quizId: quiz1.id,
            score: 90,
            passed: true,
            answers: { q1: 'Cascading Style Sheets', q2: 'True' },
            timeSpent: 180
        }
    })

    await prisma.quizAttempt.create({
        data: {
            userId: student2.id,
            quizId: quiz1.id,
            score: 100,
            passed: true,
            answers: { q1: 'Cascading Style Sheets', q2: 'True' },
            timeSpent: 120
        }
    })

    await prisma.quizAttempt.create({
        data: {
            userId: student2.id,
            quizId: quiz2.id,
            score: 85,
            passed: true,
            answers: { q1: 'const' },
            timeSpent: 95
        }
    })

    console.log('⭐ Creating reviews...')

    await prisma.review.create({
        data: {
            userId: student1.id,
            courseId: course1.id,
            rating: 5,
            comment: 'Excellent course! Very comprehensive and easy to follow.'
        }
    })

    await prisma.review.create({
        data: {
            userId: student2.id,
            courseId: course1.id,
            rating: 4,
            comment: 'Great content, wish there were more advanced topics.'
        }
    })

    await prisma.review.create({
        data: {
            userId: student3.id,
            courseId: course5.id,
            rating: 5,
            comment: 'Best marketing course! Highly recommend for beginners.'
        }
    })

    await prisma.review.create({
        data: {
            userId: student4.id,
            courseId: course6.id,
            rating: 5,
            comment: 'Amazing design principles. Already applying what I learned!'
        }
    })

    console.log('💬 Creating discussions...')

    const discussion1 = await prisma.discussion.create({
        data: {
            userId: student1.id,
            lessonId: c1s1l2.id,
            title: 'How to center a div?',
            content: 'Struggling with centering a div. What is the best modern approach?'
        }
    })

    await prisma.discussionReply.create({
        data: {
            userId: student2.id,
            discussionId: discussion1.id,
            content: 'Use flexbox! display: flex; justify-content: center; align-items: center;'
        }
    })

    await prisma.discussionReply.create({
        data: {
            userId: teacher1.id,
            discussionId: discussion1.id,
            content: 'Great answer! Flexbox and CSS Grid are the modern approaches.'
        }
    })

    const discussion2 = await prisma.discussion.create({
        data: {
            userId: student3.id,
            lessonId: c2s1l1.id,
            title: 'Difference between props and state?',
            content: 'Can someone explain the key differences?'
        }
    })

    await prisma.discussionReply.create({
        data: {
            userId: teacher1.id,
            discussionId: discussion2.id,
            content: 'Props are passed from parent and immutable. State is managed within and can be changed.'
        }
    })

    console.log('✅ Seeding complete!')
    console.log(`
    📊 Summary:
    - 3 Teachers created
    - 4 Students created
    - 6 Courses created (3 free, 3 paid)
    - 11 Lessons with videos
    - 2 Quizzes with questions
    - 8 Enrollments
    - 6 Progress records
    - 3 Quiz attempts
    - 4 Reviews
    - 2 Discussions with 4 replies
    `)
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
