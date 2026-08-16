import {
  ArrowLeft,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Login.css";

import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";


function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (
        !formData.email ||
        !formData.password
      ) {
        throw new Error(
          "Please enter your email and password."
        );
      }


      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      });


      console.log(
        "Login successful:",
        result
      );


      // ======================================
      // SAVE LOGIN DATA
      // ======================================

      login(result);


      // ======================================
      // ROLE-BASED ROUTING
      // ======================================

      const role =
        result?.user?.role;


      alert("Login successful!");


      if (role === "admin") {

        navigate("/admin");

      } else if (role === "driver") {

        navigate("/driver");

      } else if (role === "parent") {

        navigate("/parent");

      } else {

        // Unknown / missing role
        navigate("/");

      }

    } catch (err) {

      console.error(
        "Login error:",
        err
      );

      setError(
        err.message ||
        "Login failed. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="login-page">


      {/* ======================================
          LEFT SIDE
      ======================================= */}

      <div className="login-left">

        <button
          className="back-home"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={18} />
          Back to home
        </button>


        <div className="login-brand">

          <div className="login-brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <span>RideGuard</span>
            <strong>360</strong>
          </div>

        </div>


        <div className="login-hero-text">

          <span className="login-label">
            SCHOOL TRANSPORT SAFETY
          </span>

          <h1>
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p>
            Sign in to continue managing and
            monitoring your school
            transportation network.
          </p>

        </div>


        <div className="login-safety">

          <ShieldCheck size={20} />

          <span>
            Your transportation data is protected.
          </span>

        </div>

      </div>


      {/* ======================================
          RIGHT SIDE
      ======================================= */}

      <div className="login-right">

        <div className="login-card">


          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="login-brand-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <span>RideGuard</span>
              <strong>360</strong>
            </div>

          </div>


          {/* HEADING */}

          <div className="login-heading">

            <h2>
              Sign in
            </h2>

            <p>
              Enter your account details to continue.
            </p>

          </div>


          {/* FORM */}

          <form onSubmit={handleSubmit}>


            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

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


            {/* PASSWORD */}

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}


            {/* SUBMIT */}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>


          </form>


          {/* REGISTER */}

          <div className="register-prompt">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create account
            </Link>

          </div>


        </div>

      </div>

    </div>
  );
}


export default Login;