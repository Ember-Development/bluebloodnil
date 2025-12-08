import { useState, useEffect } from "react";
import { apiClient } from "../../lib/apiClient";
import { Modal } from "../../components/ui/Modal";
import "./admin.css";
import type { Brand } from "./types";

export function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    tier: "",
    category: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await apiClient.get<Brand[]>("/api/admin/organizations");
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/admin/organizations", {
        name: formData.name,
        logoUrl: formData.logoUrl || undefined,
        tier: formData.tier || undefined,
        category: formData.category || undefined,
      });
      setShowAddForm(false);
      setFormData({ name: "", logoUrl: "", tier: "", category: "" });
      fetchBrands();
    } catch (error) {
      console.error("Failed to create brand:", error);
      alert("Failed to create brand. Please try again.");
    }
  };

  const handleUpdateBrand = async (id: string) => {
    try {
      await apiClient.put(`/api/admin/organizations/${id}`, {
        name: formData.name,
        logoUrl: formData.logoUrl || undefined,
        tier: formData.tier || undefined,
        category: formData.category || undefined,
      });
      setEditingId(null);
      setFormData({ name: "", logoUrl: "", tier: "", category: "" });
      fetchBrands();
    } catch (error) {
      console.error("Failed to update brand:", error);
      alert("Failed to update brand. Please try again.");
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this brand? This will also delete all associated campaigns."
      )
    )
      return;
    try {
      await apiClient.delete(`/api/admin/organizations/${id}`);
      fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
      alert("Failed to delete brand. Please try again.");
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name,
      logoUrl: brand.logoUrl || "",
      tier: brand.tier || "",
      category: brand.category || "",
    });
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="management-section">Loading brands...</div>;
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2 className="section-title">Brand Partner Management</h2>
        <button
          className="btn-add"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({ name: "", logoUrl: "", tier: "", category: "" });
          }}
        >
          + Add Brand
        </button>
      </div>

      <Modal
        isOpen={showAddForm || !!editingId}
        onClose={() => {
          setShowAddForm(false);
          setEditingId(null);
          setFormData({ name: "", logoUrl: "", tier: "", category: "" });
        }}
        title={editingId ? "Edit Brand Partner" : "Add New Brand Partner"}
        size="medium"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingId) {
              handleUpdateBrand(editingId);
            } else {
              handleCreateBrand(e);
            }
          }}
        >
          <div className="form-group">
            <label className="form-label">Brand Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brand name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="">Select category...</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
                <option value="Apparel & Fashion">Apparel & Fashion</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Automotive">Automotive</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Finance">Finance</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Travel & Hospitality">
                  Travel & Hospitality
                </option>
                <option value="Retail">Retail</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tier</label>
              <select
                className="form-select"
                value={formData.tier}
                onChange={(e) =>
                  setFormData({ ...formData, tier: e.target.value })
                }
              >
                <option value="">Select tier...</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Logo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
              />
              <small
                style={{
                  color: "var(--color-muted)",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Recommended: Square image, minimum 120x120px (logos display at
                28-80px depending on location)
              </small>
              {formData.logoUrl && (
                <div
                  style={{
                    marginTop: "var(--space-sm)",
                    padding: "var(--space-sm)",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-line)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-muted)",
                      marginBottom: "var(--space-xs)",
                    }}
                  >
                    Preview:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-md)",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={formData.logoUrl}
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "var(--radius-md)",
                          objectFit: "cover",
                          border: "2px solid var(--color-accentSoft)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        Member Card (80px)
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={formData.logoUrl}
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        Campaign Card (48px)
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={formData.logoUrl}
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        Feed Card (28px)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? "Update Brand" : "Add Brand"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ name: "", logoUrl: "", tier: "", category: "" });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Desktop Table View */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Category</th>
              <th>Tier</th>
              <th>Campaigns</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "var(--space-xl)" }}
                >
                  No brands yet. Create your first brand above.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-sm)",
                      }}
                    >
                      {brand.logoUrl && (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {brand.name}
                    </div>
                  </td>
                  <td>
                    {brand.category || (
                      <span
                        style={{
                          color: "var(--color-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Not set
                      </span>
                    )}
                  </td>
                  <td>
                    {brand.tier && (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          background: "rgba(246, 196, 83, 0.2)",
                          color: "var(--color-warning)",
                          border: "1px solid rgba(246, 196, 83, 0.4)",
                        }}
                      >
                        {brand.tier}
                      </span>
                    )}
                  </td>
                  <td>{brand.campaignsCount || 0}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-action"
                        onClick={() => startEdit(brand)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-action danger"
                        onClick={() => handleDeleteBrand(brand.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="brand-cards-mobile">
        {brands.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--color-muted)",
            }}
          >
            No brands yet. Create your first brand above.
          </div>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="brand-card-mobile">
              <div className="brand-card-header">
                {brand.logoUrl && (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="brand-card-logo"
                  />
                )}
                <div className="brand-card-info">
                  <h3 className="brand-card-name">{brand.name}</h3>
                  {brand.tier && (
                    <span className="brand-card-tier">{brand.tier}</span>
                  )}
                </div>
              </div>
              <div className="brand-card-details">
                <div className="brand-card-detail">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">
                    {brand.category || (
                      <span
                        style={{
                          color: "var(--color-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Not set
                      </span>
                    )}
                  </span>
                </div>
                <div className="brand-card-detail">
                  <span className="detail-label">Campaigns</span>
                  <span className="detail-value">
                    {brand.campaignsCount || 0}
                  </span>
                </div>
              </div>
              <div className="brand-card-actions">
                <button
                  className="btn-action btn-action-mobile"
                  onClick={() => startEdit(brand)}
                >
                  Edit
                </button>
                <button
                  className="btn-action btn-action-mobile danger"
                  onClick={() => handleDeleteBrand(brand.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
