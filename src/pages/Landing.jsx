import {
  ArrowRight,
  Bell,
  Bus,
  MapPin,
  ShieldCheck,
  Siren,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <span className="brand-name">RideGuard</span>
            <span className="brand-number">360</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="status-dot"></span>
              SMART SCHOOL TRANSPORTATION
            </div>

            <h1>
              Safer journeys.
              <br />
              <span>Smarter tracking.</span>
            </h1>

            <p className="hero-description">
              RideGuard 360 connects schools, drivers, and parents
              with intelligent school transport monitoring and
              real-time safety features.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() => navigate("/register")}
              >
                Get Started
                <ArrowRight size={19} />
              </button>

              <a href="#features" className="secondary-btn">
                Explore Features
              </a>
            </div>

            <div className="trust-row">
              <div className="trust-item">
                <ShieldCheck size={18} />
                <span>Safety First</span>
              </div>

              <div className="trust-item">
                <MapPin size={18} />
                <span>Live Tracking</span>
              </div>

              <div className="trust-item">
                <Bell size={18} />
                <span>Instant Alerts</span>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hero-visual">
            <div className="visual-glow"></div>

            <div className="bus-card">
              <div className="bus-card-header">
                <div>
                  <span className="small-label">LIVE MONITORING</span>
                  <h3>School Bus 01</h3>
                </div>

                <span className="live-badge">
                  <span></span>
                  LIVE
                </span>
              </div>

              <div className="map-preview">
                <div className="map-grid"></div>

                <div className="route-line"></div>

                <div className="map-stop stop-one"></div>
                <div className="map-stop stop-two"></div>
                <div className="map-stop stop-three"></div>

                <div className="bus-marker">
                  <Bus size={23} />
                </div>
              </div>

              <div className="bus-card-footer">
                <div>
                  <span>STATUS</span>
                  <strong>On Route</strong>
                </div>

                <div>
                  <span>SPEED</span>
                  <strong>32 km/h</strong>
                </div>

                <div>
                  <span>SAFETY</span>
                  <strong className="safe-text">Safe</strong>
                </div>
              </div>
            </div>

            <div className="floating-card emergency-card">
              <div className="floating-icon emergency-icon">
                <Siren size={19} />
              </div>

              <div>
                <strong>Emergency Ready</strong>
                <span>24/7 Safety Monitoring</span>
              </div>
            </div>

            <div className="floating-card parent-card">
              <div className="floating-icon parent-icon">
                <Users size={19} />
              </div>

              <div>
                <strong>Parent Connected</strong>
                <span>Real-time updates</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="features-section">
          <div className="section-heading">
            <span>POWERFUL FEATURES</span>

            <h2>
              Everything you need for
              <br />
              safer school transportation.
            </h2>

            <p>
              One platform connecting every part of your school
              transport ecosystem.
            </p>
          </div>

          <div className="feature-grid">
            <FeatureCard
              icon={<MapPin size={25} />}
              title="Live Bus Tracking"
              description="Monitor school buses in real time and know exactly where every journey is."
            />

            <FeatureCard
              icon={<ShieldCheck size={25} />}
              title="Safety Monitoring"
              description="Keep students protected with continuous transport safety monitoring."
            />

            <FeatureCard
              icon={<Siren size={25} />}
              title="Emergency Response"
              description="Quickly report and manage emergencies when every second matters."
            />

            <FeatureCard
              icon={<Bell size={25} />}
              title="Instant Notifications"
              description="Keep parents and school administrators informed with timely alerts."
            />
          </div>
        </section>

        {/* About */}
        <section id="about" className="about-section">
          <div className="about-content">
            <span className="section-label">WHY RIDEGUARD 360</span>

            <h2>
              One connected system.
              <br />
              <span>Everyone stays informed.</span>
            </h2>

            <p>
              RideGuard 360 brings administrators, drivers, students,
              and parents together through one intelligent school
              transportation platform.
            </p>

            <div className="about-points">
              <div>
                <ShieldCheck size={20} />
                <span>Designed around student safety</span>
              </div>

              <div>
                <MapPin size={20} />
                <span>Real-time transportation visibility</span>
              </div>

              <div>
                <Bell size={20} />
                <span>Fast communication and alerts</span>
              </div>
            </div>
          </div>

          <div className="about-stat">
            <div className="stat-icon">
              <Bus size={30} />
            </div>

            <strong>360°</strong>
            <span>School Transport Visibility</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span className="brand-name">RideGuard</span>
            <span className="brand-number">360</span>
          </div>
        </div>

        <p>Smart transportation. Safer journeys.</p>

        <span>© 2026 RideGuard 360</span>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>

      <ArrowRight className="feature-arrow" size={19} />
    </div>
  );
}

export default Landing;