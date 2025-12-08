import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { AthleteBrandingModal } from "./components/AthleteBrandingModal";
import "./admin.css";

interface Athlete {
  id: string;
  name: string;
  position?: string | null;
  position1?: string | null;
  position2?: string | null;
  teamName?: string | null;
  gradYear?: number | null;
  classYear?: number | null;
  nilScore?: number | null;
  avatarUrl?: string | null;
  participants?: Array<{ campaign: unknown }>;
  brandFitSummary?: string | null;
  scenarioIdeas?: Array<{
    id: string;
    title: string;
    goal: string;
    description: string;
    idealBrands: string;
  }>;
}

export function AthleteManagement() {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    async function fetchAthletes() {
      try {
        setLoading(true);
        const data = await apiClient.get<Athlete[]>("/api/athletes");
        setAthletes(data);
      } catch (err) {
        console.error("Failed to fetch athletes:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAthletes();
  }, []);

  const handleEditBranding = (athlete: Athlete) => {
    setEditingAthlete(athlete);
  };

  const handleBrandingSave = async () => {
    // Refresh athletes list
    try {
      const data = await apiClient.get<Athlete[]>("/api/athletes");
      setAthletes(data);
    } catch (err) {
      console.error("Failed to fetch athletes:", err);
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2 className="section-title">Athlete Management</h2>
        {/* <button
          className="btn-add"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          + Add Athlete
        </button> */}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Athlete</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddForm(false)}
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Athlete name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="SS / 2B"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Team</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Texas Bombers Gold 18U"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Grad Year</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="2027"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-submit">Add Athlete</button>
              <button
                className="btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--color-text)",
          }}
        >
          Loading athletes...
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Team</th>
                  <th>Grad Year</th>
                  <th>Campaigns</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {athletes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--color-muted)",
                      }}
                    >
                      No athletes found
                    </td>
                  </tr>
                ) : (
                  athletes.map((athlete) => {
                    const position =
                      athlete.position ||
                      [athlete.position1, athlete.position2]
                        .filter(Boolean)
                        .join(" / ") ||
                      "N/A";
                    const campaignsCount = athlete.participants?.length || 0;

                    return (
                      <tr key={athlete.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-sm)",
                            }}
                          >
                            <img
                              src={
                                athlete.avatarUrl ||
                                "https://via.placeholder.com/32x32?text=No+Photo"
                              }
                              alt={athlete.name}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            {athlete.name}
                          </div>
                        </td>
                        <td>{position}</td>
                        <td>{athlete.teamName || "N/A"}</td>
                        <td>
                          {athlete.gradYear || athlete.classYear || "N/A"}
                        </td>
                        <td>{campaignsCount}</td>
                        <td>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "0.75rem",
                              background: "rgba(93, 211, 158, 0.2)",
                              color: "var(--color-success)",
                              border: "1px solid rgba(93, 211, 158, 0.4)",
                            }}
                          >
                            Active
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-action"
                              onClick={() => handleEditBranding(athlete)}
                            >
                              Edit Branding
                            </button>
                            <button
                              className="btn-action"
                              onClick={() =>
                                navigate(`/athletes/${athlete.id}`)
                              }
                            >
                              View Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="athlete-cards-mobile">
            {athletes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--color-muted)",
                }}
              >
                No athletes found
              </div>
            ) : (
              athletes.map((athlete) => {
                const position =
                  athlete.position ||
                  [athlete.position1, athlete.position2]
                    .filter(Boolean)
                    .join(" / ") ||
                  "N/A";
                const campaignsCount = athlete.participants?.length || 0;

                return (
                  <div key={athlete.id} className="athlete-card-mobile">
                    <div className="athlete-card-header">
                      <img
                        src={
                          athlete.avatarUrl ||
                          "https://via.placeholder.com/48x48?text=No+Photo"
                        }
                        alt={athlete.name}
                        className="athlete-card-avatar"
                      />
                      <div className="athlete-card-info">
                        <h3 className="athlete-card-name">{athlete.name}</h3>
                        <span className="athlete-card-status">Active</span>
                      </div>
                    </div>
                    <div className="athlete-card-details">
                      <div className="athlete-card-detail">
                        <span className="detail-label">Position</span>
                        <span className="detail-value">{position}</span>
                      </div>
                      <div className="athlete-card-detail">
                        <span className="detail-label">Team</span>
                        <span className="detail-value">
                          {athlete.teamName || "N/A"}
                        </span>
                      </div>
                      <div className="athlete-card-detail">
                        <span className="detail-label">Grad Year</span>
                        <span className="detail-value">
                          {athlete.gradYear || athlete.classYear || "N/A"}
                        </span>
                      </div>
                      <div className="athlete-card-detail">
                        <span className="detail-label">Campaigns</span>
                        <span className="detail-value">{campaignsCount}</span>
                      </div>
                    </div>
                    <div className="athlete-card-actions">
                      <button
                        className="btn-action btn-action-mobile"
                        onClick={() => handleEditBranding(athlete)}
                      >
                        Edit Branding
                      </button>
                      <button
                        className="btn-action btn-action-mobile"
                        onClick={() => navigate(`/athletes/${athlete.id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {editingAthlete && (
        <AthleteBrandingModal
          athleteId={editingAthlete.id}
          athleteName={editingAthlete.name}
          currentBrandFitSummary={editingAthlete.brandFitSummary || ""}
          currentScenarioIdeas={(editingAthlete.scenarioIdeas || []).map(
            (si) => ({
              id: si.id,
              title: si.title,
              goal: si.goal,
              description: si.description,
              idealBrands: si.idealBrands,
            })
          )}
          onClose={() => setEditingAthlete(null)}
          onSave={handleBrandingSave}
        />
      )}
    </div>
  );
}
