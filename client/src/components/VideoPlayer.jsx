import React, { useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { PlayCircle, VideoOff } from 'lucide-react';

export default function VideoPlayer({ playbackId, videoUrl, poster, title }) {
    const [isLoading, setIsLoading] = useState(true);

    if (!playbackId && !videoUrl) {
        return (
            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400 font-medium text-sm">Select a lesson to start watching</p>
                </div>
            </div>
        );
    }

    return (
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
                    <div className="text-center">
                        <div className="h-14 w-14 mx-auto mb-4 rounded-full border-4 border-slate-700 border-t-primary animate-spin" />
                        <p className="text-sm text-slate-500">Loading video…</p>
                    </div>
                </div>
            )}

            {playbackId ? (
                <MuxPlayer
                    playbackId={playbackId}
                    streamType="on-demand"
                    autoPlay={false}
                    metadata={{
                        video_title: title || 'Lesson Video',
                    }}
                    style={{ width: '100%', height: '100%', '--media-object-fit': 'contain' }}
                    onLoadedData={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            ) : (
                <video
                    src={videoUrl}
                    poster={poster}
                    controls
                    className="w-full h-full object-contain"
                    onLoadedData={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                >
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
}
