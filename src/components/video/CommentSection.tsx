import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: any;
}

interface CommentSectionProps {
  videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!videoId) return;

    const q = query(
      collection(db, 'comments'),
      where('videoId', '==', videoId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        videoId,
        userId: user.uid,
        userName: user.displayName || 'Unknown Astronaut',
        userPhoto: user.photoURL || '',
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-5 w-5 text-purple-500" />
        <h3 className="font-black uppercase tracking-widest text-sm">Transmissions ({comments.length})</h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-neutral-800">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-full w-full bg-neutral-800 flex items-center justify-center">
                <User className="h-5 w-5 text-neutral-500" />
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the signal archive..."
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none h-24"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute bottom-4 right-4 text-purple-500 hover:text-purple-400 disabled:text-neutral-600 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Sign in to participate in the transmission</p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-4 group"
            >
              <Link to={`/channel/${comment.userId}`} className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 hover:opacity-80 transition-opacity">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt={comment.userName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-5 w-5 text-neutral-500" />
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/channel/${comment.userId}`} className="text-xs font-black uppercase tracking-tight hover:text-purple-400 transition-colors">
                    {comment.userName}
                  </Link>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">
                    {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate()) + ' ago' : 'Just now'}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">{comment.content}</p>
                {user && user.uid === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="mt-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
