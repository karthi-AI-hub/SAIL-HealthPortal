import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const empEmail = user.email;
        const q = query(collection(db, "Employee"), where("Email", "==", empEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const employeeDoc = querySnapshot.docs[0];
          setEmployee(employeeDoc.data());
          setEmployeeId(employeeDoc.id);
        } else {
          setEmployee(null);
          setEmployeeId(null);
        }
      } else {
        setEmployee(null);
        setEmployeeId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <EmployeeContext.Provider value={{ employee, employeeId, setEmployeeId, loading }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => useContext(EmployeeContext);