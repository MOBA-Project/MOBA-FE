import React from "react";
import { Outlet } from "react-router-dom";
import Menu from "../../shared/components/Sidebar/Menu";
import MobileBlocker from "shared/components/MobileBlocker";

const MainLayout: React.FC = () => {
  return (
    <div className="appShell">
      <MobileBlocker />
      <Menu />
      <div className="appContent">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
