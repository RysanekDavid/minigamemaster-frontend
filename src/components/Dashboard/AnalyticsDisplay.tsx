import React from "react";

const AnalyticsDisplay: React.FC = () => {
  // Placeholder data - replace with actual fetched data later
  const stats = {
    gamesPlayed: 15,
    uniquePlayers: 8,
    // Add more stats later
  };

  // TODO: Fetch analytics data on component mount

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        margin: "10px 0",
        borderRadius: "5px",
      }}
    >
      <h3>Analytics (Basic Placeholder)</h3>
      <p>Total Games Played: {stats.gamesPlayed}</p>
      <p>Unique Players Today: {stats.uniquePlayers}</p>
      {/* Add more detailed analytics display here later */}
      <p>
        <i>More detailed analytics coming soon...</i>
      </p>
    </div>
  );
};

export default AnalyticsDisplay;
