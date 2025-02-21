import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Person, Envelope, Key, Eye, EyeSlash, } from "react-bootstrap-icons";
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
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { name, empId, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "Employee", empId), {
        Name: name,
        EmployeeId: empId,
        Email: email,
        CreatedAt: serverTimestamp(),
        Pass: password,
      });

      setLoading(false);
      navigate("/auth/employee/login");
    } catch (err) {
      setError("❌ Registration failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Employee Registration</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <span className="input-group-text"><Person size={20} /></span>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
  <label className="form-label">Employee ID</label>
  <div className="input-group">
    <span className="input-group-text">
      <span className="material-icons">badge</span> 
    </span>
    <input type="text" className="form-control" name="empId" value={formData.empId} onChange={handleChange} required />
    </div>
</div>


          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text"><Envelope size={20} /></span>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input type={showPassword ? "text" : "password"} className="form-control" name="password" value={formData.password} onChange={handleChange} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input type={showConfirmPassword ? "text" : "password"} className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm text-light"></span> : "Register"}
          </button>

          <p className="text-center mt-3"><Link to="/">Select Role Again?</Link></p>
          <hr />
          <p className="text-center">Already have an account? <Link to="/auth/employee/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegister;
