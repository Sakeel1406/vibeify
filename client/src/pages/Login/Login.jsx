import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/vibeify-logo.png";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-ambient-glow" />
      <div className="auth-ambient-glow-secondary" />

      <div className="auth-card">
        <div className="glass-shine-line" />

        <div className="auth-brand">
          <img src={logo} alt="Vibeify Logo" className="auth-logo-img" />
          <span className="auth-brand-name">Vibeify</span>
        </div>

        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Log in to jump back into your vibes</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
              <FaEnvelope className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <FaLock className="input-icon" />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Meta Row */}
          <div className="auth-form-meta">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-pass-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            <span>{loading ? "Signing in..." : "Log In"}</span>
            {!loading && <FaArrowRight className="submit-icon" />}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up for Vibeify</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;