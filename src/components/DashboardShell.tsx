import React, { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Import theme context
import { useThemeContext } from "./ThemeProvider";

// Import language switcher
import LanguageSwitcher from "./LanguageSwitcher";

// Icons from inspiration
import HomeIcon from "@mui/icons-material/Home";
import MessageSquareIcon from "@mui/icons-material/Chat";
import GameControllerIcon from "@mui/icons-material/SportsEsports";
import ShieldIcon from "@mui/icons-material/Shield";
import PieChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
// Icons for user menu and theme
import LogoutIcon from "@mui/icons-material/Logout";
import UserIcon from "@mui/icons-material/AccountCircle";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const drawerWidth = 260; // From inspiration

interface DashboardShellProps {
  children: React.ReactNode;
  activePage: string; // From inspiration AppLayoutProps
  onNavigate: (page: string) => void; // From inspiration AppLayoutProps
  user: {
    // Keep user info for avatar/menu
    login: string;
  };
  onLogout: () => void; // Keep logout handler
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activePage,
  onNavigate,
  user,
  onLogout,
}) => {
  const theme = useTheme(); // For media query and current theme mode
  const { themeMode, toggleThemeMode } = useThemeContext(); // Get theme context
  const { t } = useTranslation(); // Translation hook
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false); // State for temporary mobile drawer
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // State for user menu

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { id: "dashboard", label: t("navigation.dashboard"), icon: <HomeIcon /> },
    {
      id: "chatbot",
      label: t("navigation.chatbot"),
      icon: <MessageSquareIcon />,
    },
    { id: "games", label: t("navigation.games"), icon: <GameControllerIcon /> },
    {
      id: "moderation",
      label: t("navigation.moderation"),
      icon: <ShieldIcon />,
    },
    {
      id: "analytics",
      label: t("navigation.analytics"),
      icon: <PieChartIcon />,
    },
    { id: "settings", label: t("navigation.settings"), icon: <SettingsIcon /> },
  ];

  const drawerContent = (
    <>
      {/* Drawer Header */}
      <Box
        sx={{
          height: 64, // Match AppBar height
          display: "flex",
          alignItems: "center",
          px: 3,
          // Use theme gradient or primary color
          background:
            theme.palette.mode === "dark"
              ? theme.palette.primary.dark // Example dark mode background
              : "linear-gradient(45deg, #5e35b1 30%, #7c4dff 90%)", // From inspiration theme
          color: "primary.contrastText", // Ensure text is visible
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          MiniGameMaster
        </Typography>
      </Box>
      {/* Navigation List */}
      <Box sx={{ overflow: "auto", flexGrow: 1, py: 2 }}>
        <List component="nav" disablePadding>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={activePage === item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobile) handleDrawerToggle(); // Close mobile drawer on navigate
                }}
                // Styling comes from ThemeProvider component overrides
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      {/* Drawer Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          MiniGameMaster v0.1
        </Typography>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Temporary Drawer for Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              // Styling comes from ThemeProvider component overrides
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Permanent Drawer for Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              // Styling comes from ThemeProvider component overrides
            },
          }}
          open // Permanent drawer is always open on desktop
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto", // Allow content scrolling
          width: { md: `calc(100% - ${drawerWidth}px)` }, // Adjust width for permanent drawer
          height: "100vh", // Ensure main area takes full height
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header AppBar */}
        <AppBar
          position="static" // Changed from fixed
          color="default" // Use theme's default color
          elevation={0} // No shadow like inspiration
          sx={{
            // Keep AppBar above main content scroll
            zIndex: (theme) => theme.zIndex.drawer + 1,
            borderBottom: "1px solid", // Add border like inspiration
            borderColor: "divider", // Use theme divider color
            backgroundColor: "background.paper", // Use paper background like inspiration
          }}
        >
          <Toolbar>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }} // Show only on mobile
            >
              <MenuIcon />
            </IconButton>
            {/* Title (optional, can be removed if drawer header is enough) */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, color: "text.primary" }} // Ensure text color matches theme
            >
              {/* Title can be dynamic based on activePage if needed */}
              {/* {menuItems.find(item => item.id === activePage)?.label || 'MiniGameMaster'} */}
            </Typography>
            {/* User Menu / Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle Button */}
              <Tooltip
                title={
                  themeMode === "light"
                    ? t("settings.theme") + ": " + t("settings.dark")
                    : t("settings.theme") + ": " + t("settings.light")
                }
              >
                <IconButton
                  size="small"
                  onClick={toggleThemeMode}
                  sx={{ bgcolor: "action.hover" }} // Subtle background
                >
                  {themeMode === "light" ? (
                    <DarkModeIcon fontSize="small" />
                  ) : (
                    <LightModeIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              {/* Settings icon removed as requested */}
              <Tooltip title={user.login}>
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  sx={{ ml: 1 }} // Add some margin
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "secondary.main", // Use theme color
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {user.login?.[0]?.toUpperCase() || "?"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{ mt: 1 }} // Add margin top
              >
                <MenuItem disabled sx={{ opacity: "1 !important" }}>
                  <Typography variant="body2" fontWeight="medium">
                    {user.login}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <UserIcon fontSize="small" />
                  </ListItemIcon>
                  {t("common.profile")} (N/A)
                </MenuItem>
                <MenuItem onClick={toggleThemeMode}>
                  <ListItemIcon>
                    {themeMode === "light" ? (
                      <DarkModeIcon fontSize="small" />
                    ) : (
                      <LightModeIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  {themeMode === "light"
                    ? t("settings.dark")
                    : t("settings.light")}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    onLogout();
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  {t("common.logout")}
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, overflowY: "auto" }}
        >
          {" "}
          {/* Added flexGrow and overflowY */}
          <Box sx={{ maxWidth: 1200, mx: "auto" }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
};
