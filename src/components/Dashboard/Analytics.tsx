import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid, // Standard Grid import
  CardHeader,
  Avatar,
  Box,
  Paper,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import UsersIcon from "@mui/icons-material/People";
import GamepadIcon from "@mui/icons-material/SportsEsports";

// Define the structure expected from the API
interface BasicStatsData {
  totalGamesPlayed: number;
  // uniquePlayersToday: number; // Add later when API supports it
}

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<BasicStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use relative path for API call, include credentials for session cookie
        const response = await fetch("/api/analytics/basic-stats", {
          credentials: "include",
        });
        if (!response.ok) {
          // Log the actual status for better debugging
          console.error(
            `Analytics fetch failed with status: ${response.status}`
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: BasicStatsData = await response.json();
        setStats(data);
      } catch (e: any) {
        console.error("Failed to fetch analytics stats:", e);
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <BarChartIcon />
          </Avatar>
        }
        title="Analytics"
        subheader="View your channel's game statistics"
      />
      <CardContent>
        {/* Using standard Grid container and item pattern */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {" "}
            {/* Grid item with breakpoint props */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{ width: 56, height: 56, bgcolor: "primary.light" }}
                >
                  <GamepadIcon fontSize="large" />
                </Avatar>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Games Played
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {loading
                      ? "..."
                      : error
                      ? "Error"
                      : stats?.totalGamesPlayed ?? 0}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {" "}
            {/* Grid item with breakpoint props */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{ width: 56, height: 56, bgcolor: "primary.light" }}
                >
                  <UsersIcon fontSize="large" />
                </Avatar>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Unique Players Today
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {/* Placeholder until API provides this */}
                    {loading ? "..." : error ? "Error" : "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            More detailed analytics coming soon...
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
