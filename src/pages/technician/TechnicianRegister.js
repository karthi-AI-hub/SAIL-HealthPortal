import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash, Envelope, Key, Person, Phone } from "react-bootstrap-icons";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const TechnicianRegister = () => {
  const [technicianName, setTechnicianName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const isStrongPassword = (password) => {
    return password.length >= 6;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!technicianName || !email || !phone || !password || !confirmPassword) {
      setError("❌ All fields are required.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("❌ Invalid email format.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!isStrongPassword(password)) {
      setError("❌ Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const emailQuery = query(collection(db, "Technicians"), where("Email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        setError("❌ Email is already registered. Try login.");
        setLoading(false);
        return;
      }

      const phoneQuery = query(collection(db, "Technicians"), where("Phone", "==", phone));
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        setError("❌ Phone number is already registered. Try login.");
        setLoading(false);
        return;
      }

      await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "Technicians", phone), {
        Name: technicianName,
        Email: email,
        Phone: phone,
        CreatedAt: serverTimestamp(),
      });

      setLoading(false);
      navigate("/auth/technician/login");
    } catch (err) {
      let errorMessage = "❌ Registration failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "❌ Email is already in use.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "❌ Password is too weak.";
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light p-3">
      <div className="card p-4 shadow w-100" style={{ maxWidth: "450px" }}>
        <h3 className="text-center mb-3">Technician Registration</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="technicianName" className="form-label">Technician Name</label>
            <div className="input-group">
              <span className="input-group-text"><Person size={20} /></span>
              <input
                type="text"
                id="technicianName"
                className="form-control"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                required
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone</label>
            <div className="input-group">
              <span className="input-group-text"><Phone size={20} /></span>
              <input
                type="tel"
                id="phone"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
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

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? (
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <Link to="/auth/technician/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default TechnicianRegister;