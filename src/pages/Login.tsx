import { Moon, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-4 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#050505] shadow-[0_0_50px_rgba(255,255,255,0.2)]">
          <Moon className="h-14 w-14 fill-current" />
        </div>
        
        <h1 className="mb-2 font-sans text-5xl font-bold tracking-tighter">MoonTube</h1>
        <p className="mb-12 text-center text-white/60">
          The creator-first platform. Earn from your first view.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={signIn}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-[#050505] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </button>
          
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-xl font-bold">$0.50</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Fixed RPM</p>
            </div>
            <div>
              <p className="text-xl font-bold">0</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Requirements</p>
            </div>
            <div>
              <p className="text-xl font-bold">Inst</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Access</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="fixed bottom-8 text-[11px] text-white/20 uppercase tracking-[0.2em]">
        Designed for the Moon
      </div>
    </div>
  );
}
