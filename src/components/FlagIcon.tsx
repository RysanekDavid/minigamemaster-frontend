import React from "react";
import { Box } from "@mui/material";

// Import flag images
import enFlag from "../assets/flags/en.svg";
import csFlag from "../assets/flags/cs.svg";

// Map of country codes to flag images
const flagImages: Record<string, string> = {
  en: enFlag,
  cs: csFlag,
};

interface FlagIconProps {
  countryCode: string;
  width?: number;
  height?: number;
}

const FlagIcon: React.FC<FlagIconProps> = ({
  countryCode,
  width = 24,
  height = 16,
}) => {
  return (
    <Box
      component="img"
      src={flagImages[countryCode]}
      alt={`${countryCode} flag`}
      sx={{
        width: width,
        height: height,
        objectFit: "cover",
        borderRadius: "2px",
        boxShadow: "0 0 1px rgba(0,0,0,0.3)",
      }}
    />
  );
};

export default FlagIcon;
