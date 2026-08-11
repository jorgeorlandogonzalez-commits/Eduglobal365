import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Ensure user document exists
        try {
          if (db) {
            let userDoc;
            try {
              userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            } catch (err: any) {
              console.warn("⚠️ No se pudo obtener el perfil de usuario (posiblemente offline).");
            }
            if (userDoc && !userDoc.exists()) { 
               await setDoc(doc(db, 'users', currentUser.uid), {
                 email: currentUser.email || `anon_${currentUser.uid}@anonymous.com`,
                 name: currentUser.displayName || 'Estudiante',
                 role: 'student', // default
                 createdAt: serverTimestamp(),
                 updatedAt: serverTimestamp(),
                 grade: '11°',
                 location: 'Local',
                 level: 1,
                 points: 0,
                 streak: 0
               });
            }
          }
        } catch (e) {
          console.error("Error creating user profile:", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const logOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
