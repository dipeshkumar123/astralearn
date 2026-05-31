import React, { useState } from 'react';
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle } from 'lucide-react';
import { Badge } from './ui/Badge';
import ProgressBar from './ProgressBar';

export default function CourseSidebar({ course, currentLessonId, onSelectLesson, completedLessons = [] }) {
    // Normalize modules/sections structure for sidebar consumption
    const modules = course.modules || course.sections || [{ title: 'Course Content', lessons: course.lessons || [] }];
    const totalLessons = (modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white">
            <div className="border-b border-slate-200 p-4">
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">Course Content</h3>
                <p className="text-sm text-slate-500 mt-1">
                    {completedLessons.length} / {totalLessons} lessons completed
                </p>
                <div className="mt-2">
                    <ProgressBar value={totalLessons ? (completedLessons.length / totalLessons) * 100 : 0} />
                </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto">
                {modules.map((module, moduleIndex) => (
                    <ModuleItem
                        key={module.id || module._id || moduleIndex}
                        module={module}
                        currentLessonId={currentLessonId}
                        onSelectLesson={onSelectLesson}
                        completedLessons={completedLessons}
                        defaultOpen={moduleIndex === 0}
                    />
                ))}
            </div>
        </div>
    );
}

function ModuleItem({ module, currentLessonId, onSelectLesson, completedLessons, defaultOpen }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const moduleLessons = module.lessons || [];
    const completedInModule = moduleLessons.filter(l => completedLessons.includes(l.id || l._id)).length;

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 pr-3">
                        {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                        <span className="text-sm font-semibold text-slate-800 line-clamp-2">{module.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500">{completedInModule}/{moduleLessons.length}</span>
                        <Badge variant="neutral">{moduleLessons.length}</Badge>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="bg-white">
                    {moduleLessons.map((lesson, index) => {
                        const lid = lesson.id || lesson._id;
                        const isCompleted = completedLessons.includes(lid);
                        const isCurrent = currentLessonId === lid;

                        return (
                            <button
                                key={lid || index}
                                onClick={() => onSelectLesson(lesson)}
                                className={`w-full border-l-2 p-3 pl-5 text-left transition-all sm:pl-8 ${isCurrent
                                        ? 'bg-primary-50 border-primary text-primary'
                                        : 'border-transparent hover:bg-slate-50 text-slate-600'
                                    } cursor-pointer`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="shrink-0">
                                        {isCompleted ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <PlayCircle className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-slate-400'}`} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium line-clamp-2 ${isCurrent ? 'text-primary-900' : 'text-slate-700'}`}>
                                            {lesson.title}
                                        </p>
                                        {lesson.duration && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                {Math.floor(lesson.duration / 60)} min
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
