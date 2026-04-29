import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../../types';
import { formatViews } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Check, Copy } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [showToast, setShowToast] = useState(false);
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  const watchUrl = `/watch/${video.id}`;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}${watchUrl}`;
    const shareData = {
      title: video.title,
      text: video.description,
      url: url
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <Link to={watchUrl} className="block relative">
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-purple-600 px-3 py-1.5 rounded-full text-[10px] font-black text-white shadow-2xl mpp-glow whitespace-nowrap"
            >
              SIGNAL LINK COPIED
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 transition-all group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]">
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-purple-600 p-3 rounded-full mpp-glow shadow-xl">
               <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>

          {/* Quick Actions */}
          <button 
            onClick={handleShare}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-white hover:bg-purple-600 transition-all opacity-0 group-hover:opacity-100 z-10"
            title="Share Signal"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded-md">
            {video.category}
          </div>
        </div>
      </Link>
      
      <div className="mt-3 flex gap-3">
        <Link to={`/channel/${video.ownerId}`} className="shrink-0">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-neutral-800 border border-neutral-700 transition-transform hover:scale-110">
            {video.ownerPhoto ? (
              <img src={video.ownerPhoto} alt={video.ownerName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-500">
                {video.ownerName?.charAt(0) || 'M'}
              </div>
            )}
          </div>
        </Link>
        <div className="flex flex-col text-sm min-w-0">
          <Link to={watchUrl} className="block">
            <h3 className="line-clamp-2 font-semibold text-neutral-100 leading-snug hover:text-purple-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          <Link to={`/channel/${video.ownerId}`} className="mt-1 text-neutral-400 text-xs hover:text-purple-400 transition-colors truncate">
            {video.ownerName || 'Creator'}
          </Link>
          <p className="mt-0.5 text-[11px] text-neutral-500 font-medium">
            {formatViews(video.views)} views • Moon Partner
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
