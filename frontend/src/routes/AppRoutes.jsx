import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RegisterPage from "../pages/Register/RegisterPage";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect "/" langsung ke "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
            path="/dashboard"
            element={
                <ProtectedRoute>
                <DashboardPage />
                </ProtectedRoute>
            }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;