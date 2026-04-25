import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Video, CATEGORIES } from '../types';
import VideoCard from '../components/video/VideoCard';
import { Compass, Zap, Flame, Rocket, Music, Gamepad2, Film, Newspaper, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const EXPLORE_CATEGORIES = [
  { icon: Flame, name: 'Trending', color: 'text-orange-500' },
  { icon: Music, name: 'Music', color: 'text-pink-500' },
  { icon: Gamepad2, name: 'Gaming', color: 'text-purple-500' },
  { icon: Film, name: 'Movies', color: 'text-blue-500' },
  { icon: Newspaper, name: 'News', color: 'text-emerald-500' },
  { icon: Trophy, name: 'Sports', color: 'text-yellow-500' },
];

export default function Explore() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Trending');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let q;
        if (selectedCategory === 'Trending') {
          // Trending is simulated by most views in recently created videos
          q = query(collection(db, 'videos'), orderBy('views', 'desc'), limit(24));
        } else {
          q = query(collection(db, 'videos'), where('category', '==', selectedCategory), orderBy('views', 'desc'), limit(24));
        }
        
        const snapshot = await getDocs(q);
        const videoData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as object)
        })) as Video[];

        setVideos(videoData);
      } catch (error) {
        console.error('Error fetching explore videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory]);

  return (
    <div className="max-w-[2000px] mx-auto">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Explore Orbit</h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Discover signals across the lunar network</p>
        </div>
      </div>

      {/* Explore Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12 sm:grid-cols-3 lg:grid-cols-6">
        {EXPLORE_CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.name;
          return (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-6 transition-all active:scale-95",
                isActive 
                  ? "border-purple-500/50 bg-neutral-900 shadow-[0_0_30px_rgba(139,92,246,0.1)]" 
                  : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60"
              )}
            >
              <div className={cn(
                "rounded-full p-3 transition-transform group-hover:scale-110",
                isActive ? "bg-purple-500/20" : "bg-neutral-800"
              )}>
                <Icon className={cn("h-6 w-6", isActive ? cat.color : "text-neutral-400")} />
              </div>
              <span className={cn(
                "text-sm font-bold uppercase tracking-wider",
                isActive ? "text-white" : "text-neutral-500"
              )}>
                {cat.name}
              </span>
              {isActive && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-500" />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mb-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400">
          Showing {selectedCategory} Signal Cluster
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-neutral-800" />
              <div className="mt-3 flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full rounded bg-neutral-800" />
                  <div className="h-3 w-2/3 rounded bg-neutral-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <Rocket className="h-12 w-12 text-neutral-800 mb-4" />
          <p className="text-neutral-500 font-medium tracking-tight">No signals detected in this sector yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
