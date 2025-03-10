import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const TechnicianContext = createContext();

export const TechnicianProvider = ({ children }) => {
  const [technician, setTechnician] = useState(null);
  const [technicianId, setTechnicianId] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const techEmail = user.email;
        const q = query(collection(db, "Technicians"), where("Email", "==", techEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const technicianDoc = querySnapshot.docs[0];
          setTechnician(technicianDoc.data());
          setTechnicianId(technicianDoc.id);
        } else {
          setTechnician(null);
          setTechnicianId(null);
        }
      } else {
        setTechnician(null);
        setTechnicianId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <TechnicianContext.Provider value={{ technician, technicianId, setTechnicianId, loading }}>
      {children}
    </TechnicianContext.Provider>
  );
};

export const useTechnician = () => useContext(TechnicianContext);