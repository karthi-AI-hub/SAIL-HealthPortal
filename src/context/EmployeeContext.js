import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const empEmail = user.email;
        const q = query(collection(db, "Employee"), where("Email", "==", empEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const employeeDoc = querySnapshot.docs[0];
          setEmployee(employeeDoc.data());
          setEmployeeId(employeeDoc.id);
        } else {
          console.error("No Employee data found");
        }
      } else {
        setEmployee(null);
        setEmployeeId(null);
      }
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <EmployeeContext.Provider value={{ employee, employeeId, setEmployeeId }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => useContext(EmployeeContext);