import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Video } from '../types';
import VideoCard from '../components/video/VideoCard';
import { Clock, Play, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function WatchLater() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchLater = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'watchLater'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        
        const videoPromises = snapshot.docs.map(async (d) => {
          const videoId = d.data().videoId;
          const videoDoc = await getDoc(doc(db, 'videos', videoId));
          if (videoDoc.exists()) {
            return { id: videoDoc.id, ...videoDoc.data() } as Video;
          }
          return null;
        });

        const results = await Promise.all(videoPromises);
        setVideos(results.filter((v): v is Video => v !== null));
      } catch (err) {
        console.error('Error fetching watch later:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchLater();
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 mpp-glow">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Signal Cache</h2>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Queue for secondary observation</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-neutral-800" />
              <div className="mt-3 h-4 w-full rounded bg-neutral-800" />
              <div className="mt-2 h-3 w-2/3 rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/50">
          <p className="text-neutral-500 font-bold uppercase tracking-widest">No signals cached.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
