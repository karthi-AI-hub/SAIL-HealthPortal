import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash, Envelope, Key, Person } from "react-bootstrap-icons";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const DoctorRegister = () => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [docID, setDocId] = useState("");
  const [services, setServices] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  
  const checkPhoneExists = async (empID) => {
    const workersQuery = query(collection(db, "Doctors"), where("DoctorID", "==", docID));
    const workersSnapshot = await getDocs(workersQuery);
    return !workersSnapshot.empty;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!companyName || !email || !docID || !services || !password || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setError("Invalid email format.");
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const phoneExists = await checkPhoneExists(docID);
      if (phoneExists) {
        setError("Doctor ID already registered. Try login.");
        setLoading(false);
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "Doctors", docID), {
        DoctorName: companyName,
        Email: email,
        DoctorID: docID,
        Specialization: services,
        Pass: password,
        CreatedAt: serverTimestamp(),
      });

      setLoading(false);
      navigate("/auth/doctor/login");
    } catch (err) {
      setError("Something went wrong. Try again later.");
      console.log(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light p-3">
      <div className="card p-4 shadow w-100" style={{ maxWidth: "450px" }}>
        <h3 className="text-center mb-3">Doctor Registration</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Doctor Name</label>
            <div className="input-group">
              <span className="input-group-text"><Person size={20} /></span>
              <input type="text" className="form-control" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text"><Envelope size={20} /></span>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

            <div className="mb-3">
  <label className="form-label">Doctor ID</label>
  <div className="input-group">
    <span className="input-group-text">
      <span className="material-icons">badge</span> 
    </span>
    <input type="text" className="form-control" value={docID} onChange={(e) => setDocId(e.target.value)} required />
    </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Specialization</label>
            <div className="input-group">
            <span className="input-group-text">
              <span className="material-icons">vaccines</span>
              </span>
              <input type="text" className="form-control" value={services} onChange={(e) => setServices(e.target.value)} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input type={showPassword ? "text" : "password"} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input type={showPassword ? "text" : "password"} className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>
        <p className="text-center mt-3">Already have an account? <Link to="/auth/doctor/login">Login</Link></p>
      </div>
    </div>
  );
};

export default DoctorRegister;
