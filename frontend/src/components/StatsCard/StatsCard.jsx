import "./StatsCard.css";

function StatsCard({ label, value, icon, iconColor, extra }) {
  return (
    <div className="sc-card">
      <div className="sc-card__header">
        <span className="sc-card__label">{label}</span>
        <span className={`sc-card__icon sc-card__icon--${iconColor}`}>
          {icon}
        </span>
      </div>
      <div className="sc-card__value">{value}</div>
      {extra && <div className="sc-card__extra">{extra}</div>}
    </div>
  );
}

export default StatsCard;