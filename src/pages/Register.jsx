import { registerUser } from "../services/api";
import {
  ArrowLeft,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "parent",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      throw new Error(
        "Please fill in all required fields."
      );
    }

    if (formData.password.length < 8) {
      throw new Error(
        "Password must contain at least 8 characters."
      );
    }

    const result = await registerUser(formData);

    console.log("Registration successful:", result);

    alert("Account created successfully! Please login.");

    navigate("/login");
  } catch (err) {
    console.error("Registration error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-page">
      {/* Left section */}
      <div className="register-left">
        <button
          className="register-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to home
        </button>

        <div className="register-brand">
          <div className="register-brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <span>RideGuard</span>
            <strong>360</strong>
          </div>
        </div>

        <div className="register-intro">
          <span className="register-label">
            JOIN RIDEGUARD 360
          </span>

          <h1>
            Safer
            <br />
            <span>together.</span>
          </h1>

          <p>
            Create your account and become part of a smarter,
            safer school transportation network.
          </p>
        </div>

        <div className="register-role-info">
          <div className="role-info-icon">
            <Users size={21} />
          </div>

          <div>
            <strong>Built for every role</strong>
            <span>
              Admins, drivers and parents stay connected.
            </span>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="register-right">
        <div className="register-card">
          <div className="mobile-register-brand">
            <div className="register-brand-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <span>RideGuard</span>
              <strong>360</strong>
            </div>
          </div>

          <div className="register-heading">
            <h2>Create account</h2>

            <p>
              Enter your details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full name</label>

              <div className="register-input-wrapper">
                <User size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email address</label>

              <div className="register-input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="register-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="role">Account type</label>

              <div className="role-select-wrapper">
                <Users size={18} />

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="parent">Parent</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            <button
              className="register-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="login-prompt">
            <span>Already have an account?</span>

            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;