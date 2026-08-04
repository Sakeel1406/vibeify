import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";
import logo from "../../assets/vibeify-logo.png";
import "../Login/Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "" });
    setLoading(true);

    try {
      // Replace with your API endpoint when ready:
      // await axios.post('/api/auth/forgot-password', { email });
      
      // Temporary simulated response
      await new Promise((res) => setTimeout(res, 1200));

      setStatusMsg({
        type: "success",
        text: "Password reset instructions have been sent to your email!",
      });
      setEmail("");
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to process request.",
      });
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
          <h1>Reset Password</h1>
          <p>Enter your email address to recover your account</p>
        </div>

        {statusMsg.text && (
          <div
            className={
              statusMsg.type === "success" ? "auth-success" : "auth-error"
            }
          >
            {statusMsg.text}
          </div>
        )}

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

          <button type="submit" className="auth-submit" disabled={loading}>
            <span>{loading ? "Sending link..." : "Send Reset Link"}</span>
            {!loading && <FaArrowRight className="submit-icon" />}
          </button>
        </form>

        <div className="auth-footer">
          Remembered your password? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;