import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Cek dari keduanya: localStorage (remember me) dan sessionStorage (sesi biasa)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;