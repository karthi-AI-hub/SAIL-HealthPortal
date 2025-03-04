import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash, Envelope, Key } from "react-bootstrap-icons";
import { db } from "../../firebase";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc, query, where, collection, getDocs, serverTimestamp } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDoctor } from "../../context/DoctorContext";

const DoctorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();
  const { setDoctorId } = useDoctor();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const q = query(collection(db, "Doctors"), where("Email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("❌ Doctor not found in records.");
        setLoading(false);
        return;
      }

      const doctorDoc = querySnapshot.docs[0];
      const docID = doctorDoc.id;

      setDoctorId(docID);
      localStorage.setItem("workerId", docID);

      await updateDoc(doc(db, "Doctors", docID), { LastLogin: serverTimestamp() });
      setLoading(false);
      navigate("/doctor/dashboard");

      console.log("Login successful");
    } catch (err) {
      let errorMessage = "❌ Login failed. Please check your credentials.";
      if (err.code === "auth/invalid-email") errorMessage = "❌ Invalid email format.";
      if (err.code === "auth/user-not-found") errorMessage = "❌ No account found with this email.";
      if (err.code === "auth/wrong-password") errorMessage = "❌ Incorrect password.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage("✅ Password reset email sent! Check your inbox.");
    } catch (err) {
      setResetMessage("❌ Failed to send reset email. Check your email address.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h3 className="text-center mb-3">Doctor Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        {!showReset ? (
          <>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><Envelope size={20} /></span>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><Key size={20} /></span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </button>
                </div>
              </div>
              
              <p className="text-end">
                <span 
                  className="text-primary" 
                  style={{ cursor: "pointer" }} 
                  onClick={() => { setShowReset(true); setError(""); }}
                >
                  Forgot Password?
                </span>
              </p>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </button>
              <p className="text-center mt-3">
                <Link to="/">Select Role Again?</Link>
              </p>
              <hr/>
              <p className="text-center">
                Don't have an account? <Link to="/auth/doctor/register">Register</Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label className="form-label">Enter your email to reset password</label>
                <div className="input-group">
                  <span className="input-group-text"><Envelope size={20} /></span>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-warning w-100">Send Reset Email</button>
            </form>

            {resetMessage && <div className="alert alert-info mt-2">{resetMessage}</div>}

            <p className="text-center mt-2">
              <span 
                className="text-primary" 
                style={{ cursor: "pointer" }} 
                onClick={() => { setShowReset(false); setResetMessage(""); }}
              >
                Back to Login
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorLogin;
