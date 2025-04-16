import React from "react";
import Login from "../components/Auth/Login"; // Importujeme existující Login komponentu

const LoginPage: React.FC = () => {
  return (
    <div>
      {/* Zde můžeme přidat další layout specifický pro login stránku, pokud bude potřeba */}
      <Login />
    </div>
  );
};

export default LoginPage;
