import React, { useState, useEffect } from "react"; // Import useEffect
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShieldIcon from "@mui/icons-material/Shield";
import GamepadIcon from "@mui/icons-material/SportsEsports";
import BotIcon from "@mui/icons-material/SmartToy";
import LogoutIcon from "@mui/icons-material/Logout";
import UserIcon from "@mui/icons-material/AccountCircle";
// Import theme context if needed for theme toggling later
import { useThemeContext } from "./ThemeProvider"; // Added
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Added
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Added

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`, // Start closed on larger screens too initially if desired
  marginTop: "64px", // Adjust based on AppBar height
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  // Adjust for mobile where drawer is temporary
  [theme.breakpoints.down("md")]: {
    marginLeft: 0, // Always 0 margin on mobile
  },
}));

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  // Adjust for mobile where drawer is temporary
  [theme.breakpoints.down("md")]: {
    width: "100%",
    marginLeft: 0,
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    login: string;
    // isConnected: boolean; // We might get this from context or props later
  };
  onLogout: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  user,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Start closed on mobile, open on desktop by default
  const [open, setOpen] = useState(!isMobile);
  const [activeItem, setActiveItem] = useState("dashboard"); // Default active item
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { toggleThemeMode } = useThemeContext(); // Get theme toggle function

  useEffect(() => {
    // Adjust drawer state if screen size changes
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { id: "chatbot", label: "Chatbot", icon: <BotIcon /> },
    { id: "games", label: "Games", icon: <GamepadIcon /> },
    { id: "moderation", label: "Moderation", icon: <ShieldIcon /> },
    { id: "analytics", label: "Analytics", icon: <BarChartIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <StyledAppBar position="fixed" open={open && !isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && !isMobile && { display: "none" }) }} // Hide only if open AND not mobile
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MiniGameMaster
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Add Theme Toggle Button if needed */}
            <IconButton onClick={toggleThemeMode} color="inherit">
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                alt={user.login}
                // Using a simple letter avatar for now
                sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
              >
                {user.login?.[0]?.toUpperCase()}
              </Avatar>
              {/* Add connection status indicator if needed later */}
            </IconButton>
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
                Profile (N/A)
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
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose} // Close on backdrop click on mobile
      >
        <DrawerHeader>
          {/* Optionally add a close button for persistent drawer */}
          {!isMobile && (
            <IconButton onClick={handleDrawerClose}>
              <MenuIcon /> {/* Or ChevronLeftIcon */}
            </IconButton>
          )}
        </DrawerHeader>
        <Divider />
        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activeItem === item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    if (isMobile) handleDrawerClose(); // Close drawer on mobile after selection
                  }}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "primary.light", // Use theme colors
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.main", // Darker hover for selected
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText",
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ flexGrow: 1 }} /> {/* Pushes footer down */}
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              MiniGameMaster v0.1
            </Typography>
          </Box>
        </Box>
      </Drawer>
      {/* Main content area */}
      <Main open={open && !isMobile} sx={{ overflowY: "auto", height: "100%" }}>
        {/* DrawerHeader creates space for the fixed AppBar */}
        {/* <DrawerHeader /> */}
        {children}
      </Main>
    </Box>
  );
};
