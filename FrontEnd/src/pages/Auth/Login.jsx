import { useState } from "react";
import "./Login.css";
import { login } from "../../service/authService.js";
import { useUserContext } from "../../contexts/UseUserContext.jsx";
 import { getStudentDashboardPath } from "../Student/studentPath.js";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser,setAccessToken } = useUserContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(email, password);
      const loggedInUser = response.data.user;
      setUser(loggedInUser);
      setAccessToken(response.data.accessToken);

      if (loggedInUser?.role === "admin") {
        navigate("/admin");
      } else if (loggedInUser?.role === "student") {
        navigate(getStudentDashboardPath(loggedInUser));
      } else if (loggedInUser?.role === "instructor") {
        navigate("/instructor-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-eyebrow">Student Portal</span>
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Log in to continue to your dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="login-inputGroup">
            <label>Email address</label>
            <input
              type="email"
              placeholder="@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-inputGroup">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <Link to="/forgot-password" className="login-forgot">
            Forgot password?
          </Link>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="login-footer">
          Are you new here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
