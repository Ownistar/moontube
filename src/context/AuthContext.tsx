import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Check if user is admin (by UID, Email, or hardcoded bootstrap)
          const hardcodedAdmins = ['itzluci52@gmail.com'];
          const isHardcodedAdmin = user.email && hardcodedAdmins.includes(user.email.toLowerCase());
          
          let isUserAdmin = isHardcodedAdmin;

          // Try to check Firestore for admin status, but don't fail if permissions are missing
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) isUserAdmin = true;

            if (!isUserAdmin && user.email) {
              const adminQuery = query(collection(db, 'admins'), where('email', '==', user.email));
              const adminSnapshot = await getDocs(adminQuery);
              if (!adminSnapshot.empty) isUserAdmin = true;
            }
          } catch (adminError) {
            console.warn('Admin status check partially failed, falling back to hardcoded check:', adminError);
          }
          
          setIsAdmin(isUserAdmin);

          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setProfile(userDoc.data());
            } else {
              const newProfile = {
                uid: user.uid,
                displayName: user.displayName || 'Anonymous Moon',
                email: user.email,
                photoURL: user.photoURL,
                totalViews: 0,
                subscriberCount: 0,
                earningsBalance: 0,
                paypalEmail: user.email,
                mppJoinedAt: new Date().toISOString(),
              };
              await setDoc(doc(db, 'users', user.uid), newProfile);
              setProfile(newProfile);
            }
          } catch (profileError) {
            console.error('Failed to load user profile:', profileError);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (globalError) {
        console.error('Auth check global failure:', globalError);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
