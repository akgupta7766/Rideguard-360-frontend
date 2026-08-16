import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Buses from "./pages/admin/Buses";
import Drivers from "./pages/admin/Drivers";
import Students from "./pages/admin/Students";
import Parents from "./pages/admin/Parents";
import RoutesPage from "./pages/admin/Routes";
import Notifications from "./pages/admin/Notifications";
import Emergencies from "./pages/admin/Emergencies";

import DriverDashboard from "./pages/driver/DriverDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================
            PUBLIC PAGES
        ================================== */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================
            ADMIN ROUTES
        ================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            />
          }
        >

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/buses"
            element={<Buses />}
          />

          <Route
            path="/admin/drivers"
            element={<Drivers />}
          />

          <Route
            path="/admin/students"
            element={<Students />}
          />

          <Route
            path="/admin/parents"
            element={<Parents />}
          />

          <Route
            path="/admin/routes"
            element={<RoutesPage />}
          />

          <Route
            path="/admin/notifications"
            element={<Notifications />}
          />

          <Route
            path="/admin/emergencies"
            element={<Emergencies />}
          />

        </Route>


        {/* =================================
            DRIVER ROUTES
        ================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["driver"]}
            />
          }
        >

          <Route
            path="/driver"
            element={<DriverDashboard />}
          />

        </Route>


        {/* =================================
            PARENT ROUTES
        ================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["parent"]}
            />
          }
        >

          <Route
            path="/parent"
            element={<ParentDashboard />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}


export default App;