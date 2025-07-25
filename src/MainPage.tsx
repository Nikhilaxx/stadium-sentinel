// src/MainPage.tsx
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Choose Your Interface</h1>
      <button
        onClick={() => navigate("/user")}
        style={{
          padding: "1rem 2rem",
          margin: "1rem",
          fontSize: "1.2rem",
          cursor: "pointer",
          borderRadius: "8px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
        }}
      >
        User
      </button>
      <button
        onClick={() => navigate("/police")}
        style={{
          padding: "1rem 2rem",
          margin: "1rem",
          fontSize: "1.2rem",
          cursor: "pointer",
          borderRadius: "8px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
        }}
      >
        Police
      </button>
    </div>
  );
}
