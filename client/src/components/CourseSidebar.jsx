import React, { useState } from 'react';
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle, Lock } from 'lucide-react';
import { Badge } from './ui/Badge';
import ProgressBar from './ProgressBar';

export default function CourseSidebar({ course, currentLessonId, onSelectLesson, completedLessons = [] }) {
    // Normalize modules/sections structure for sidebar consumption
    const modules = course.modules || course.sections || [{ title: 'Course Content', lessons: course.lessons || [] }];
    const totalLessons = (modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

    return (
        <div className="h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-lg text-slate-900">Course Content</h3>
                <p className="text-sm text-slate-500 mt-1">
                    {completedLessons.length} / {totalLessons} lessons completed
                </p>
                <div className="mt-2">
                    <ProgressBar value={totalLessons ? (completedLessons.length / totalLessons) * 100 : 0} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
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

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                    <span className="font-semibold text-slate-800 text-sm">{module.title}</span>
                </div>
                <Badge variant="neutral" size="sm">{module.lessons?.length || 0}</Badge>
            </button>

            {isOpen && (
                <div className="bg-white">
                    {module.lessons?.map((lesson, index) => {
                        const lid = lesson.id || lesson._id;
                        const isCompleted = completedLessons.includes(lid);
                        const isCurrent = currentLessonId === lid;
                        const isLocked = lesson.isLocked; // Assuming isLocked property exists

                        return (
                            <button
                                key={lid || index}
                                onClick={() => !isLocked && onSelectLesson(lesson)}
                                disabled={isLocked}
                                className={`w-full flex items-start gap-3 p-3 pl-8 text-left transition-all border-l-2 ${isCurrent
                                        ? 'bg-primary-50 border-primary text-primary'
                                        : 'border-transparent hover:bg-slate-50 text-slate-600'
                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    {isCompleted ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : isLocked ? (
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    ) : (
                                        <PlayCircle className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-slate-400'}`} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${isCurrent ? 'text-primary-900' : 'text-slate-700'}`}>
                                        {lesson.title}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {lesson.duration ? `${Math.floor(lesson.duration / 60)} min` : '10 min'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
