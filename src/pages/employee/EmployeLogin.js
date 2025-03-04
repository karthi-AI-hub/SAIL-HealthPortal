import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash, Envelope, Key } from "react-bootstrap-icons";
import { db } from "../../firebase";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc, query, where, collection, getDocs, serverTimestamp } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEmployee } from "../../context/EmployeeContext";

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();
  const auth = getAuth();
  const { setEmployeeId } = useEmployee();

  useEffect(() => {
    if (loginAttempts >= 5) {
      setError("❌ Too many failed attempts. Please try again later.");
      setLoading(true);
      setTimeout(() => {
        setLoginAttempts(0);
        setLoading(false);
      }, 60000);
    }
  }, [loginAttempts]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("❌ Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const q = query(collection(db, "Employee"), where("Email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("❌ Employee not found in records.");
        setLoading(false);
        return;
      }

      const employeeDoc = querySnapshot.docs[0];
      const empID = employeeDoc.id;

      setEmployeeId(empID);
      sessionStorage.setItem("workerId", empID);

      await updateDoc(doc(db, "Employee", empID), { LastLogin: serverTimestamp() });
      setLoading(false);
      navigate("/employee/dashboard");
    } catch (err) {
      setLoginAttempts((prev) => prev + 1);
      setError("❌ Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    if (!resetEmail) {
      setResetMessage("❌ Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage("✅ Password reset email sent! Check your inbox.");
    } catch (err) {
      setResetMessage("❌ Failed to send reset email. Check your email address.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Employee Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        {!showReset ? (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><Envelope size={20} /></span>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-describedby="emailHelp"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><Key size={20} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby="passwordHelp"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setShowReset(true)}
              >
                Forgot Password?
              </span>
            </p>

            <button type="submit" className="btn btn-primary w-100" disabled={loading || loginAttempts >= 5}>
              {loading ? <span className="spinner-border spinner-border-sm text-light"></span> : "Login"}
            </button>

            <p className="text-center mt-3"><Link to="/">Select Role Again?</Link></p>
            <hr />
            <p className="text-center">Don't have an account? <Link to="/auth/employee/register">Register</Link></p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="resetEmail" className="form-label">Enter your email to reset password</label>
              <div className="input-group">
                <span className="input-group-text"><Envelope size={20} /></span>
                <input
                  type="email"
                  id="resetEmail"
                  className="form-control"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  aria-describedby="resetEmailHelp"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-warning w-100">Send Reset Email</button>
            {resetMessage && <div className="alert alert-info mt-2">{resetMessage}</div>}
            <p className="text-center mt-2">
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => { setShowReset(false); setResetMessage(""); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setShowReset(false)}
              >
                Back to Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeLogin;