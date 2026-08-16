import {
  UserRound,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../../services/api";

import "./Drivers.css";


function Drivers() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    status: "active",
  });


  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDrivers();

      setDrivers(data);
    } catch (err) {
      console.error(
        "Failed to load drivers:",
        err
      );

      setError(
        err.message ||
        "Failed to load drivers."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDrivers();
  }, []);


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


  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      license_number: "",
      status: "active",
    });

    setEditingDriver(null);
    setShowForm(false);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        license_number:
          formData.license_number,
        status: formData.status,
      };


      if (editingDriver) {
        await updateDriver(
          editingDriver.id,
          payload
        );
      } else {
        await createDriver(payload);
      }


      await loadDrivers();

      resetForm();

    } catch (err) {
      console.error(
        "Driver save error:",
        err
      );

      setError(
        err.message ||
        "Unable to save driver."
      );
    }
  };


  const handleEdit = (driver) => {
    setEditingDriver(driver);

    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      license_number:
        driver.license_number,
      status: driver.status || "active",
    });

    setShowForm(true);
  };


  const handleDelete = async (driver) => {
    const confirmed = window.confirm(
      `Delete driver ${driver.name}?`
    );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      await deleteDriver(driver.id);

      await loadDrivers();

    } catch (err) {
      console.error(
        "Driver delete error:",
        err
      );

      setError(
        err.message ||
        "Unable to delete driver."
      );
    }
  };


  return (
    <div className="drivers-page">

      {/* Header */}

      <header className="drivers-header">

        <div className="drivers-title">

          <button
            className="back-button"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={18} />
          </button>


          <div className="drivers-title-icon">
            <UserRound size={24} />
          </div>


          <div>

            <span className="page-eyebrow">
              ADMIN CONSOLE
            </span>

            <h1>
              Driver Management
            </h1>

            <p>
              Manage school transport drivers
              and their status.
            </p>

          </div>

        </div>


        <button
          className="add-driver-button"
          onClick={() => {
            setEditingDriver(null);

            setFormData({
              name: "",
              email: "",
              phone: "",
              license_number: "",
              status: "active",
            });

            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add New Driver
        </button>

      </header>


      {/* Error */}

      {error && (
        <div className="drivers-error">
          {error}
        </div>
      )}


      {/* Form */}

      {showForm && (
        <section className="driver-form-card">

          <div className="form-heading">

            <div>

              <h2>
                {editingDriver
                  ? "Edit Driver"
                  : "Add New Driver"}
              </h2>

              <p>
                Enter the driver's details below.
              </p>

            </div>

          </div>


          <form
            className="driver-form"
            onSubmit={handleSubmit}
          >

            <div className="form-field">

              <label>
                Full Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Driver name"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Email
              </label>

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="driver@example.com"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Phone
              </label>

              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />

            </div>


            <div className="form-field">

              <label>
                License Number
              </label>

              <input
                name="license_number"
                value={
                  formData.license_number
                }
                onChange={handleChange}
                placeholder="DL-XXXXXXXX"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </select>

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
              >
                {editingDriver
                  ? "Update Driver"
                  : "Create Driver"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* Driver List */}

      <section className="driver-list-card">

        <div className="list-heading">

          <div>

            <h2>
              All Drivers
            </h2>

            <p>
              {drivers.length} driver
              {drivers.length !== 1
                ? "s"
                : ""} registered
            </p>

          </div>

        </div>


        {loading ? (
          <div className="driver-empty">
            Loading drivers...
          </div>

        ) : drivers.length === 0 ? (
          <div className="driver-empty">

            <UserRound size={40} />

            <h3>
              No drivers found
            </h3>

            <p>
              Add your first driver
              to get started.
            </p>

          </div>

        ) : (

          <div className="driver-table-wrapper">

            <table className="driver-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>License</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {drivers.map((driver) => (

                  <tr key={driver.id}>

                    <td>
                      <strong>
                        {driver.name}
                      </strong>
                    </td>

                    <td>
                      {driver.email}
                    </td>

                    <td>
                      {driver.phone}
                    </td>

                    <td>
                      {driver.license_number}
                    </td>

                    <td>

                      <span
                        className={`driver-status ${driver.status}`}
                      >
                        {driver.status}
                      </span>

                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(driver)
                          }
                          title="Edit driver"
                        >
                          <Pencil size={16} />
                        </button>


                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(driver)
                          }
                          title="Delete driver"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


export default Drivers;