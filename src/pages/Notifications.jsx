import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import axios from "axios";

const Notifications = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("matched_students")
        .select(`
          id,
          roll_number,
          hall_no,
          subject,
          notification_status,
          created_at,
          students ( name, email ),
          exam_arrangements ( exam_date, exam_time )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedLogs = data.map((log) => ({
        id: log.id,
        rollNumber: log.roll_number,
        studentName: log.students?.name,
        email: log.students?.email,
        hallNo: log.hall_no,
        subject: log.subject,
        examDate: log.exam_arrangements?.exam_date,
        examTime: log.exam_arrangements?.exam_time,
        status: log.notification_status || 'pending',
        date: new Date(log.created_at).toLocaleString()
      }));

      setLogs(formattedLogs);
    } catch (error) {
      toast.error("Error fetching notification logs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (log) => {
    setRetrying(true);
    const webhookUrl = process.env.REACT_APP_PABBLY_WEBHOOK;
    
    if (!webhookUrl) {
      toast.error("Pabbly webhook URL is not configured");
      setRetrying(false);
      return;
    }

    toast.loading("Retrying notification...", { id: "retry" });

    try {
      const payload = {
        student_name: log.studentName,
        email: log.email,
        roll_number: log.rollNumber,
        hall_no: log.hallNo,
        subject: log.subject,
        exam_date: log.examDate,
        exam_time: log.examTime
      };

      await axios.post(webhookUrl, payload);

      await supabase
        .from("matched_students")
        .update({ notification_status: "sent" })
        .eq("id", log.id);

      toast.success("Notification sent successfully!");
      fetchLogs();
    } catch (error) {
      console.error("Retry failed:", error);
      toast.error("Failed to send notification.");
      
      await supabase
        .from("matched_students")
        .update({ notification_status: "failed" })
        .eq("id", log.id);
        
      fetchLogs();
    } finally {
      toast.dismiss("retry");
      setRetrying(false);
    }
  };

  const handleRetryAllFailed = async () => {
    const failedLogs = logs.filter(log => log.status === 'failed' || log.status === 'pending');
    if (failedLogs.length === 0) {
      toast.error("No failed or pending notifications to retry");
      return;
    }

    setRetrying(true);
    const webhookUrl = process.env.REACT_APP_PABBLY_WEBHOOK;
    toast.loading(`Retrying ${failedLogs.length} notifications...`, { id: "retryAll" });

    let successCount = 0;
    
    for (const log of failedLogs) {
      try {
        const payload = {
          student_name: log.studentName,
          email: log.email,
          roll_number: log.rollNumber,
          hall_no: log.hallNo,
          subject: log.subject,
          exam_date: log.examDate,
          exam_time: log.examTime
        };

        await axios.post(webhookUrl, payload);
        await supabase
          .from("matched_students")
          .update({ notification_status: "sent" })
          .eq("id", log.id);
        successCount++;
      } catch (error) {
        // Just continue to next
      }
    }

    toast.dismiss("retryAll");
    fetchLogs();
    setRetrying(false);
    toast.success(`Successfully retried ${successCount} out of ${failedLogs.length}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Notification Logs
              </h1>
              <button
                onClick={handleRetryAllFailed}
                disabled={retrying}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
              >
                Retry All Failed/Pending
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">No notifications found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Date/Time</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Student</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Hall/Subject</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {log.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <p className="font-bold">{log.studentName}</p>
                          <p className="text-xs text-gray-500">{log.rollNumber}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <p className="font-bold">Hall {log.hallNo}</p>
                          <p className="text-xs text-gray-500">{log.subject}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {log.status === 'sent' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Sent</span>
                          )}
                          {log.status === 'failed' && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Failed</span>
                          )}
                          {(log.status === 'pending' || !log.status) && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {log.status !== 'sent' && (
                            <button
                              onClick={() => handleRetry(log)}
                              disabled={retrying}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50"
                            >
                              Retry
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
