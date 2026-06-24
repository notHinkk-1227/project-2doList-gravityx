import "./Logout.css";

function Logout({ show, onClose }) {
  if (!show) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="lo-overlay" onClick={onClose}>
      <div className="lo-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="lo-title">Logout Confirmation</h2>
        <p className="lo-text">Are you sure you want to logout?</p>
        <div className="lo-footer">
          <button className="lo-confirm" onClick={handleLogout}>Confirm</button>
          <button className="lo-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Logout;