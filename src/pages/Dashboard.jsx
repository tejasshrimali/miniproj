import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    notificationsSent: 0,
    pendingNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Fetch total exams
      const { count: examCount } = await supabase
        .from('exam_arrangements')
        .select('*', { count: 'exact', head: true });

      // Fetch notifications status
      const { data: matchedData } = await supabase
        .from('matched_students')
        .select('notification_status');

      let sent = 0;
      let pending = 0;

      if (matchedData) {
        matchedData.forEach(match => {
          if (match.notification_status === 'sent') sent++;
          else if (match.notification_status === 'pending' || !match.notification_status) pending++;
        });
      }

      setStats({
        totalStudents: studentCount || 0,
        totalExams: examCount || 0,
        notificationsSent: sent,
        pendingNotifications: pending,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-bold mb-2">
                  Total Students
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? "..." : stats.totalStudents}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-bold mb-2">
                  Total Exams
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? "..." : stats.totalExams}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-bold mb-2">
                  Notifications Sent
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {loading ? "..." : stats.notificationsSent}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-bold mb-2">
                  Pending Notifications
                </h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {loading ? "..." : stats.pendingNotifications}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Welcome to Smart Exam Notification System
                </h3>
                <p className="text-gray-600 mb-4">
                  This system automates the process of mapping exam seat ranges to students
                  and sending them personalized notifications via Pabbly Webhooks.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>Manage your student database in the <strong>Students</strong> section.</li>
                  <li>Create seating maps in the <strong>Arrangements</strong> section.</li>
                  <li>Auto-match students and trigger notifications with ease.</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  System Status
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Supabase Connection</span>
                    <span className="text-green-500 font-bold">● Active</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Pabbly Webhook</span>
                    <span className="text-green-500 font-bold">● Configured</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-600">Authentication</span>
                    <span className="text-green-500 font-bold">● Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
