import {
  ArrowLeft,
  Bell,
  Check,
  Plus,
  ShieldAlert,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
} from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import "./Notifications.css";


function Notifications() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [formData, setFormData] =
    useState({
      user_id: "",
      title: "",
      message: "",
      notification_type: "info",
    });


  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id) {
        throw new Error(
          "Logged-in user information not found."
        );
      }

      const data =
        await getNotifications(user.id);

      setNotifications(
        Array.isArray(data) ? data : []
      );

    } catch (err) {
      console.error(
        "Notification loading error:",
        err
      );

      setError(
        err.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);


  // ==========================================
  // FORM CHANGE
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
  // CREATE NOTIFICATION
  // ==========================================

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.user_id.trim() ||
      !formData.title.trim() ||
      !formData.message.trim()
    ) {
      setError(
        "Please fill all notification fields."
      );
      return;
    }

    try {
      setSaving(true);

      await createNotification({
        user_id:
          formData.user_id.trim(),

        title:
          formData.title.trim(),

        message:
          formData.message.trim(),

        notification_type:
          formData.notification_type,
      });


      setFormData({
        user_id: "",
        title: "",
        message: "",
        notification_type: "info",
      });

      setShowForm(false);

      /*
       * Refresh current user's
       * notifications.
       */
      await loadNotifications();

    } catch (err) {
      console.error(
        "Create notification error:",
        err
      );

      setError(
        err.message ||
          "Failed to create notification."
      );
    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // MARK AS READ
  // ==========================================

  const handleRead = async (
    notificationId
  ) => {
    try {
      setError("");

      await markNotificationAsRead(
        notificationId
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );

    } catch (err) {
      console.error(
        "Mark notification error:",
        err
      );

      setError(
        err.message ||
          "Failed to mark notification as read."
      );
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
      user_id: "",
      title: "",
      message: "",
      notification_type: "info",
    });

    setError("");
  };


  // ==========================================
  // ICON
  // ==========================================

  const getNotificationIcon = (
    type
  ) => {
    if (type === "alert") {
      return <ShieldAlert size={18} />;
    }

    if (type === "warning") {
      return <AlertTriangle size={18} />;
    }

    return <Info size={18} />;
  };


  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString();
  };


  // ==========================================
  // COUNTS
  // ==========================================

  const unreadCount =
    notifications.filter(
      (item) => !item.is_read
    ).length;


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="notifications-page">

      {/* ======================================
          HEADER
      ======================================= */}

      <header className="notifications-header">

        <div className="notifications-title">

          <button
            type="button"
            className="notification-back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={18} />
          </button>


          <div className="notification-title-icon">
            <Bell size={24} />
          </div>


          <div>

            <span className="notification-eyebrow">
              ADMIN CONSOLE
            </span>

            <h1>
              Notifications
            </h1>

            <p>
              Manage transport safety
              notifications.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="add-notification-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          <Plus size={18} />
          Create Notification
        </button>

      </header>


      {/* ======================================
          ERROR
      ======================================= */}

      {error && (
        <div className="notification-error">

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

        <section className="notification-form-card">

          <div className="notification-form-header">

            <div>
              <span>
                NEW MESSAGE
              </span>

              <h2>
                Create Notification
              </h2>

              <p>
                Send a safety or transport
                update to a user.
              </p>
            </div>

            <button
              type="button"
              className="notification-close"
              onClick={closeForm}
              disabled={saving}
            >
              <X size={18} />
            </button>

          </div>


          <form
            className="notification-form"
            onSubmit={handleCreate}
          >

            {/* USER ID */}

            <div className="notification-field">

              <label htmlFor="user_id">
                User ID
              </label>

              <input
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                placeholder="Enter recipient user ID"
                autoComplete="off"
                required
              />

              <small>
                Enter the ID of the user who
                should receive this notification.
              </small>

            </div>


            {/* TITLE */}

            <div className="notification-field">

              <label htmlFor="title">
                Title
              </label>

              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Notification title"
                maxLength={100}
                required
              />

            </div>


            {/* MESSAGE */}

            <div className="notification-field">

              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your notification message..."
                rows={5}
                maxLength={500}
                required
              />

            </div>


            {/* TYPE */}

            <div className="notification-field">

              <label htmlFor="notification_type">
                Notification Type
              </label>

              <select
                id="notification_type"
                name="notification_type"
                value={
                  formData.notification_type
                }
                onChange={handleChange}
              >
                <option value="info">
                  Info
                </option>

                <option value="warning">
                  Warning
                </option>

                <option value="alert">
                  Alert
                </option>

              </select>

            </div>


            {/* ACTIONS */}

            <div className="notification-form-actions">

              <button
                type="button"
                className="notification-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="notification-save"
                disabled={saving}
              >
                {saving
                  ? "Sending..."
                  : "Send Notification"}
              </button>

            </div>

          </form>

        </section>

      )}


      {/* ======================================
          LIST
      ======================================= */}

      <section className="notifications-list-card">

        <div className="notifications-list-heading">

          <div>

            <span>
              INBOX
            </span>

            <h2>
              Your Notifications
            </h2>

            <p>
              Notifications for the currently
              logged-in account.
            </p>

          </div>


          <div className="notification-counts">

            <span className="total-count">
              {notifications.length}
            </span>

            {unreadCount > 0 && (
              <span className="unread-count">
                {unreadCount} unread
              </span>
            )}

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="notification-empty">

            <Bell size={38} />

            <h3>
              Loading notifications...
            </h3>

          </div>

        ) : notifications.length === 0 ? (

          /* EMPTY */

          <div className="notification-empty">

            <Bell size={40} />

            <h3>
              No notifications
            </h3>

            <p>
              You don't have any notifications
              right now.
            </p>

          </div>

        ) : (

          /* LIST */

          <div className="notification-list">

            {notifications.map(
              (notification) => (

                <article
                  className={`notification-item ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                  key={notification.id}
                >

                  <div
                    className={`notification-item-icon ${notification.notification_type}`}
                  >
                    {getNotificationIcon(
                      notification.notification_type
                    )}
                  </div>


                  <div className="notification-content">

                    <div className="notification-content-top">

                      <strong>
                        {notification.title}
                      </strong>

                      {!notification.is_read && (
                        <span className="new-badge">
                          NEW
                        </span>
                      )}

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    <div className="notification-meta">

                      <span>
                        {notification.notification_type}
                      </span>

                      <span>
                        {formatDate(
                          notification.created_at
                        )}
                      </span>

                    </div>

                  </div>


                  {!notification.is_read && (

                    <button
                      type="button"
                      className="notification-read-button"
                      onClick={() =>
                        handleRead(
                          notification.id
                        )
                      }
                    >
                      <Check size={16} />
                      Mark read
                    </button>

                  )}

                </article>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default Notifications;