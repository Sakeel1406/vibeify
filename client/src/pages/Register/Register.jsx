import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

// Import custom Vibeify logo image
import logo from "../../assets/vibeify-logo.png";

// Reusing shared Login.css
import "../Login/Login.css";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (register) {
        await register(username, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Animated Glow Orbs */}
      <div className="auth-ambient-glow" />
      <div className="auth-ambient-glow-secondary" />

      <div className="auth-card">
        {/* Subtle Cyber Reflection Bar */}
        <div className="glass-shine-line" />

        {/* Branding & Logo */}
        <div className="auth-brand">
          <img src={logo} alt="Vibeify Logo" className="auth-logo-img" />
          <span className="auth-brand-name">Vibeify</span>
        </div>

        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Sign up to start listening to your favorite vibes</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Username Input */}
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="What should we call you?"
                required
              />
              <FaUser className="input-icon" />
            </div>
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 chars)"
                minLength={6}
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

          <button type="submit" className="auth-submit" disabled={loading}>
            <span>{loading ? "Creating Account..." : "Sign Up"}</span>
            {!loading && <FaArrowRight className="submit-icon" />}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;