import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;

        let userDoc;
        let userRole;

        const findUserDoc = async (collectionName) => {
          const q = query(collection(db, collectionName), where("Email", "==", email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            return querySnapshot.docs[0].ref;
          }
          return null;
        };

        const employeeDocRef = await findUserDoc("Employee");
        if (employeeDocRef) {
          userDoc = await getDoc(employeeDocRef);
          userRole = "employee";
        }

        const doctorDocRef = await findUserDoc("Doctors");
        if (doctorDocRef) {
          userDoc = await getDoc(doctorDocRef);
          userRole = "doctor";
        }

        const technicianDocRef = await findUserDoc("Technicians");
        if (technicianDocRef) {
          userDoc = await getDoc(technicianDocRef);
          userRole = "technician";
        }

        if (userDoc) {
          setUser({ ...user, ...userDoc.data(), role: userRole });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
