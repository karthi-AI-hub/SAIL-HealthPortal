import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Person, Envelope, Key, Eye, EyeSlash, PersonVcard } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const EmployeeRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const { name, empId, email, password, confirmPassword } = formData;

    if (!name || !empId || !email || !password || !confirmPassword) {
      setError("❌ All fields are required.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return false;
    }

    if (password.length < 6) {
      setError("❌ Password must be at least 6 characters long.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("❌ Invalid email format.");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { name, empId, email, password } = formData;

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "Employee", empId), {
        Name: name,
        EmployeeID: empId,
        Email: email,
        CreatedAt: serverTimestamp(),
      });

      setSuccess("✅ Registration successful! Redirecting to login...");
      setLoading(false);

      setTimeout(() => navigate("/auth/employee/login"), 1500);
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
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Employee Registration</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <div className="input-group">
              <span className="input-group-text"><Person size={20} /></span>
              <input
                type="text"
                id="name"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-describedby="nameHelp"
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="empId" className="form-label">Employee ID</label>
            <div className="input-group">
              <span className="input-group-text"><PersonVcard size={20} /></span>
              <input
                type="text"
                id="empId"
                className="form-control"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                required
                aria-describedby="empIdHelp"
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
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                aria-describedby="confirmPasswordHelp"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm text-light"></span> : "Register"}
          </button>
          <p className="text-center mt-3">Already have an account? <Link to="/auth/employee/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegister;