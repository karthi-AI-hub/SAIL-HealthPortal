import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docEmail = user.email;
        const q = query(collection(db, "Doctors"), where("Email", "==", docEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doctorDoc = querySnapshot.docs[0];
          setDoctor(doctorDoc.data());
          setDoctorId(doctorDoc.id);
        } else {
          console.error("No Doctor data found");
        }
      } else {
        setDoctor(null);
        setDoctorId(null);
      }
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <DoctorContext.Provider value={{ doctor, doctorId, setDoctorId }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => useContext(DoctorContext);