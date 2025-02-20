import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const WorkerProvider = ({ children }) => {
    const [employeeId, setEmployeeId] = useState(localStorage.getItem("workerId") || "");
    const setWorkerId  = (empId) => {
        setEmployeeId(empId);
        localStorage.setItem("workerId", empId);
    };

    return (
        <UserContext.Provider value={{ employeeId, setWorkerId  }}>
          {children}
        </UserContext.Provider>
    );
};

export const useWorker = () => useContext(UserContext);
