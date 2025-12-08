import { useState, useMemo, useEffect } from "react";
import "./athletes.css";
import { apiClient } from "../../lib/apiClient";
import type { AthleteListItem } from "./types";
import { AthletesHeader } from "./AthletesHeader";
import { AthletesGrid } from "./AthletesGrid";

interface AthleteFromDB {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  position1?: string | null;
  position2?: string | null;
  teamName?: string | null;
  sport?: string | null;
  gradYear?: number | null;
  classYear?: number | null;
  ageGroup?: string | null; // Add this
  location?: string | null;
  avatarUrl?: string | null;
  nilScore?: number | null;
  socialProfiles?: Array<{
    platform: string;
    handle: string;
    followers: number;
    avgEngagementRate?: number | null;
  }>;
  participants?: Array<{
    campaign: unknown;
  }>;
  interests?: Array<{
    label: string;
  }>;
}

function transformAthlete(athlete: AthleteFromDB): AthleteListItem {
  // Calculate total reach from social profiles
  const totalReach =
    athlete.socialProfiles?.reduce(
      (sum, profile) => sum + (profile.followers || 0),
      0
    ) || 0;

  // Calculate average engagement
  const engagementRates =
    athlete.socialProfiles
    ?.map((p) => p.avgEngagementRate)
      .filter((rate): rate is number => rate !== null && rate !== undefined) ||
    [];
  const avgEngagement =
    engagementRates.length > 0
      ? engagementRates.reduce((sum, rate) => sum + rate, 0) /
        engagementRates.length
      : undefined;

  // Build position string
  const position =
    athlete.position ||
    [athlete.position1, athlete.position2].filter(Boolean).join(" / ") ||
    "Athlete";

  // Build quick tags from interests and positions
  const quickTags = [
    ...(athlete.interests?.slice(0, 3).map((i) => i.label) || []),
    ...(athlete.position1 ? [athlete.position1] : []),
  ].slice(0, 3);

  return {
    id: athlete.id,
    name: athlete.name,
    position,
    team: athlete.teamName || "No Team",
    sport: athlete.sport || "Athletics",
    gradYear: athlete.gradYear || athlete.classYear || new Date().getFullYear(),
    location: athlete.location || "Location TBD",
    ageGroup: athlete.ageGroup || null, // Add this
    avatarUrl:
      athlete.avatarUrl || "https://via.placeholder.com/400x400?text=No+Photo",
    nilScore: athlete.nilScore || undefined,
    totalReach: totalReach > 0 ? totalReach : undefined,
    avgEngagement: avgEngagement
      ? Math.round(avgEngagement * 10) / 10
      : undefined,
    campaignsCount: athlete.participants?.length || 0,
    quickTags,
    profileUrl: `/athletes/${athlete.id}`,
  };
}

export function Athletes() {
  const [athletes, setAthletes] = useState<AthleteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Change to track individual filter values
  const [filters, setFilters] = useState({
    ageGroup: "",
    gradYear: "",
    location: "",
    teamName: "",
  });

  useEffect(() => {
    async function fetchAthletes() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<AthleteFromDB[]>("/api/athletes");
        const transformed = data.map(transformAthlete);
        setAthletes(transformed);
      } catch (err) {
        console.error("Failed to fetch athletes:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load athletes"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAthletes();
  }, []);

  // Generate filter options from actual data
  const filterOptions = useMemo(() => {
    const options: {
      type: "ageGroup" | "gradYear" | "location" | "teamName";
      label: string;
      value: string;
    }[] = [];

    // Get unique ageGroups
    const ageGroups = [
      ...new Set(athletes.map((a) => a.ageGroup).filter(Boolean)),
    ].sort();
    ageGroups.forEach((ag) => {
      options.push({
        type: "ageGroup",
        label: `Age: ${ag}`,
        value: `ageGroup:${ag}`,
      });
    });

    // Get unique gradYears
    const gradYears = [
      ...new Set(athletes.map((a) => a.gradYear).filter(Boolean)),
    ].sort();
    gradYears.forEach((gy) => {
      options.push({
        type: "gradYear",
        label: `Class of ${gy}`,
        value: `gradYear:${gy}`,
      });
    });

    // Get unique locations
    const locations = [
      ...new Set(athletes.map((a) => a.location).filter(Boolean)),
    ].sort();
    locations.forEach((loc) => {
      options.push({ type: "location", label: loc, value: `location:${loc}` });
    });

    // Get unique teamNames
    const teams = [
      ...new Set(athletes.map((a) => a.team).filter(Boolean)),
    ].sort();
    teams.forEach((team) => {
      options.push({
        type: "teamName",
        label: team,
        value: `teamName:${team}`,
      });
    });

    return options;
  }, [athletes]);

  const filteredAthletes = useMemo(() => {
    let filtered = athletes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (athlete) =>
          athlete.name.toLowerCase().includes(query) ||
          athlete.position.toLowerCase().includes(query) ||
          athlete.team.toLowerCase().includes(query) ||
          athlete.location.toLowerCase().includes(query) ||
          athlete.quickTags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.ageGroup) {
      const filterValue = filters.ageGroup.split(":")[1];
      filtered = filtered.filter((athlete) => athlete.ageGroup === filterValue);
    }
    if (filters.gradYear) {
      const filterValue = filters.gradYear.split(":")[1];
      filtered = filtered.filter(
        (athlete) => athlete.gradYear === parseInt(filterValue)
      );
    }
    if (filters.location) {
      const filterValue = filters.location.split(":")[1];
      filtered = filtered.filter((athlete) => athlete.location === filterValue);
    }
    if (filters.teamName) {
      const filterValue = filters.teamName.split(":")[1];
      filtered = filtered.filter((athlete) => athlete.team === filterValue);
    }

    return filtered;
  }, [athletes, searchQuery, filters]);

  if (loading) {
    return (
      <div className="athletes-container">
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--color-text)",
          }}
        >
          Loading athletes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="athletes-container">
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--color-danger)",
          }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="athletes-container">
      <AthletesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={filters} // Pass filters object
        onFilterChange={(type, value) => {
          setFilters((prev) => ({ ...prev, [type]: value }));
        }}
        filterOptions={filterOptions}
      />
      <AthletesGrid athletes={filteredAthletes} />
    </div>
  );
}
