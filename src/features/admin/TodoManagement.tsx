import { useState, useEffect } from "react";
import { apiClient } from "../../lib/apiClient";
import { Modal } from "../../components/ui/Modal";
import "./admin.css";

interface Todo {
  id: string;
  title: string;
  description: string;
  athlete: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  assignedBy: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  campaignId?: string | null;
  verificationType?:
    | "SOCIAL_POST"
    | "IN_PERSON_EVENT"
    | "COMMERCIAL_VIDEO"
    | "OTHER"
    | null;
  verificationUrl?: string | null;
  verificationNotes?: string | null;
  verifiedAt?: string | null;
}

interface Athlete {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  title: string;
  organization: {
    id: string;
    name: string;
  };
}

export function TodoManagement() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    athleteId: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    campaignId: "",
    verificationType: "" as
      | ""
      | "SOCIAL_POST"
      | "IN_PERSON_EVENT"
      | "COMMERCIAL_VIDEO"
      | "OTHER",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
    fetchAthletes();
    fetchCampaigns();
  }, []);

  const fetchTodos = async () => {
    try {
      const data = await apiClient.get<Todo[]>("/api/admin/todos");
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAthletes = async () => {
    try {
      const data = await apiClient.get<Athlete[]>("/api/athletes");
      setAthletes(data);
    } catch (error) {
      console.error("Failed to fetch athletes:", error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get<Campaign[]>("/api/admin/campaigns");
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/admin/todos", {
        title: formData.title,
        description: formData.description,
        athleteId: formData.athleteId,
        dueDate: formData.dueDate,
        priority: formData.priority,
        campaignId: formData.campaignId || undefined,
        verificationType: formData.verificationType || undefined,
        assignedBy: "Admin", // TODO: Get from auth context
      });
      setShowAddForm(false);
      setFormData({
        title: "",
        description: "",
        athleteId: "",
        dueDate: "",
        priority: "medium",
        campaignId: "",
        verificationType: "",
      });
      fetchTodos();
    } catch (error) {
      console.error("Failed to create todo:", error);
      alert("Failed to create todo. Please try again.");
    }
  };

  const handleUpdateTodo = async (id: string) => {
    try {
      await apiClient.put(`/api/admin/todos/${id}`, {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: todos.find((t) => t.id === id)?.status || "pending",
      });
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        athleteId: "",
        dueDate: "",
        priority: "medium",
        campaignId: "",
        verificationType: "",
      });
      fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
      alert("Failed to update todo. Please try again.");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;
    try {
      await apiClient.delete(`/api/admin/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
      alert("Failed to delete todo. Please try again.");
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setFormData({
      title: todo.title,
      description: todo.description,
      athleteId: todo.athlete.id,
      dueDate: new Date(todo.dueDate).toISOString().split("T")[0],
      priority: todo.priority,
      campaignId: todo.campaignId || "",
      verificationType: (todo.verificationType || "") as
        | ""
        | "SOCIAL_POST"
        | "IN_PERSON_EVENT"
        | "COMMERCIAL_VIDEO"
        | "OTHER",
    });
    setShowAddForm(false);
  };

  const isOverdue = (todo: Todo): boolean => {
    if (todo.status !== "pending") return false;
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  if (loading) {
    return <div className="management-section">Loading todos...</div>;
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2 className="section-title">Todo Management</h2>
        <button
          className="btn-add"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              athleteId: "",
              dueDate: "",
              priority: "medium",
              campaignId: "",
              verificationType: "",
            });
          }}
        >
          + Create Todo
        </button>
      </div>

      <Modal
        isOpen={showAddForm || !!editingId}
        onClose={() => {
          setShowAddForm(false);
          setEditingId(null);
          setFormData({
            title: "",
            description: "",
            athleteId: "",
            dueDate: "",
            priority: "medium",
            campaignId: "",
            verificationType: "",
          });
        }}
        title={editingId ? "Edit Todo" : "Create New Todo"}
        size="medium"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingId) {
              handleUpdateTodo(editingId);
            } else {
              handleCreateTodo(e);
            }
          }}
        >
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Todo title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Detailed description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select
                className="form-select"
                value={formData.athleteId}
                onChange={(e) =>
                  setFormData({ ...formData, athleteId: e.target.value })
                }
                required
                disabled={!!editingId}
              >
                <option value="">Select athlete...</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Campaign (optional)</label>
            <select
              className="form-select"
              value={formData.campaignId}
              onChange={(e) =>
                setFormData({ ...formData, campaignId: e.target.value })
              }
            >
              <option value="">No campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title} - {campaign.organization.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Verification Type (optional)</label>
            <select
              className="form-select"
              value={formData.verificationType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  verificationType: e.target.value as
                    | ""
                    | "SOCIAL_POST"
                    | "IN_PERSON_EVENT"
                    | "COMMERCIAL_VIDEO"
                    | "OTHER",
                })
              }
            >
              <option value="">No verification required</option>
              <option value="SOCIAL_POST">Social Post Link</option>
              <option value="IN_PERSON_EVENT">In-Person Event Check-in</option>
              <option value="COMMERCIAL_VIDEO">Commercial Video Link</option>
              <option value="OTHER">Other Verification</option>
            </select>
            <small
              style={{
                color: "var(--color-muted)",
                fontSize: "0.75rem",
                marginTop: "4px",
                display: "block",
              }}
            >
              Athletes will need to provide a link or check-in to complete this
              task
            </small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? "Update Todo" : "Create Todo"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                  title: "",
                  description: "",
                  athleteId: "",
                  dueDate: "",
                  priority: "medium",
                  campaignId: "",
                  verificationType: "",
                });
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
              <th>Title</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "var(--space-xl)" }}
                >
                  No todos yet. Create your first todo above.
                </td>
              </tr>
            ) : (
              todos.map((todo) => {
                const overdue = isOverdue(todo);
                return (
                  <tr
                    key={todo.id}
                    style={
                      overdue
                        ? {
                            backgroundColor: "rgba(226, 61, 61, 0.1)",
                            borderLeft: "3px solid var(--color-danger)",
                          }
                        : {}
                    }
                  >
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{todo.title}</div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {todo.description}
                        </div>
                      </div>
                    </td>
                    <td>{todo.athlete.name}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          background:
                            todo.priority === "high"
                              ? "rgba(226, 61, 61, 0.2)"
                              : todo.priority === "medium"
                                ? "rgba(246, 196, 83, 0.2)"
                                : "rgba(98, 183, 255, 0.2)",
                          color:
                            todo.priority === "high"
                              ? "var(--color-danger)"
                              : todo.priority === "medium"
                                ? "var(--color-warning)"
                                : "var(--color-accentSoft)",
                          border: `1px solid ${
                            todo.priority === "high"
                              ? "rgba(226, 61, 61, 0.4)"
                              : todo.priority === "medium"
                                ? "rgba(246, 196, 83, 0.4)"
                                : "rgba(98, 183, 255, 0.4)"
                          }`,
                          textTransform: "capitalize",
                        }}
                      >
                        {todo.priority}
                      </span>
                    </td>
                    <td
                      style={
                        overdue
                          ? { color: "var(--color-danger)", fontWeight: 600 }
                          : {}
                      }
                    >
                      {new Date(todo.dueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          background: "rgba(98, 183, 255, 0.2)",
                          color: "var(--color-accentSoft)",
                          border: "1px solid rgba(98, 183, 255, 0.4)",
                          textTransform: "capitalize",
                        }}
                      >
                        {todo.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {todo.verificationType ? (
                        <div style={{ fontSize: "0.85rem" }}>
                          <div style={{ marginBottom: "4px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                background: "rgba(148, 163, 184, 0.2)",
                                color: "var(--color-muted)",
                                textTransform: "capitalize",
                              }}
                            >
                              {todo.verificationType
                                .replace("_", " ")
                                .toLowerCase()}
                            </span>
                          </div>
                          {todo.verifiedAt ? (
                            <div>
                              <span
                                style={{
                                  color: "var(--color-success)",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✓ Verified
                              </span>
                              {todo.verificationUrl && (
                                <div style={{ marginTop: "4px" }}>
                                  <a
                                    href={todo.verificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "var(--color-accentSoft)",
                                      fontSize: "0.75rem",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    View Link
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              style={{
                                color: "var(--color-warning)",
                                fontSize: "0.75rem",
                              }}
                            >
                              Pending
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            color: "var(--color-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action"
                          onClick={() => startEdit(todo)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action danger"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          Delete
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
      <div className="todo-cards-mobile">
        {todos.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--color-muted)",
            }}
          >
            No todos yet. Create your first todo above.
          </div>
        ) : (
          todos.map((todo) => {
            const overdue = isOverdue(todo);
            return (
              <div
                key={todo.id}
                className="todo-card-mobile"
                style={
                  overdue
                    ? {
                        borderLeft: "3px solid var(--color-danger)",
                        backgroundColor: "rgba(226, 61, 61, 0.05)",
                      }
                    : {}
                }
              >
                <div className="todo-card-header">
                  <div className="todo-card-title-row">
                    <h3 className="todo-card-title">{todo.title}</h3>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        background:
                          todo.priority === "high"
                            ? "rgba(226, 61, 61, 0.2)"
                            : todo.priority === "medium"
                              ? "rgba(246, 196, 83, 0.2)"
                              : "rgba(98, 183, 255, 0.2)",
                        color:
                          todo.priority === "high"
                            ? "var(--color-danger)"
                            : todo.priority === "medium"
                              ? "var(--color-warning)"
                              : "var(--color-accentSoft)",
                        border: `1px solid ${
                          todo.priority === "high"
                            ? "rgba(226, 61, 61, 0.4)"
                            : todo.priority === "medium"
                              ? "rgba(246, 196, 83, 0.4)"
                              : "rgba(98, 183, 255, 0.4)"
                        }`,
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {todo.priority}
                    </span>
                  </div>
                  {todo.description && (
                    <p className="todo-card-description">{todo.description}</p>
                  )}
                </div>

                <div className="todo-card-details">
                  <div className="todo-card-detail">
                    <span className="detail-label">Assigned To</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-xs)",
                      }}
                    >
                      {todo.athlete.avatarUrl && (
                        <img
                          src={todo.athlete.avatarUrl}
                          alt={todo.athlete.name}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <span className="detail-value">{todo.athlete.name}</span>
                    </div>
                  </div>
                  <div className="todo-card-detail">
                    <span className="detail-label">Due Date</span>
                    <span
                      className="detail-value"
                      style={
                        overdue
                          ? { color: "var(--color-danger)", fontWeight: 600 }
                          : {}
                      }
                    >
                      {new Date(todo.dueDate).toLocaleDateString()}
                      {overdue && (
                        <span
                          style={{
                            marginLeft: "var(--space-xs)",
                            fontSize: "0.75rem",
                          }}
                        >
                          (Overdue)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="todo-card-detail">
                    <span className="detail-label">Status</span>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        background: "rgba(98, 183, 255, 0.2)",
                        color: "var(--color-accentSoft)",
                        border: "1px solid rgba(98, 183, 255, 0.4)",
                        textTransform: "capitalize",
                        display: "inline-block",
                      }}
                    >
                      {todo.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="todo-card-detail">
                    <span className="detail-label">Verification</span>
                    <span className="detail-value">
                      {todo.verificationType ? (
                        <div style={{ fontSize: "0.85rem" }}>
                          <div style={{ marginBottom: "4px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                background: "rgba(148, 163, 184, 0.2)",
                                color: "var(--color-muted)",
                                textTransform: "capitalize",
                              }}
                            >
                              {todo.verificationType
                                .replace("_", " ")
                                .toLowerCase()}
                            </span>
                          </div>
                          {todo.verifiedAt ? (
                            <div>
                              <span
                                style={{
                                  color: "var(--color-success)",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✓ Verified
                              </span>
                              {todo.verificationUrl && (
                                <div style={{ marginTop: "4px" }}>
                                  <a
                                    href={todo.verificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "var(--color-accentSoft)",
                                      fontSize: "0.75rem",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    View Link
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              style={{
                                color: "var(--color-warning)",
                                fontSize: "0.75rem",
                              }}
                            >
                              Pending
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            color: "var(--color-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          —
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="todo-card-actions">
                  <button
                    className="btn-action btn-action-mobile"
                    onClick={() => startEdit(todo)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-action btn-action-mobile danger"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
