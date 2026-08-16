import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock3,
  MapPin,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createEmergency,
  getActiveEmergencies,
  resolveEmergency,
} from "../../services/api";

import "./Emergencies.css";


function Emergencies() {
  const navigate = useNavigate();

  const [emergencies, setEmergencies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [resolvingId, setResolvingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [formData, setFormData] =
    useState({
      bus_id: "",
      emergency_type: "",
      message: "",
      latitude: "",
      longitude: "",
    });


  // ==========================================
  // LOAD EMERGENCIES
  // ==========================================

  const loadEmergencies = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        await getActiveEmergencies();

      setEmergencies(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "Emergency loading error:",
        err
      );

      setError(
        err.message ||
          "Failed to load emergencies."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadEmergencies();
  }, []);


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
  // CREATE EMERGENCY
  // ==========================================

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.bus_id.trim() ||
      !formData.emergency_type.trim()
    ) {
      setError(
        "Bus ID and emergency type are required."
      );

      return;
    }


    try {
      setSaving(true);

      const payload = {
        bus_id:
          formData.bus_id.trim(),

        emergency_type:
          formData.emergency_type.trim(),

        message:
          formData.message.trim() ||
          null,

        latitude:
          formData.latitude === ""
            ? null
            : Number(formData.latitude),

        longitude:
          formData.longitude === ""
            ? null
            : Number(formData.longitude),
      };


      await createEmergency(payload);


      setFormData({
        bus_id: "",
        emergency_type: "",
        message: "",
        latitude: "",
        longitude: "",
      });

      setShowForm(false);

      await loadEmergencies();

    } catch (err) {
      console.error(
        "Create emergency error:",
        err
      );

      setError(
        err.message ||
          "Failed to create emergency."
      );
    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // RESOLVE EMERGENCY
  // ==========================================

  const handleResolve = async (
    emergencyId
  ) => {
    try {
      setError("");
      setResolvingId(emergencyId);

      await resolveEmergency(
        emergencyId
      );

      setEmergencies(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== emergencyId
          )
      );

    } catch (err) {
      console.error(
        "Resolve emergency error:",
        err
      );

      setError(
        err.message ||
          "Failed to resolve emergency."
      );
    } finally {
      setResolvingId(null);
    }
  };


  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);

    setFormData({
      bus_id: "",
      emergency_type: "",
      message: "",
      latitude: "",
      longitude: "",
    });
  };


  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Time unavailable";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Time unavailable";
    }

    return parsedDate.toLocaleString();
  };


  // ==========================================
  // LOCATION
  // ==========================================

  const hasLocation = (emergency) => {
    return (
      emergency.latitude !== null &&
      emergency.latitude !== undefined &&
      emergency.longitude !== null &&
      emergency.longitude !== undefined
    );
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="emergencies-page">

      {/* ======================================
          HEADER
      ======================================= */}

      <header className="emergencies-header">

        <div className="emergencies-title">

          <button
            type="button"
            className="emergency-back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={18} />
          </button>


          <div className="emergency-title-icon">
            <AlertTriangle size={24} />
          </div>


          <div>

            <span className="emergency-eyebrow">
              ADMIN CONSOLE
            </span>

            <h1>
              Emergencies
            </h1>

            <p>
              Monitor and resolve active
              transport emergencies.
            </p>

          </div>

        </div>


        <div className="emergency-header-actions">

          <button
            type="button"
            className="refresh-emergency-button"
            onClick={() =>
              loadEmergencies(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "refresh-spin"
                  : ""
              }
            />

            Refresh
          </button>


          <button
            type="button"
            className="create-emergency-button"
            onClick={() =>
              setShowForm(true)
            }
          >
            <Plus size={18} />
            Create Emergency
          </button>

        </div>

      </header>


      {/* ======================================
          ERROR
      ======================================= */}

      {error && (
        <div className="emergency-error">

          <AlertTriangle size={17} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={16} />
          </button>

        </div>
      )}


      {/* ======================================
          FORM
      ======================================= */}

      {showForm && (

        <section className="emergency-form-card">

          <div className="emergency-form-header">

            <div>

              <span>
                SAFETY ALERT
              </span>

              <h2>
                Create Emergency
              </h2>

              <p>
                Report an active transport
                emergency.
              </p>

            </div>


            <button
              type="button"
              className="emergency-close"
              onClick={closeForm}
              disabled={saving}
            >
              <X size={18} />
            </button>

          </div>


          <form
            className="emergency-form"
            onSubmit={handleCreate}
          >

            {/* BUS */}

            <div className="emergency-field">

              <label htmlFor="bus_id">
                Bus ID
              </label>

              <input
                id="bus_id"
                name="bus_id"
                value={formData.bus_id}
                onChange={handleChange}
                placeholder="Enter bus ID"
                required
              />

            </div>


            {/* TYPE */}

            <div className="emergency-field">

              <label htmlFor="emergency_type">
                Emergency Type
              </label>

              <input
                id="emergency_type"
                name="emergency_type"
                value={
                  formData.emergency_type
                }
                onChange={handleChange}
                placeholder="Accident / Medical / Breakdown"
                maxLength={50}
                required
              />

            </div>


            {/* MESSAGE */}

            <div className="emergency-field full">

              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe the emergency..."
                maxLength={500}
                rows={4}
              />

            </div>


            {/* LATITUDE */}

            <div className="emergency-field">

              <label htmlFor="latitude">
                Latitude
              </label>

              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Optional"
              />

            </div>


            {/* LONGITUDE */}

            <div className="emergency-field">

              <label htmlFor="longitude">
                Longitude
              </label>

              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={
                  formData.longitude
                }
                onChange={handleChange}
                placeholder="Optional"
              />

            </div>


            {/* ACTIONS */}

            <div className="emergency-form-actions">

              <button
                type="button"
                className="emergency-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="emergency-save"
                disabled={saving}
              >
                {saving
                  ? "Creating..."
                  : "Create Emergency"}
              </button>

            </div>

          </form>

        </section>

      )}


      {/* ======================================
          LIST
      ======================================= */}

      <section className="emergency-list-card">

        <div className="emergency-list-heading">

          <div>

            <span>
              LIVE SAFETY MONITOR
            </span>

            <h2>
              Active Emergencies
            </h2>

            <p>
              Current unresolved transport
              emergencies.
            </p>

          </div>


          <div className="emergency-count">

            <AlertTriangle size={16} />

            <strong>
              {emergencies.length}
            </strong>

            <span>
              Active
            </span>

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="emergency-empty">

            <AlertTriangle size={38} />

            <h3>
              Loading emergencies...
            </h3>

            <p>
              Checking current transport
              safety alerts.
            </p>

          </div>

        ) : emergencies.length === 0 ? (

          /* EMPTY */

          <div className="emergency-empty">

            <CheckCircle size={42} />

            <h3>
              No active emergencies
            </h3>

            <p>
              Everything is currently
              under control.
            </p>

          </div>

        ) : (

          /* LIST */

          <div className="emergency-list">

            {emergencies.map(
              (emergency) => (

                <article
                  className="emergency-item"
                  key={emergency.id}
                >

                  <div className="emergency-item-icon">
                    <AlertTriangle
                      size={21}
                    />
                  </div>


                  <div className="emergency-content">

                    <div className="emergency-content-title">

                      <strong>
                        {emergency.emergency_type}
                      </strong>

                      <span className="active-badge">
                        ACTIVE
                      </span>

                    </div>


                    <p>
                      {emergency.message ||
                        "No additional message provided."}
                    </p>


                    <div className="emergency-meta">

                      <span>
                        Bus ID:{" "}
                        {emergency.bus_id}
                      </span>


                      <span>
                        <Clock3 size={13} />

                        {formatDate(
                          emergency.created_at
                        )}
                      </span>


                      {hasLocation(
                        emergency
                      ) && (

                        <span>
                          <MapPin size={13} />

                          {emergency.latitude},{" "}
                          {emergency.longitude}
                        </span>

                      )}

                    </div>

                  </div>


                  <button
                    type="button"
                    className="resolve-emergency-button"
                    onClick={() =>
                      handleResolve(
                        emergency.id
                      )
                    }
                    disabled={
                      resolvingId ===
                      emergency.id
                    }
                  >

                    <CheckCircle size={16} />

                    {resolvingId ===
                    emergency.id
                      ? "Resolving..."
                      : "Resolve"}

                  </button>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default Emergencies;