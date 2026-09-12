import { useState } from "react";
import "./Register.css";
import { register } from "../../service/userService.js";
import { useNavigate, Link } from "react-router-dom";

const initialFormData = {
  fullName: "",
  emailAddress: "",
  phone: "",
  birthDate: "",
  gender: "",
  academicBackground: "",
  password: "",
  confirmPassword: "",
};

function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...payload } = formData;

    setLoading(true);
    try {
      
    
      const response = await register(payload);
      if (onRegisterSuccess) {
        onRegisterSuccess(response.data);
      } 
      else {
        navigate("/login");
      
    } 
  }catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <span className="register-eyebrow">Student Portal</span>
        <h2>Create your account</h2>
        <p className="register-subtitle">
          It only takes a couple of minutes to get started
        </p>

        <form onSubmit={handleSubmit}>
          <div className="register-formSection">
            <div className="register-sectionTitle">Personal details</div>
            <div className="register-formGrid">
              <div className="register-inputGroup register-fullWidth">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-inputGroup">
                <label>Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  max="2010-12-31"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-inputGroup">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="register-inputGroup register-fullWidth">
                <label>Academic Background</label>
                <input
                  type="text"
                  name="academicBackground"
                  placeholder="e.g. High school diploma, BSc in..."
                  value={formData.academicBackground}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-formSection">
            <div className="register-sectionTitle">Contact</div>
            <div className="register-formGrid">
              <div className="register-inputGroup">
                <label>Email</label>
                <input
                  type="email"
                  name="emailAddress"
                  placeholder="@gmail.com"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-inputGroup">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="09xxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-formSection">
            <div className="register-sectionTitle">Account security</div>
            <div className="register-formGrid">
              <div className="register-inputGroup">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-inputGroup">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="register-error">{error}</p>}

          <button type="submit" className="register-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
