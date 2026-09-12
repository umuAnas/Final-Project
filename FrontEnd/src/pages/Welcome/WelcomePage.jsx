import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAdmin, logout } from "../../service/authService.js";
import { useUserContext } from "../../contexts/UseUserContext.jsx";
import "./WelcomePage.css";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { setUser } = useUserContext();
  const [error, setError] = useState("");
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleGoToAdmin = async () => {
    setError("");
    setLoadingAdmin(true);
    try {
      await checkAdmin();
      navigate("/admin");
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to access admin dashboard.";
      setError(message);
      if (status === 401 || status === 403) {
        navigate("/login");
      }
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setLoadingLogout(true);
    try {
      await logout();
    } catch {
      // Still clear local state even if the network call fails
    } finally {
      setUser(null);
      setLoadingLogout(false);
      navigate("/login");
    }
  };

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <span className="welcome-eyebrow">Bright tech</span>
        <h1>Welcome to the Best Learning Platform</h1>
        <p>Learn from the best in the industry.</p>

        {error && <p className="welcome-error">{error}</p>}

        <div className="welcome-actions">
          <button
            type="button"
            className="welcome-btn welcome-btnPrimary"
            onClick={handleGoToAdmin}
            disabled={loadingAdmin || loadingLogout}
          >
            {loadingAdmin ? "Checking…" : "Go to Admin"}
          </button>
          <button
            type="button"
            className="welcome-btn welcome-btnSecondary"
            onClick={handleLogout}
            disabled={loadingAdmin || loadingLogout}
          >
            {loadingLogout ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
