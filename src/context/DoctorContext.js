import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const docEmail = user.email;
        const q = query(collection(db, "Doctors"), where("Email", "==", docEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doctorDoc = querySnapshot.docs[0];
          setDoctor(doctorDoc.data());
          setDoctorId(doctorDoc.id);
        } else {
          setDoctor(null);
          setDoctorId(null);
        }
      } else {
        setDoctor(null);
        setDoctorId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <DoctorContext.Provider value={{ doctor, doctorId, setDoctorId, loading }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => useContext(DoctorContext);