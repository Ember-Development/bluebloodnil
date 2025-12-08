import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { Modal } from "../../components/ui/Modal";
import "./admin.css";
import type {
  Brand,
  Campaign,
  CampaignType,
  EarningsSplitMethod,
} from "./types";

interface Athlete {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizationId: "",
    athleteIds: [] as string[],
    status: "DRAFT" as "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED",
    type: "" as CampaignType | "",
    isOpen: false,
    address: "",
    startDate: "",
    endDate: "",
    totalEarnings: "",
    earningsSplitMethod: "EQUAL" as EarningsSplitMethod,
    athleteEarnings: {} as Record<string, string>,
  });
  const [showAssignForm, setShowAssignForm] = useState<string | null>(null);
  const [assignAthleteIds, setAssignAthleteIds] = useState<string[]>([]);
  const [createTodos, setCreateTodos] = useState(false);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDescription, setTodoDescription] = useState("");
  const [todoDueDate, setTodoDueDate] = useState("");
  const [todoPriority, setTodoPriority] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [closingCampaign, setClosingCampaign] = useState<Campaign | null>(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(
    new Set()
  );
  const [campaignResults, setCampaignResults] = useState({
    links: [] as string[],
    metrics: {
      views: "",
      likes: "",
      comments: "",
      shares: "",
      reach: "",
      engagement: "",
      attendance: "",
      sales: "",
    },
    notes: "",
    mediaUrls: [] as string[],
  });

  // Add error state
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchBrands();
    fetchAthletes();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get<Campaign[]>("/api/admin/campaigns");
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await apiClient.get<Brand[]>("/api/admin/organizations");
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
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

  // Add validation function
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Required fields
    if (!formData.title.trim()) {
      errors.title = "Campaign title is required";
    }

    if (!formData.type) {
      errors.type = "Campaign type is required";
    }

    if (!formData.organizationId) {
      errors.organizationId = "Brand is required";
    }

    // Address required for in-person campaigns
    if (formData.type === "IN_PERSON_APPEARANCE" && !formData.address.trim()) {
      errors.address = "Address is required for in-person campaigns";
    }

    // Validate earnings if provided
    if (formData.totalEarnings) {
      const totalEarningsNum = parseFloat(formData.totalEarnings);
      if (isNaN(totalEarningsNum) || totalEarningsNum < 0) {
        errors.totalEarnings = "Total earnings must be a valid positive number";
      }

      // Validate custom percentages
      if (
        formData.earningsSplitMethod === "CUSTOM" &&
        formData.athleteIds.length > 0
      ) {
        const percentages = formData.athleteIds.map(
          (id) => parseFloat(formData.athleteEarnings[id] || "0") || 0
        );
        const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);

        if (totalPercentage === 0) {
          errors.athleteEarnings =
            "At least one athlete must have a percentage greater than 0";
        } else if (Math.abs(totalPercentage - 100) > 0.01) {
          errors.athleteEarnings = `Percentages must total 100% (currently ${totalPercentage.toFixed(1)}%)`;
        }

        // Check for negative percentages
        const hasNegative = percentages.some((p) => p < 0);
        if (hasNegative) {
          errors.athleteEarnings = "Percentages cannot be negative";
        }

        // Check for percentages over 100%
        const hasOver100 = percentages.some((p) => p > 100);
        if (hasOver100) {
          errors.athleteEarnings = "Individual percentages cannot exceed 100%";
        }
      }
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFormErrors({});

    // Validate form
    if (!validateForm()) {
      setSubmitError("Please fix the errors below before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        totalEarnings: formData.totalEarnings
          ? parseFloat(formData.totalEarnings)
          : undefined,
        athleteEarnings:
          formData.earningsSplitMethod === "CUSTOM" && formData.totalEarnings
            ? Object.fromEntries(
                Object.entries(formData.athleteEarnings).map(([id, val]) => [
                  id,
                  parseFloat(val) || 0,
                ])
              )
            : undefined,
      };
      delete payload.athleteEarnings; // Remove the string version
      if (payload.athleteEarnings) {
        payload.athleteEarnings = Object.fromEntries(
          Object.entries(payload.athleteEarnings).map(([id, val]) => [
            id,
            parseFloat(val as string) || 0,
          ])
        );
      }
      await apiClient.post("/api/admin/campaigns", payload);
      setShowAddForm(false);
      resetFormData();
      setFormErrors({});
      setSubmitError(null);
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Failed to create campaign:", error);

      // Handle API errors
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create campaign. Please try again.";
      setSubmitError(errorMessage);

      // Set field-specific errors if provided by API
      if (error?.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      const payload: any = {
        ...formData,
        totalEarnings: formData.totalEarnings
          ? parseFloat(formData.totalEarnings)
          : undefined,
        athleteEarnings:
          formData.earningsSplitMethod === "CUSTOM" && formData.totalEarnings
            ? Object.fromEntries(
                Object.entries(formData.athleteEarnings).map(([id, val]) => [
                  id,
                  parseFloat(val) || 0,
                ])
              )
            : undefined,
      };
      delete payload.athleteEarnings; // Remove the string version
      if (payload.athleteEarnings) {
        payload.athleteEarnings = Object.fromEntries(
          Object.entries(payload.athleteEarnings).map(([id, val]) => [
            id,
            parseFloat(val as string) || 0,
          ])
        );
      }
      await apiClient.put(
        `/api/admin/campaigns/${editingCampaign.id}`,
        payload
      );
      setEditingCampaign(null);
      resetFormData();
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to update campaign:", error);
      alert("Failed to update campaign. Please try again.");
    }
  };

  const handleCloseCampaign = async () => {
    if (!closingCampaign) return;
    try {
      await apiClient.post(`/api/admin/campaigns/${closingCampaign.id}/close`, {
        results: campaignResults,
      });
      setClosingCampaign(null);
      setCampaignResults({
        links: [],
        metrics: {
          views: "",
          likes: "",
          comments: "",
          shares: "",
          reach: "",
          engagement: "",
          attendance: "",
          sales: "",
        },
        notes: "",
        mediaUrls: [],
      });
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to close campaign:", error);
      alert("Failed to close campaign. Please try again.");
    }
  };

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const handleAcceptApplication = async (
    campaignId: string,
    participantId: string
  ) => {
    try {
      await apiClient.post(
        `/api/admin/campaigns/${campaignId}/applications/${participantId}/accept`,
        {}
      );
      await fetchCampaigns();
    } catch (error) {
      console.error("Failed to accept application:", error);
      alert("Failed to accept application. Please try again.");
    }
  };

  const handleDenyApplication = async (
    campaignId: string,
    participantId: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to deny this application? The athlete will be notified."
      )
    )
      return;
    try {
      await apiClient.post(
        `/api/admin/campaigns/${campaignId}/applications/${participantId}/deny`,
        {}
      );
      await fetchCampaigns();
    } catch (error) {
      console.error("Failed to deny application:", error);
      alert("Failed to deny application. Please try again.");
    }
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      organizationId: "",
      athleteIds: [],
      status: "DRAFT",
      type: "",
      isOpen: false,
      address: "",
      startDate: "",
      endDate: "",
      totalEarnings: "",
      earningsSplitMethod: "EQUAL",
      athleteEarnings: {},
    });
    setFormErrors({});
    setSubmitError(null);
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description || "",
      organizationId: campaign.organization.id,
      athleteIds: campaign.participants.map((p) => p.athlete.id),
      status: campaign.status,
      type: campaign.type,
      isOpen: campaign.isOpen,
      address: campaign.address || "",
      startDate: campaign.startDate
        ? new Date(campaign.startDate).toISOString().split("T")[0]
        : "",
      endDate: campaign.endDate
        ? new Date(campaign.endDate).toISOString().split("T")[0]
        : "",
      totalEarnings: campaign.totalEarnings?.toString() || "",
      earningsSplitMethod: campaign.earningsSplitMethod,
      athleteEarnings: campaign.participants.reduce(
        (acc, p) => {
          if (p.earnings) acc[p.athlete.id] = p.earnings.toString();
          return acc;
        },
        {} as Record<string, string>
      ),
    });
  };

  const handleAssignAthletes = async (campaignId: string) => {
    try {
      // Assign athletes to campaign
      await apiClient.post(
        `/api/admin/campaigns/${campaignId}/assign-athletes`,
        {
          athleteIds: assignAthleteIds,
        }
      );

      // Optionally create todos for assigned athletes
      if (
        createTodos &&
        assignAthleteIds.length > 0 &&
        todoTitle &&
        todoDueDate
      ) {
        const todoPromises = assignAthleteIds.map((athleteId) =>
          apiClient.post("/api/admin/todos", {
            title: todoTitle,
            description:
              todoDescription ||
              `Complete tasks for campaign: ${campaigns.find((c) => c.id === campaignId)?.title}`,
            athleteId,
            dueDate: todoDueDate,
            priority: todoPriority,
            campaignId,
            assignedBy: "Admin",
          })
        );
        await Promise.all(todoPromises);
      }

      setShowAssignForm(null);
      setAssignAthleteIds([]);
      setCreateTodos(false);
      setTodoTitle("");
      setTodoDescription("");
      setTodoDueDate("");
      setTodoPriority("medium");
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to assign athletes:", error);
      alert("Failed to assign athletes. Please try again.");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await apiClient.delete(`/api/admin/campaigns/${id}`);
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign. Please try again.");
    }
  };

  // Helper to get relevant fields based on campaign type
  const getResultsFieldsForType = (type: CampaignType) => {
    switch (type) {
      case "SOCIAL_MEDIA_POST":
        return {
          showLinks: true,
          showMetrics: true,
          metrics: [
            "views",
            "likes",
            "comments",
            "shares",
            "reach",
            "engagement",
          ],
          showMedia: false,
          showAttendance: false,
        };
      case "COMMERCIAL_VIDEO":
        return {
          showLinks: true,
          showMetrics: true,
          metrics: ["views", "likes", "comments", "shares", "engagement"],
          showMedia: true,
          showAttendance: false,
        };
      case "IN_PERSON_APPEARANCE":
        return {
          showLinks: false,
          showMetrics: true,
          metrics: ["attendance"],
          showMedia: true,
          showAttendance: true,
        };
      case "PHOTO_SHOOT":
        return {
          showLinks: true,
          showMetrics: false,
          metrics: [],
          showMedia: true,
          showAttendance: false,
        };
      case "PRODUCT_ENDORSEMENT":
        return {
          showLinks: true,
          showMetrics: true,
          metrics: ["views", "sales", "engagement"],
          showMedia: false,
          showAttendance: false,
        };
      case "AUTOGRAPH_SIGNING":
        return {
          showLinks: false,
          showMetrics: true,
          metrics: ["attendance"],
          showMedia: true,
          showAttendance: false,
        };
      case "SPEAKING_ENGAGEMENT":
        return {
          showLinks: false,
          showMetrics: true,
          metrics: ["attendance"],
          showMedia: true,
          showAttendance: true,
        };
      case "PARTNERSHIP":
        return {
          showLinks: true,
          showMetrics: true,
          metrics: ["views", "engagement", "sales"],
          showMedia: false,
          showAttendance: false,
        };
      default:
        return {
          showLinks: true,
          showMetrics: true,
          metrics: ["views", "likes", "comments", "shares"],
          showMedia: true,
          showAttendance: false,
        };
    }
  };

  // Add this helper function to format campaign types
  const formatCampaignType = (type: CampaignType): string => {
    const typeMap: Record<CampaignType, string> = {
      SOCIAL_MEDIA_POST: "Social Media Post",
      COMMERCIAL_VIDEO: "Commercial Video",
      IN_PERSON_APPEARANCE: "In-Person Appearance",
      PRODUCT_ENDORSEMENT: "Product Endorsement",
      AUTOGRAPH_SIGNING: "Autograph Signing",
      SPEAKING_ENGAGEMENT: "Speaking Engagement",
      PHOTO_SHOOT: "Photo Shoot",
      PARTNERSHIP: "Partnership",
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return <div className="management-section">Loading campaigns...</div>;
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2 className="section-title">Campaign Management</h2>
        <button
          className="btn-add"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          + Create Campaign
        </button>
      </div>

      <Modal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          resetFormData();
        }}
        title="Create New Campaign"
        size="large"
      >
        <form onSubmit={handleCreateCampaign}>
          {/* Show general error message */}
          {submitError && (
            <div
              style={{
                padding: "var(--space-md)",
                marginBottom: "var(--space-lg)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--color-danger)",
                fontSize: "0.9rem",
              }}
            >
              {submitError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Campaign Title
              <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.title ? "error" : ""}`}
              placeholder="Campaign title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (formErrors.title) {
                  setFormErrors({ ...formErrors, title: "" });
                }
              }}
              required
            />
            {formErrors.title && (
              <div
                style={{
                  color: "var(--color-danger)",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                }}
              >
                {formErrors.title}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Campaign Type{" "}
              <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <select
              className={`form-select ${formErrors.type ? "error" : ""}`}
              value={formData.type}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  type: e.target.value as CampaignType,
                });
                if (formErrors.type) {
                  setFormErrors({ ...formErrors, type: "" });
                }
              }}
              required
            >
              <option value="">Select type...</option>
              <option value="SOCIAL_MEDIA_POST">Social Media Post</option>
              <option value="COMMERCIAL_VIDEO">Commercial Video</option>
              <option value="IN_PERSON_APPEARANCE">In-Person Appearance</option>
              <option value="PRODUCT_ENDORSEMENT">Product Endorsement</option>
              <option value="AUTOGRAPH_SIGNING">Autograph Signing</option>
              <option value="SPEAKING_ENGAGEMENT">Speaking Engagement</option>
              <option value="PHOTO_SHOOT">Photo Shoot</option>
              <option value="PARTNERSHIP">Partnership</option>
            </select>
            {formErrors.type && (
              <div
                style={{
                  color: "var(--color-danger)",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                }}
              >
                {formErrors.type}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Campaign description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Brand
                <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <select
                className={`form-select ${formErrors.organizationId ? "error" : ""}`}
                value={formData.organizationId}
                onChange={(e) => {
                  setFormData({ ...formData, organizationId: e.target.value });
                  if (formErrors.organizationId) {
                    setFormErrors({ ...formErrors, organizationId: "" });
                  }
                }}
                required
              >
                <option value="">Select brand...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {formErrors.organizationId && (
                <div
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.85rem",
                    marginTop: "4px",
                  }}
                >
                  {formErrors.organizationId}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as typeof formData.status,
                  })
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) =>
                  setFormData({ ...formData, isOpen: e.target.checked })
                }
              />
              Open Campaign (Athletes can apply)
            </label>
            <small
              style={{
                color: "var(--color-muted)",
                fontSize: "0.8rem",
                marginLeft: "24px",
              }}
            >
              If checked, athletes will see an "Apply" button on the feed post
            </small>
          </div>

          {formData.type === "IN_PERSON_APPEARANCE" && (
            <div className="form-group">
              <label className="form-label">
                Address <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                type="text"
                className={`form-input ${formErrors.address ? "error" : ""}`}
                placeholder="Event address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (formErrors.address) {
                    setFormErrors({ ...formErrors, address: "" });
                  }
                }}
                required={formData.type === "IN_PERSON_APPEARANCE"}
              />
              {formErrors.address && (
                <div
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.85rem",
                    marginTop: "4px",
                  }}
                >
                  {formErrors.address}
                </div>
              )}
            </div>
          )}

          {/* Date Fields */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className={`form-input ${formErrors.startDate ? "error" : ""}`}
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  if (formErrors.startDate) {
                    setFormErrors({ ...formErrors, startDate: "" });
                  }
                  // Clear end date error if start date changes
                  if (formErrors.endDate) {
                    setFormErrors({ ...formErrors, endDate: "" });
                  }
                }}
              />
              {formErrors.startDate && (
                <div
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.85rem",
                    marginTop: "4px",
                  }}
                >
                  {formErrors.startDate}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className={`form-input ${formErrors.endDate ? "error" : ""}`}
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  if (formErrors.endDate) {
                    setFormErrors({ ...formErrors, endDate: "" });
                  }
                }}
              />
              {formErrors.endDate && (
                <div
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.85rem",
                    marginTop: "4px",
                  }}
                >
                  {formErrors.endDate}
                </div>
              )}
            </div>
          </div>

          {/* Earnings Section */}
          <div
            style={{
              marginTop: "var(--space-lg)",
              paddingTop: "var(--space-lg)",
              borderTop: "1px solid var(--color-line)",
            }}
          >
            <h4
              style={{
                marginBottom: "var(--space-md)",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Earnings
            </h4>
            <div className="form-group">
              <label className="form-label">Total Earnings (optional)</label>
              <input
                type="number"
                className={`form-input ${formErrors.totalEarnings ? "error" : ""}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.totalEarnings}
                onChange={(e) => {
                  setFormData({ ...formData, totalEarnings: e.target.value });
                  if (formErrors.totalEarnings) {
                    setFormErrors({ ...formErrors, totalEarnings: "" });
                  }
                }}
              />
              {formErrors.totalEarnings && (
                <div
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.85rem",
                    marginTop: "4px",
                  }}
                >
                  {formErrors.totalEarnings}
                </div>
              )}
            </div>
            {formData.totalEarnings && (
              <>
                <div className="form-group">
                  <label className="form-label">Split Method</label>
                  <select
                    className="form-select"
                    value={formData.earningsSplitMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        earningsSplitMethod: e.target
                          .value as EarningsSplitMethod,
                      })
                    }
                  >
                    <option value="EQUAL">Equal Split</option>
                    <option value="CUSTOM">Custom Percentages</option>
                  </select>
                </div>
                {formData.earningsSplitMethod === "CUSTOM" &&
                  formData.athleteIds.length > 0 && (
                    <div className="form-group">
                      <label className="form-label">
                        Earnings Percentage per Athlete
                        <small
                          style={{
                            display: "block",
                            color: "var(--color-muted)",
                            fontSize: "0.8rem",
                            marginTop: "4px",
                            fontWeight: "normal",
                          }}
                        >
                          Total available:{" "}
                          {formData.totalEarnings
                            ? `$${(parseFloat(formData.totalEarnings) * 0.6).toFixed(2)} (60% of total)`
                            : "0"}
                        </small>
                      </label>
                      {formData.athleteIds.map((athleteId) => {
                        const athlete = athletes.find(
                          (a) => a.id === athleteId
                        );
                        const totalAvailable = formData.totalEarnings
                          ? parseFloat(formData.totalEarnings) * 0.6
                          : 0;
                        const currentPercentage = formData.athleteEarnings[
                          athleteId
                        ]
                          ? parseFloat(formData.athleteEarnings[athleteId])
                          : 0;
                        const calculatedAmount =
                          totalAvailable * (currentPercentage / 100);

                        return (
                          <div
                            key={athleteId}
                            style={{ marginBottom: "var(--space-sm)" }}
                          >
                            <label
                              style={{
                                fontSize: "0.9rem",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              {athlete?.name || athleteId}
                            </label>
                            <div
                              style={{
                                display: "flex",
                                gap: "var(--space-sm)",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="number"
                                className={`form-input ${formErrors.athleteEarnings ? "error" : ""}`}
                                placeholder="0"
                                step="0.1"
                                min="0"
                                max="100"
                                value={
                                  formData.athleteEarnings[athleteId] || ""
                                }
                                onChange={(e) => {
                                  const percentage =
                                    parseFloat(e.target.value) || 0;
                                  setFormData({
                                    ...formData,
                                    athleteEarnings: {
                                      ...formData.athleteEarnings,
                                      [athleteId]: percentage.toString(),
                                    },
                                  });
                                  if (formErrors.athleteEarnings) {
                                    setFormErrors({
                                      ...formErrors,
                                      athleteEarnings: "",
                                    });
                                  }
                                }}
                                style={{ flex: 1, maxWidth: "120px" }}
                              />
                              <span
                                style={{
                                  fontSize: "0.9rem",
                                  color: "var(--color-muted)",
                                }}
                              >
                                %
                              </span>
                              {totalAvailable > 0 && currentPercentage > 0 && (
                                <span
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "var(--color-text)",
                                    marginLeft: "var(--space-xs)",
                                  }}
                                >
                                  = ${calculatedAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {formErrors.athleteEarnings && (
                        <div
                          style={{
                            color: "var(--color-danger)",
                            fontSize: "0.85rem",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.athleteEarnings}
                        </div>
                      )}
                      <small
                        style={{
                          color: "var(--color-muted)",
                          fontSize: "0.8rem",
                          display: "block",
                          marginTop: "var(--space-xs)",
                        }}
                      >
                        Percentages should total 100% of the 60% athlete pool
                      </small>
                      {/* Show percentage total */}
                      {formData.athleteIds.length > 0 && (
                        <div
                          style={{
                            marginTop: "var(--space-xs)",
                            padding: "var(--space-sm)",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "rgba(98, 183, 255, 0.1)",
                            border: "1px solid rgba(98, 183, 255, 0.2)",
                            fontSize: "0.85rem",
                          }}
                        >
                          Total:{" "}
                          {formData.athleteIds
                            .reduce((sum, id) => {
                              const pct = parseFloat(
                                formData.athleteEarnings[id] || "0"
                              );
                              return sum + (isNaN(pct) ? 0 : pct);
                            }, 0)
                            .toFixed(1)}
                          %
                        </div>
                      )}
                    </div>
                  )}
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Assign Athletes (optional)</label>
            <select
              className="form-select"
              multiple
              size={5}
              value={formData.athleteIds}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData({ ...formData, athleteIds: selected });
              }}
            >
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            <small style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
              Hold Ctrl/Cmd to select multiple athletes
            </small>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowAddForm(false);
                resetFormData();
              }}
              disabled={isSubmitting}
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
              <th>Campaign</th>
              <th>Type</th>
              <th>Brand</th>
              <th>Athletes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "var(--space-xl)" }}
                >
                  No campaigns yet. Create your first campaign above.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => {
                const isExpanded = expandedCampaigns.has(campaign.id);
                const pendingApplications = campaign.participants.filter(
                  (p) => p.status === "APPLIED"
                );
                const hasApplications =
                  campaign.isOpen && pendingApplications.length > 0;

                return (
                  <>
                    <tr
                      key={campaign.id}
                      style={{
                        cursor: hasApplications ? "pointer" : "default",
                        backgroundColor: isExpanded
                          ? "rgba(98, 183, 255, 0.05)"
                          : "transparent",
                      }}
                      onClick={() =>
                        hasApplications && toggleCampaignExpansion(campaign.id)
                      }
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-sm)",
                          }}
                        >
                          {hasApplications && (
                            <span
                              style={{
                                fontSize: "0.9rem",
                                color: "var(--color-accentSoft)",
                                transition: "transform 0.2s ease",
                              }}
                            >
                              {isExpanded ? "▼" : "▶"}
                            </span>
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {campaign.title}
                            </div>
                            {campaign.description && (
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "var(--color-muted)",
                                  marginTop: "4px",
                                }}
                              >
                                {campaign.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--color-text)",
                          }}
                        >
                          {formatCampaignType(campaign.type)}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-sm)",
                          }}
                        >
                          {campaign.organization.logoUrl && (
                            <img
                              src={campaign.organization.logoUrl}
                              alt={campaign.organization.name}
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          {campaign.organization.name}
                        </div>
                      </td>
                      <td>
                        <div>
                          {campaign.participants.length > 0 ? (
                            <div>
                              <div style={{ marginBottom: "4px" }}>
                                {
                                  campaign.participants.filter(
                                    (p) =>
                                      p.status === "ACCEPTED" ||
                                      p.status === "INVITED"
                                  ).length
                                }{" "}
                                assigned
                              </div>
                              {campaign.isOpen &&
                                campaign.participants.filter(
                                  (p) => p.status === "APPLIED"
                                ).length > 0 && (
                                  <div
                                    style={{
                                      fontSize: "0.85rem",
                                      color: "var(--color-warning)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {
                                      campaign.participants.filter(
                                        (p) => p.status === "APPLIED"
                                      ).length
                                    }{" "}
                                    pending application
                                    {campaign.participants.filter(
                                      (p) => p.status === "APPLIED"
                                    ).length !== 1
                                      ? "s"
                                      : ""}
                                  </div>
                                )}
                            </div>
                          ) : (
                            <span style={{ color: "var(--color-muted)" }}>
                              No athletes assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            background:
                              campaign.status === "ACTIVE"
                                ? "rgba(93, 211, 158, 0.2)"
                                : campaign.status === "COMPLETED"
                                  ? "rgba(98, 183, 255, 0.2)"
                                  : campaign.status === "ARCHIVED"
                                    ? "rgba(148, 163, 184, 0.2)"
                                    : "rgba(246, 196, 83, 0.2)",
                            color:
                              campaign.status === "ACTIVE"
                                ? "var(--color-success)"
                                : campaign.status === "COMPLETED"
                                  ? "var(--color-accentSoft)"
                                  : campaign.status === "ARCHIVED"
                                    ? "var(--color-muted)"
                                    : "var(--color-warning)",
                            border: `1px solid ${
                              campaign.status === "ACTIVE"
                                ? "rgba(93, 211, 158, 0.4)"
                                : campaign.status === "COMPLETED"
                                  ? "rgba(98, 183, 255, 0.4)"
                                  : campaign.status === "ARCHIVED"
                                    ? "rgba(148, 163, 184, 0.4)"
                                    : "rgba(246, 196, 83, 0.4)"
                            }`,
                            textTransform: "capitalize",
                          }}
                        >
                          {campaign.status.toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-action"
                            onClick={() => openEditModal(campaign)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => {
                              setShowAssignForm(campaign.id);
                              setAssignAthleteIds(
                                campaign.participants.map((p) => p.athlete.id)
                              );
                              setCreateTodos(false);
                              setTodoTitle("");
                              setTodoDescription("");
                              setTodoDueDate("");
                              setTodoPriority("medium");
                            }}
                          >
                            Assign Athletes
                          </button>
                          {campaign.status !== "COMPLETED" && (
                            <button
                              className="btn-action"
                              onClick={() => setClosingCampaign(campaign)}
                            >
                              Close
                            </button>
                          )}
                          <button
                            className="btn-action danger"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && hasApplications && (
                      <tr key={`${campaign.id}-applications`}>
                        <td
                          colSpan={6}
                          style={{ padding: 0, borderTop: "none" }}
                        >
                          <div
                            style={{
                              padding: "var(--space-lg)",
                              background: "rgba(255, 255, 255, 0.02)",
                              borderTop: "1px solid var(--color-line)",
                            }}
                          >
                            <div
                              style={{
                                marginBottom: "var(--space-md)",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "var(--color-text)",
                              }}
                            >
                              Pending Applications ({pendingApplications.length}
                              )
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "var(--space-md)",
                              }}
                            >
                              {pendingApplications.map((participant) => (
                                <div
                                  key={participant.id}
                                  style={{
                                    padding: "var(--space-md)",
                                    border: "1px solid var(--color-line)",
                                    borderRadius: "var(--radius-sm)",
                                    background: "rgba(255, 255, 255, 0.03)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "var(--space-sm)",
                                    }}
                                  >
                                    {participant.athlete.avatarUrl && (
                                      <img
                                        src={participant.athlete.avatarUrl}
                                        alt={participant.athlete.name}
                                        style={{
                                          width: "40px",
                                          height: "40px",
                                          borderRadius: "50%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    )}
                                    <div>
                                      <Link
                                        to={`/athletes/${participant.athlete.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          fontWeight: 600,
                                          color: "var(--color-accentSoft)",
                                          textDecoration: "none",
                                          cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.textDecoration =
                                            "underline";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.textDecoration =
                                            "none";
                                        }}
                                      >
                                        {participant.athlete.name}
                                      </Link>
                                      {participant.appliedAt && (
                                        <div
                                          style={{
                                            fontSize: "0.8rem",
                                            color: "var(--color-muted)",
                                            marginTop: "2px",
                                          }}
                                        >
                                          Applied{" "}
                                          {new Date(
                                            participant.appliedAt
                                          ).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "var(--space-sm)",
                                    }}
                                  >
                                    <button
                                      className="btn-action"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAcceptApplication(
                                          campaign.id,
                                          participant.id
                                        );
                                      }}
                                      style={{
                                        background: "rgba(93, 211, 158, 0.2)",
                                        color: "var(--color-success)",
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="btn-action danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDenyApplication(
                                          campaign.id,
                                          participant.id
                                        );
                                      }}
                                    >
                                      Deny
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="campaign-cards-mobile">
        {campaigns.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--color-muted)",
            }}
          >
            No campaigns yet. Create your first campaign above.
          </div>
        ) : (
          campaigns.map((campaign) => {
            const isExpanded = expandedCampaigns.has(campaign.id);
            const pendingApplications = campaign.participants.filter(
              (p) => p.status === "APPLIED"
            );
            const hasApplications =
              campaign.isOpen && pendingApplications.length > 0;
            const assignedCount = campaign.participants.filter(
              (p) => p.status === "ACCEPTED" || p.status === "INVITED"
            ).length;

            return (
              <div key={campaign.id} className="campaign-card-mobile">
                <div className="campaign-card-header">
                  <div className="campaign-card-title-row">
                    <h3 className="campaign-card-title">{campaign.title}</h3>
                    {hasApplications && (
                      <button
                        className="campaign-expand-btn"
                        onClick={() => toggleCampaignExpansion(campaign.id)}
                      >
                        {isExpanded ? "▼" : "▶"}
                      </button>
                    )}
                  </div>
                  {campaign.description && (
                    <p className="campaign-card-description">
                      {campaign.description}
                    </p>
                  )}
                </div>

                <div className="campaign-card-details">
                  <div className="campaign-card-detail">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">
                      {formatCampaignType(campaign.type)}
                    </span>
                  </div>
                  <div className="campaign-card-detail">
                    <span className="detail-label">Brand</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-xs)",
                      }}
                    >
                      {campaign.organization.logoUrl && (
                        <img
                          src={campaign.organization.logoUrl}
                          alt={campaign.organization.name}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <span className="detail-value">
                        {campaign.organization.name}
                      </span>
                    </div>
                  </div>
                  <div className="campaign-card-detail">
                    <span className="detail-label">Athletes</span>
                    <span className="detail-value">
                      {assignedCount > 0 ? (
                        <>
                          {assignedCount} assigned
                          {hasApplications && (
                            <span
                              style={{
                                display: "block",
                                fontSize: "0.8rem",
                                color: "var(--color-warning)",
                                marginTop: "2px",
                              }}
                            >
                              {pendingApplications.length} pending
                            </span>
                          )}
                        </>
                      ) : (
                        "No athletes assigned"
                      )}
                    </span>
                  </div>
                  <div className="campaign-card-detail">
                    <span className="detail-label">Status</span>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        background:
                          campaign.status === "ACTIVE"
                            ? "rgba(93, 211, 158, 0.2)"
                            : campaign.status === "COMPLETED"
                              ? "rgba(98, 183, 255, 0.2)"
                              : campaign.status === "ARCHIVED"
                                ? "rgba(148, 163, 184, 0.2)"
                                : "rgba(246, 196, 83, 0.2)",
                        color:
                          campaign.status === "ACTIVE"
                            ? "var(--color-success)"
                            : campaign.status === "COMPLETED"
                              ? "var(--color-accentSoft)"
                              : campaign.status === "ARCHIVED"
                                ? "var(--color-muted)"
                                : "var(--color-warning)",
                        border: `1px solid ${
                          campaign.status === "ACTIVE"
                            ? "rgba(93, 211, 158, 0.4)"
                            : campaign.status === "COMPLETED"
                              ? "rgba(98, 183, 255, 0.4)"
                              : campaign.status === "ARCHIVED"
                                ? "rgba(148, 163, 184, 0.4)"
                                : "rgba(246, 196, 83, 0.4)"
                        }`,
                        textTransform: "capitalize",
                        display: "inline-block",
                      }}
                    >
                      {campaign.status.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Pending Applications (Expanded) */}
                {isExpanded && hasApplications && (
                  <div className="campaign-applications-mobile">
                    <div
                      style={{
                        marginBottom: "var(--space-md)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      Pending Applications ({pendingApplications.length})
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-md)",
                      }}
                    >
                      {pendingApplications.map((participant) => (
                        <div
                          key={participant.id}
                          style={{
                            padding: "var(--space-md)",
                            border: "1px solid var(--color-line)",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.03)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-sm)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            {participant.athlete.avatarUrl && (
                              <img
                                src={participant.athlete.avatarUrl}
                                alt={participant.athlete.name}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                            <div>
                              <Link
                                to={`/athletes/${participant.athlete.id}`}
                                style={{
                                  fontWeight: 600,
                                  color: "var(--color-accentSoft)",
                                  textDecoration: "none",
                                }}
                              >
                                {participant.athlete.name}
                              </Link>
                              {participant.appliedAt && (
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-muted)",
                                    marginTop: "2px",
                                  }}
                                >
                                  Applied{" "}
                                  {new Date(
                                    participant.appliedAt
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "var(--space-xs)",
                            }}
                          >
                            <button
                              className="btn-action btn-action-mobile"
                              onClick={() =>
                                handleAcceptApplication(
                                  campaign.id,
                                  participant.id
                                )
                              }
                              style={{
                                background: "rgba(93, 211, 158, 0.2)",
                                color: "var(--color-success)",
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="btn-action btn-action-mobile danger"
                              onClick={() =>
                                handleDenyApplication(
                                  campaign.id,
                                  participant.id
                                )
                              }
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="campaign-card-actions">
                  <button
                    className="btn-action btn-action-mobile"
                    onClick={() => openEditModal(campaign)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-action btn-action-mobile"
                    onClick={() => {
                      setShowAssignForm(campaign.id);
                      setAssignAthleteIds(
                        campaign.participants.map((p) => p.athlete.id)
                      );
                      setCreateTodos(false);
                      setTodoTitle("");
                      setTodoDescription("");
                      setTodoDueDate("");
                      setTodoPriority("medium");
                    }}
                  >
                    Assign Athletes
                  </button>
                  {campaign.status !== "COMPLETED" && (
                    <button
                      className="btn-action btn-action-mobile"
                      onClick={() => setClosingCampaign(campaign)}
                    >
                      Close
                    </button>
                  )}
                  <button
                    className="btn-action btn-action-mobile danger"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={!!showAssignForm}
        onClose={() => {
          setShowAssignForm(null);
          setAssignAthleteIds([]);
          setCreateTodos(false);
          setTodoTitle("");
          setTodoDescription("");
          setTodoDueDate("");
          setTodoPriority("medium");
        }}
        title={`Assign Athletes to Campaign: ${campaigns.find((c) => c.id === showAssignForm)?.title || ""}`}
        size="large"
      >
        <div className="form-group">
          <label className="form-label">Select Athletes</label>
          <select
            className="form-select"
            multiple
            size={6}
            value={assignAthleteIds}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              setAssignAthleteIds(selected);
            }}
          >
            {athletes.map((athlete) => (
              <option key={athlete.id} value={athlete.id}>
                {athlete.name}
              </option>
            ))}
          </select>
          <small style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
            Hold Ctrl/Cmd to select multiple athletes
          </small>
        </div>
        <div className="form-group">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            <input
              type="checkbox"
              checked={createTodos}
              onChange={(e) => setCreateTodos(e.target.checked)}
            />
            Create todos for assigned athletes
          </label>
        </div>
        {createTodos && (
          <div
            style={{
              marginTop: "var(--space-md)",
              paddingTop: "var(--space-md)",
              borderTop: "1px solid var(--color-line)",
            }}
          >
            <h4
              style={{
                marginBottom: "var(--space-md)",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Todo Details
            </h4>
            <div className="form-group">
              <label className="form-label">Todo Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Submit campaign content"
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Todo Description</label>
              <textarea
                className="form-textarea"
                placeholder="Optional description..."
                value={todoDescription}
                onChange={(e) => setTodoDescription(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={todoDueDate}
                  onChange={(e) => setTodoDueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={todoPriority}
                  onChange={(e) =>
                    setTodoPriority(e.target.value as typeof todoPriority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        )}
        <div className="form-actions">
          <button
            className="btn-submit"
            onClick={() =>
              showAssignForm && handleAssignAthletes(showAssignForm)
            }
            disabled={
              assignAthleteIds.length === 0 ||
              (createTodos && (!todoTitle || !todoDueDate))
            }
          >
            Assign Athletes
          </button>
          <button
            className="btn-cancel"
            onClick={() => {
              setShowAssignForm(null);
              setAssignAthleteIds([]);
              setCreateTodos(false);
              setTodoTitle("");
              setTodoDescription("");
              setTodoDueDate("");
              setTodoPriority("medium");
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={!!editingCampaign}
        onClose={() => {
          setEditingCampaign(null);
          resetFormData();
        }}
        title={`Edit Campaign: ${editingCampaign?.title || ""}`}
        size="large"
      >
        <form onSubmit={handleUpdateCampaign}>
          <div className="form-group">
            <label className="form-label">Campaign Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Campaign title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Campaign Type</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as CampaignType,
                })
              }
              required
            >
              <option value="SOCIAL_MEDIA_POST">Social Media Post</option>
              <option value="COMMERCIAL_VIDEO">Commercial Video</option>
              <option value="IN_PERSON_APPEARANCE">In-Person Appearance</option>
              <option value="PRODUCT_ENDORSEMENT">Product Endorsement</option>
              <option value="AUTOGRAPH_SIGNING">Autograph Signing</option>
              <option value="SPEAKING_ENGAGEMENT">Speaking Engagement</option>
              <option value="PHOTO_SHOOT">Photo Shoot</option>
              <option value="PARTNERSHIP">Partnership</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Campaign description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                className="form-select"
                value={formData.organizationId}
                onChange={(e) =>
                  setFormData({ ...formData, organizationId: e.target.value })
                }
                required
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as typeof formData.status,
                  })
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) =>
                  setFormData({ ...formData, isOpen: e.target.checked })
                }
              />
              Open Campaign (Athletes can apply)
            </label>
          </div>
          {formData.type === "IN_PERSON_APPEARANCE" && (
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Event address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required={formData.type === "IN_PERSON_APPEARANCE"}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.startDate}
              onChange={(e) => {
                setFormData({ ...formData, startDate: e.target.value });
                if (formErrors.startDate) {
                  setFormErrors({ ...formErrors, startDate: "" });
                }
                // Clear end date error if start date changes
                if (formErrors.endDate) {
                  setFormErrors({ ...formErrors, endDate: "" });
                }
              }}
            />
            {formErrors.startDate && (
              <div
                style={{
                  color: "var(--color-danger)",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                }}
              >
                {formErrors.startDate}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={(e) => {
                setFormData({ ...formData, endDate: e.target.value });
                if (formErrors.endDate) {
                  setFormErrors({ ...formErrors, endDate: "" });
                }
              }}
            />
            {formErrors.endDate && (
              <div
                style={{
                  color: "var(--color-danger)",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                }}
              >
                {formErrors.endDate}
              </div>
            )}
          </div>
          <div
            style={{
              marginTop: "var(--space-lg)",
              paddingTop: "var(--space-lg)",
              borderTop: "1px solid var(--color-line)",
            }}
          >
            <h4
              style={{
                marginBottom: "var(--space-md)",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Earnings
            </h4>
            <div className="form-group">
              <label className="form-label">Total Earnings (optional)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.totalEarnings}
                onChange={(e) =>
                  setFormData({ ...formData, totalEarnings: e.target.value })
                }
              />
            </div>
            {formData.totalEarnings && (
              <>
                <div className="form-group">
                  <label className="form-label">Split Method</label>
                  <select
                    className="form-select"
                    value={formData.earningsSplitMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        earningsSplitMethod: e.target
                          .value as EarningsSplitMethod,
                      })
                    }
                  >
                    <option value="EQUAL">Equal Split</option>
                    <option value="CUSTOM">Custom Percentages</option>
                  </select>
                </div>
                {formData.earningsSplitMethod === "CUSTOM" &&
                  formData.athleteIds.length > 0 && (
                    <div className="form-group">
                      <label className="form-label">
                        Earnings Percentage per Athlete
                      </label>
                      {formData.athleteIds.map((athleteId) => {
                        const athlete = athletes.find(
                          (a) => a.id === athleteId
                        );
                        const totalAvailable = formData.totalEarnings
                          ? parseFloat(formData.totalEarnings) * 0.6
                          : 0;
                        const currentPercentage = formData.athleteEarnings[
                          athleteId
                        ]
                          ? parseFloat(formData.athleteEarnings[athleteId])
                          : 0;
                        const calculatedAmount =
                          totalAvailable * (currentPercentage / 100);

                        return (
                          <div
                            key={athleteId}
                            style={{ marginBottom: "var(--space-sm)" }}
                          >
                            <label
                              style={{
                                fontSize: "0.9rem",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              {athlete?.name || athleteId}
                            </label>
                            <div
                              style={{
                                display: "flex",
                                gap: "var(--space-sm)",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="number"
                                className="form-input"
                                placeholder="0"
                                step="0.1"
                                min="0"
                                max="100"
                                value={
                                  formData.athleteEarnings[athleteId] || ""
                                }
                                onChange={(e) => {
                                  const percentage =
                                    parseFloat(e.target.value) || 0;
                                  setFormData({
                                    ...formData,
                                    athleteEarnings: {
                                      ...formData.athleteEarnings,
                                      [athleteId]: percentage.toString(),
                                    },
                                  });
                                }}
                                style={{ flex: 1, maxWidth: "120px" }}
                              />
                              <span
                                style={{
                                  fontSize: "0.9rem",
                                  color: "var(--color-muted)",
                                }}
                              >
                                %
                              </span>
                              {totalAvailable > 0 && currentPercentage > 0 && (
                                <span
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "var(--color-text)",
                                    marginLeft: "var(--space-xs)",
                                  }}
                                >
                                  = ${calculatedAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <small
                        style={{
                          color: "var(--color-muted)",
                          fontSize: "0.8rem",
                          display: "block",
                          marginTop: "var(--space-xs)",
                        }}
                      >
                        Percentages should total 100% of the 60% athlete pool
                      </small>
                    </div>
                  )}
              </>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Assign Athletes (optional)</label>
            <select
              className="form-select"
              multiple
              size={5}
              value={formData.athleteIds}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData({ ...formData, athleteIds: selected });
              }}
            >
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            <small style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
              Hold Ctrl/Cmd to select multiple athletes
            </small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Update Campaign
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditingCampaign(null);
                resetFormData();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Close Campaign Modal */}
      <Modal
        isOpen={!!closingCampaign}
        onClose={() => {
          setClosingCampaign(null);
          setCampaignResults({
            links: [],
            metrics: {
              views: "",
              likes: "",
              comments: "",
              shares: "",
              reach: "",
              engagement: "",
              attendance: "",
              sales: "",
            },
            notes: "",
            mediaUrls: [],
          });
        }}
        title={`Close Campaign: ${closingCampaign?.title || ""}`}
        size="large"
      >
        <div>
          <p style={{ marginBottom: "var(--space-md)" }}>
            Closing this campaign will:
          </p>
          <ul
            style={{
              marginBottom: "var(--space-lg)",
              paddingLeft: "var(--space-lg)",
            }}
          >
            <li>Change status to COMPLETED</li>
            <li>Create a recap feed post with verification content</li>
            <li>This action cannot be undone</li>
          </ul>

          {/* Campaign Results Form */}
          <div
            style={{
              marginTop: "var(--space-lg)",
              paddingTop: "var(--space-lg)",
              borderTop: "1px solid var(--color-line)",
            }}
          >
            <h4
              style={{
                marginBottom: "var(--space-md)",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Campaign Results (Optional)
            </h4>

            {closingCampaign &&
              (() => {
                const fields = getResultsFieldsForType(closingCampaign.type);

                return (
                  <>
                    {/* Links Section */}
                    {fields.showLinks && (
                      <div className="form-group">
                        <label className="form-label">Content Links</label>
                        {campaignResults.links.map((link, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              gap: "var(--space-sm)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            <input
                              type="url"
                              className="form-input"
                              placeholder="https://..."
                              value={link}
                              onChange={(e) => {
                                const newLinks = [...campaignResults.links];
                                newLinks[index] = e.target.value;
                                setCampaignResults({
                                  ...campaignResults,
                                  links: newLinks,
                                });
                              }}
                            />
                            <button
                              type="button"
                              className="btn-action danger"
                              onClick={() => {
                                const newLinks = campaignResults.links.filter(
                                  (_, i) => i !== index
                                );
                                setCampaignResults({
                                  ...campaignResults,
                                  links: newLinks,
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => {
                            setCampaignResults({
                              ...campaignResults,
                              links: [...campaignResults.links, ""],
                            });
                          }}
                          style={{ marginTop: "var(--space-xs)" }}
                        >
                          + Add Link
                        </button>
                      </div>
                    )}

                    {/* Metrics Section */}
                    {fields.showMetrics && fields.metrics.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Metrics</label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "var(--space-md)",
                          }}
                        >
                          {fields.metrics.map((metric) => (
                            <div key={metric}>
                              <label
                                className="form-label"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {metric.charAt(0).toUpperCase() +
                                  metric.slice(1).replace(/_/g, " ")}
                              </label>
                              <input
                                type={
                                  metric === "engagement" ? "number" : "text"
                                }
                                className="form-input"
                                placeholder={
                                  metric === "engagement"
                                    ? "0.00%"
                                    : "Enter value"
                                }
                                value={
                                  campaignResults.metrics[
                                    metric as keyof typeof campaignResults.metrics
                                  ]
                                }
                                onChange={(e) => {
                                  setCampaignResults({
                                    ...campaignResults,
                                    metrics: {
                                      ...campaignResults.metrics,
                                      [metric]: e.target.value,
                                    },
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Media URLs Section */}
                    {fields.showMedia && (
                      <div className="form-group">
                        <label className="form-label">
                          Media URLs (Photos/Videos)
                        </label>
                        {campaignResults.mediaUrls.map((url, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              gap: "var(--space-sm)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            <input
                              type="url"
                              className="form-input"
                              placeholder="https://..."
                              value={url}
                              onChange={(e) => {
                                const newUrls = [...campaignResults.mediaUrls];
                                newUrls[index] = e.target.value;
                                setCampaignResults({
                                  ...campaignResults,
                                  mediaUrls: newUrls,
                                });
                              }}
                            />
                            <button
                              type="button"
                              className="btn-action danger"
                              onClick={() => {
                                const newUrls =
                                  campaignResults.mediaUrls.filter(
                                    (_, i) => i !== index
                                  );
                                setCampaignResults({
                                  ...campaignResults,
                                  mediaUrls: newUrls,
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => {
                            setCampaignResults({
                              ...campaignResults,
                              mediaUrls: [...campaignResults.mediaUrls, ""],
                            });
                          }}
                          style={{ marginTop: "var(--space-xs)" }}
                        >
                          + Add Media URL
                        </button>
                      </div>
                    )}

                    {/* Notes Section */}
                    <div className="form-group">
                      <label className="form-label">Additional Notes</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Any additional results, observations, or feedback..."
                        rows={4}
                        value={campaignResults.notes}
                        onChange={(e) => {
                          setCampaignResults({
                            ...campaignResults,
                            notes: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </>
                );
              })()}
          </div>

          <div
            className="form-actions"
            style={{ marginTop: "var(--space-lg)" }}
          >
            <button className="btn-submit" onClick={handleCloseCampaign}>
              Close Campaign
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setClosingCampaign(null);
                setCampaignResults({
                  links: [],
                  metrics: {
                    views: "",
                    likes: "",
                    comments: "",
                    shares: "",
                    reach: "",
                    engagement: "",
                    attendance: "",
                    sales: "",
                  },
                  notes: "",
                  mediaUrls: [],
                });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
