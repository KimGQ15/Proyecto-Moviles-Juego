import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import Notification from "../service/notificationService"; 

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user);
          setLoading(false);

          if (user?.uid) {
            await Notification.getInstance().initialize(user.uid);
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error al configurar persistencia:", error);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
