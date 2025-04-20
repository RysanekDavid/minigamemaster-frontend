import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";
import FlagIcon from "./FlagIcon";

// Language options
const languages = [
  { code: "en", name: "English", nativeName: "English", flagCode: "en" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flagCode: "cs" },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  // Find current language object
  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <>
      <Tooltip title={t("settings.language")}>
        <Button
          color="inherit"
          onClick={handleClick}
          sx={{
            minWidth: { xs: "auto", sm: "120px" },
            borderRadius: 2,
            px: 2,
            py: 0.5,
            bgcolor: "action.hover",
            "&:hover": {
              bgcolor: "action.selected",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FlagIcon countryCode={currentLanguage.flagCode} />
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {currentLanguage.nativeName}
            </Typography>
            <LanguageIcon fontSize="small" sx={{ ml: { xs: 0, sm: 0.5 } }} />
          </Box>
        </Button>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "language-button",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ px: 2, py: 1, fontWeight: "bold", color: "text.secondary" }}
        >
          {t("settings.language")}
        </Typography>
        <Divider />
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            selected={i18n.language === language.code}
            sx={{
              py: 1.5,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                "&:hover": {
                  bgcolor: "action.selected",
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <FlagIcon countryCode={language.flagCode} />
            </ListItemIcon>
            <ListItemText
              primary={language.nativeName}
              secondary={
                language.name !== language.nativeName
                  ? language.name
                  : undefined
              }
              primaryTypographyProps={{
                fontWeight: i18n.language === language.code ? "bold" : "normal",
              }}
            />
            {i18n.language === language.code && (
              <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
