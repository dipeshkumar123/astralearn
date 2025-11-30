import React from 'react';
import { PlayCircle } from 'lucide-react';

export default function VideoPlayer({ playbackId, videoUrl, poster, title }) {
    if (!playbackId && !videoUrl) {
        return (
            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <div className="text-center">
                    <PlayCircle className="h-16 w-16 mx-auto mb-4 text-slate-700" />
                    <p className="text-slate-500 font-medium">Select a lesson to start watching</p>
                </div>
            </div>
        );
    }

    return (
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
            {playbackId ? (
                <div className="w-full h-full flex items-center justify-center text-white bg-slate-900">
                    {/* Placeholder for Mux Player - In a real app, use @mux/mux-player-react */}
                    <div className="text-center">
                        <PlayCircle className="h-20 w-20 mx-auto mb-6 text-primary animate-pulse-slow" />
                        <h3 className="text-xl font-bold mb-2">Video Player</h3>
                        <p className="text-slate-400">Playback ID: {playbackId}</p>
                    </div>
                </div>
            ) : (
                <video
                    src={videoUrl}
                    poster={poster}
                    controls
                    className="w-full h-full object-contain"
                >
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
}
