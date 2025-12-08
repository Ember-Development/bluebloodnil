import { useState, useEffect } from "react";
import { apiClient } from "../../lib/apiClient";
import "./admin.css";
import type { Campaign } from "./types";

interface Athlete {
  id: string;
  name: string;
  socialProfiles?: Array<{
    avgEngagementRate?: number | null;
  }>;
  createdAt: string;
}

interface Todo {
  id: string;
  verified: boolean;
  verifiedAt?: string | null;
  dueDate?: string | null;
}

interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

interface FeedPost {
  id: string;
  type: string;
  headline: string;
  body: string;
  createdAt: string;
  athleteId?: string | null;
  organizationId?: string | null;
}

interface ActivityItem {
  label: string;
  value: string;
  timeAgo: string;
}

interface Admin {
  id: string;
  email: string;
  role: string;
  externalId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function AdminOverview() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncingAdmins, setIsSyncingAdmins] = useState(false);
  const [syncAdminsMessage, setSyncAdminsMessage] = useState<string | null>(
    null
  );
  const [bluebloodsEarnings, setBluebloodsEarnings] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalAthletes, setTotalAthletes] = useState<number>(0);
  const [activeCampaigns, setActiveCampaigns] = useState<number>(0);
  const [pendingTodos, setPendingTodos] = useState<number>(0);
  const [overdueTodos, setOverdueTodos] = useState<number>(0);
  const [totalBrands, setTotalBrands] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [athletes, campaigns, todos, organizations, feedPosts] =
          await Promise.all([
            apiClient.get<Athlete[]>("/api/athletes"),
            apiClient.get<Campaign[]>("/api/admin/campaigns"),
            apiClient.get<Todo[]>("/api/admin/todos"),
            apiClient.get<Organization[]>("/api/admin/organizations"),
            apiClient.get<{ items: FeedPost[] }>("/api/feed/posts?limit=20"),
          ]);

        // Calculate metrics
        setTotalAthletes(athletes.length);

        const active = campaigns.filter((c) => c.status === "ACTIVE").length;
        setActiveCampaigns(active);

        const pending = todos.filter((t) => !t.verified).length;
        setPendingTodos(pending);

        const now = new Date();
        const overdue = todos.filter((t) => {
          if (t.verified || !t.dueDate) return false;
          return new Date(t.dueDate) < now;
        }).length;
        setOverdueTodos(overdue);

        setTotalBrands(organizations.length);

        // Calculate average engagement (commented out for now)
        // const engagementRates = athletes
        //   .flatMap((a) => a.socialProfiles || [])
        //   .map((sp) => sp.avgEngagementRate)
        //   .filter(
        //     (rate): rate is number =>
        //       rate !== null && rate !== undefined && rate > 0
        //   );

        // const avg =
        //   engagementRates.length > 0
        //     ? engagementRates.reduce((sum, rate) => sum + rate, 0) /
        //       engagementRates.length
        //     : 0;
        // setAvgEngagement(Math.round(avg * 10) / 10);

        // Calculate total earnings and BlueBloods share (40%)
        const total = campaigns.reduce((sum, campaign) => {
          return sum + (campaign.totalEarnings || 0);
        }, 0);
        setTotalEarnings(total);
        setBluebloodsEarnings(total * 0.4);

        // Build recent activity from feed posts
        const activities: ActivityItem[] = [];
        for (const post of feedPosts.items.slice(0, 4)) {
          const createdAt = new Date(post.createdAt);
          let label = "";
          let value = "";

          if (post.type === "CAMPAIGN") {
            // Extract campaign title from headline or body
            const titleMatch = post.headline.match(
              /selected for (.+?) campaign/
            );
            if (titleMatch) {
              label = "Campaign assigned";
              value = titleMatch[1];
            } else if (post.headline.includes("Campaign Complete")) {
              label = "Campaign completed";
              const orgMatch = post.body.match(/with (.+?)!/);
              value = orgMatch ? orgMatch[1] : "Campaign";
            } else {
              label = "Campaign activity";
              value = post.headline.replace("🎉 ", "").substring(0, 30);
            }
          } else if (post.type === "ORG_ANNOUNCEMENT") {
            const brandMatch = post.headline.match(/New brand partner: (.+)/);
            if (brandMatch) {
              label = "New brand partner";
              value = brandMatch[1];
            } else {
              label = "Brand announcement";
              value = post.headline.substring(0, 30);
            }
          } else if (post.type === "ATHLETE_UPDATE") {
            label = "Post published";
            value = post.headline.substring(0, 30);
          } else if (post.type === "COMMITMENT") {
            label = "Commitment announced";
            const programMatch = post.body.match(/committed to (.+?)!/);
            value = programMatch ? programMatch[1] : "Program";
          }

          if (label && value) {
            activities.push({
              label,
              value,
              timeAgo: formatTimeAgo(createdAt),
            });
          }
        }

        setRecentActivity(activities);
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoadingAdmins(true);
      const data = await apiClient.get<Admin[]>("/api/admin/admins");
      setAdmins(data);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    } finally {
      setLoadingAdmins(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSyncBomber = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage(null);
      const result = await apiClient.post<{
        ok: boolean;
        count?: number;
        error?: string;
      }>("/api/integration/sync/bomber", {});
      if (result.ok) {
        setSyncMessage(
          `Sync successful! ${result.count ? `Synced ${result.count} athletes.` : ""}`
        );
      } else {
        setSyncMessage("Sync completed with errors.");
      }
    } catch (error) {
      console.error("Error syncing Bomber:", error);
      setSyncMessage(
        error instanceof Error
          ? error.message
          : "Failed to sync Bomber athletes"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncBomberAdmins = async () => {
    try {
      setIsSyncingAdmins(true);
      setSyncAdminsMessage(null);
      const result = await apiClient.post<{
        ok: boolean;
        count?: number;
        error?: string;
      }>("/api/integration/sync/bomber/admins", {});
      if (result.ok) {
        setSyncAdminsMessage(
          `Sync successful! ${result.count ? `Synced ${result.count} admins.` : ""}`
        );
      } else {
        setSyncAdminsMessage("Sync completed with errors.");
      }
    } catch (error) {
      console.error("Error syncing Bomber admins:", error);
      setSyncAdminsMessage(
        error instanceof Error ? error.message : "Failed to sync Bomber admins"
      );
    } finally {
      setIsSyncingAdmins(false);
    }
  };

  if (loading) {
    return (
      <div className="overview-section">
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--color-muted)",
          }}
        >
          Loading overview...
        </div>
      </div>
    );
  }

  return (
    <div className="overview-section">
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <div
          style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}
        >
          <button
            className="btn-add"
            onClick={handleSyncBomber}
            disabled={isSyncing}
            style={{ marginBottom: syncMessage ? "var(--space-sm)" : 0 }}
          >
            {isSyncing ? "Syncing..." : "Sync Bomber Athletes"}
          </button>
          <button
            className="btn-add"
            onClick={handleSyncBomberAdmins}
            disabled={isSyncingAdmins}
            style={{ marginBottom: syncAdminsMessage ? "var(--space-sm)" : 0 }}
          >
            {isSyncingAdmins ? "Syncing..." : "Sync Bomber Admins"}
          </button>
        </div>
        {syncMessage && (
          <div
            style={{
              marginTop: "var(--space-sm)",
              padding: "var(--space-sm)",
              borderRadius: "var(--radius-sm)",
              backgroundColor: syncMessage.includes("successful")
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${syncMessage.includes("successful") ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              color: syncMessage.includes("successful")
                ? "var(--color-success)"
                : "var(--color-danger)",
              fontSize: "0.9rem",
            }}
          >
            {syncMessage}
          </div>
        )}
        {syncAdminsMessage && (
          <div
            style={{
              marginTop: "var(--space-sm)",
              padding: "var(--space-sm)",
              borderRadius: "var(--radius-sm)",
              backgroundColor: syncAdminsMessage.includes("successful")
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${syncAdminsMessage.includes("successful") ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              color: syncAdminsMessage.includes("successful")
                ? "var(--color-success)"
                : "var(--color-danger)",
              fontSize: "0.9rem",
            }}
          >
            {syncAdminsMessage}
          </div>
        )}
      </div>
      <div className="overview-grid">
        <div className="metric-card">
          <div className="metric-label">Total Athletes</div>
          <div className="metric-value">{totalAthletes}</div>
          <div className="metric-change">Active on platform</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active Campaigns</div>
          <div className="metric-value">{activeCampaigns}</div>
          <div className="metric-change">Currently running</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Earnings</div>
          <div className="metric-value">{formatCurrency(totalEarnings)}</div>
          <div className="metric-change">All time</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">BlueBloods Earnings</div>
          <div className="metric-value">
            {formatCurrency(bluebloodsEarnings)}
          </div>
          <div className="metric-change">40% of total earnings</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Pending Todos</div>
          <div className="metric-value">{pendingTodos}</div>
          <div
            className={`metric-change ${overdueTodos > 0 ? "negative" : ""}`}
          >
            {overdueTodos > 0 ? `${overdueTodos} overdue` : "All on track"}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Brand Partners</div>
          <div className="metric-value">{totalBrands}</div>
          <div className="metric-change">Active partners</div>
        </div>
      </div>

      {/* {avgEngagement > 0 && (
        <div className="overview-grid" style={{ marginTop: "var(--space-lg)" }}>
          <div className="metric-card">
            <div className="metric-label">Avg Engagement Rate</div>
            <div className="metric-value">{avgEngagement}%</div>
            <div className="metric-change">Across all athletes</div>
          </div>
        </div>
      )} */}

      {/* Admin Management Section */}
      <div
        style={{
          marginTop: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <h3
          className="section-title"
          style={{ marginBottom: "var(--space-lg)" }}
        >
          Admin Management
        </h3>

        {loadingAdmins ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--color-muted)",
            }}
          >
            Loading admins...
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>External ID</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => {
                      const createdDate = new Date(admin.createdAt);
                      const formattedDate = createdDate.toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      );
                      const fullName =
                        admin.firstName || admin.lastName
                          ? `${admin.firstName || ""} ${admin.lastName || ""}`.trim()
                          : admin.email;

                      return (
                        <tr key={admin.id}>
                          <td>{fullName}</td>
                          <td>{admin.email}</td>
                          <td>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "999px",
                                fontSize: "0.75rem",
                                background: "rgba(59, 130, 246, 0.2)",
                                color: "var(--color-primary)",
                                border: "1px solid rgba(59, 130, 246, 0.4)",
                                textTransform: "uppercase",
                              }}
                            >
                              {admin.role}
                            </span>
                          </td>
                          <td
                            style={{
                              color: "var(--color-muted)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {admin.externalId || "N/A"}
                          </td>
                          <td>{formattedDate}</td>
                          <td>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "999px",
                                fontSize: "0.75rem",
                                background: "rgba(34, 197, 94, 0.2)",
                                color: "var(--color-success)",
                                border: "1px solid rgba(34, 197, 94, 0.4)",
                              }}
                            >
                              Active
                            </span>
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
              {admins.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--color-muted)",
                  }}
                >
                  No admins found
                </div>
              ) : (
                admins.map((admin) => {
                  const createdDate = new Date(admin.createdAt);
                  const formattedDate = createdDate.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  );
                  const fullName =
                    admin.firstName || admin.lastName
                      ? `${admin.firstName || ""} ${admin.lastName || ""}`.trim()
                      : admin.email;
                  const displayInitial = admin.firstName
                    ? admin.firstName.charAt(0).toUpperCase()
                    : admin.email.charAt(0).toUpperCase();

                  return (
                    <div key={admin.id} className="athlete-card-mobile">
                      <div className="athlete-card-header">
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "var(--color-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                          }}
                        >
                          {displayInitial}
                        </div>
                        <div className="athlete-card-info">
                          <h3 className="athlete-card-name">{fullName}</h3>
                          <span className="athlete-card-status">Active</span>
                        </div>
                      </div>
                      <div className="athlete-card-details">
                        <div className="athlete-card-detail">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">{admin.email}</span>
                        </div>
                        <div className="athlete-card-detail">
                          <span className="detail-label">Role</span>
                          <span
                            className="detail-value"
                            style={{
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "0.75rem",
                              background: "rgba(59, 130, 246, 0.2)",
                              color: "var(--color-primary)",
                              border: "1px solid rgba(59, 130, 246, 0.4)",
                              textTransform: "uppercase",
                            }}
                          >
                            {admin.role}
                          </span>
                        </div>
                        <div className="athlete-card-detail">
                          <span className="detail-label">External ID</span>
                          <span className="detail-value">
                            {admin.externalId || "N/A"}
                          </span>
                        </div>
                        <div className="athlete-card-detail">
                          <span className="detail-label">Created</span>
                          <span className="detail-value">{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <div className="activity-list">
        <h3
          className="section-title"
          style={{ marginBottom: "var(--space-lg)" }}
        >
          Recent Activity
        </h3>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div>
                <div className="activity-label">{activity.label}</div>
                <div className="activity-value">{activity.value}</div>
              </div>
              <div className="activity-time">{activity.timeAgo}</div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "var(--space-md)",
              color: "var(--color-muted)",
              textAlign: "center",
            }}
          >
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
