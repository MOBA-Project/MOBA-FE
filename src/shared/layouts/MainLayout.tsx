import React from "react";
import { Outlet } from "react-router-dom";
import Menu from "../../shared/components/Sidebar/Menu";

const MainLayout: React.FC = () => {
  return (
    <div className="appShell">
      <Menu />
      <div className="appContent">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
