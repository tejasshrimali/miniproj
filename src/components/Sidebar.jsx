import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/students" },
    { label: "Arrangements", path: "/arrangements" },
    { label: "Preview", path: "/preview" },
    { label: "Notifications", path: "/notifications" },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8">
        Smart Exam Notification System
      </h1>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`block px-4 py-2 rounded-lg transition ${
                isActive(item.path)
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
