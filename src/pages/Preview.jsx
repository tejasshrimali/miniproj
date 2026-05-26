import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import axios from "axios";

const Preview = () => {
  const [arrangement, setArrangement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    fetchPreviewData();
  }, []);

  const fetchPreviewData = async () => {
    try {
      const arrangementId = localStorage.getItem("preview_arrangement_id");
      if (!arrangementId) {
        setLoading(false);
        return;
      }

      // Fetch arrangement details
      const { data: arrData, error: arrError } = await supabase
        .from("exam_arrangements")
        .select("*")
        .eq("id", arrangementId)
        .single();
      
      if (arrError) throw arrError;
      setArrangement({
        id: arrData.id,
        hallNo: arrData.hall_no,
        subject: arrData.subject,
        examDate: arrData.exam_date,
        examTime: arrData.exam_time
      });

      // Fetch matched students with join on students table
      const { data: matchData, error: matchError } = await supabase
        .from("matched_students")
        .select(`
          id,
          roll_number,
          notification_status,
          students (
            id,
            name,
            email,
            phone
          )
        `)
        .eq("arrangement_id", arrangementId);
      
      if (matchError) throw matchError;

      const formattedStudents = matchData.map(m => ({
        matchId: m.id,
        studentId: m.students.id,
        rollNumber: m.roll_number,
        name: m.students.name,
        email: m.students.email,
        phone: m.students.phone,
        status: m.notification_status
      }));

      setStudents(formattedStudents);
    } catch (error) {
      toast.error("Error loading preview data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 overflow-auto p-6 flex justify-center items-center">
            <div className="text-xl">Loading preview data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!arrangement || students.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  No Data to Preview
                </h1>
                <p className="text-gray-600">
                  Please create an arrangement and match students first
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.includes(searchTerm) ||
      student.email.includes(searchTerm),
  );

  const handleRemoveStudent = async (matchId) => {
    try {
      const { error } = await supabase
        .from("matched_students")
        .delete()
        .eq("id", matchId);
      
      if (error) throw error;
      
      const updated = students.filter((s) => s.matchId !== matchId);
      setStudents(updated);
      toast.success("Student removed from arrangement");
    } catch (error) {
      toast.error("Error removing student: " + error.message);
    }
  };

  const handleConfirmAndNotify = async () => {
    if (students.length === 0) {
      toast.error("No students to notify");
      return;
    }

    setNotifying(true);
    const webhookUrl = process.env.REACT_APP_PABBLY_WEBHOOK;
    
    if (!webhookUrl) {
      toast.error("Pabbly webhook URL is not configured in .env.local");
      setNotifying(false);
      return;
    }

    toast.loading(`Sending notifications to ${students.length} students...`, { id: 'notify' });

    try {
      // Prepare bulk payload
      const bulkPayload = students.map(student => ({
        student_name: student.name,
        email: student.email,
        roll_number: student.rollNumber,
        hall_no: arrangement.hallNo,
        subject: arrangement.subject,
        exam_date: arrangement.examDate,
        exam_time: arrangement.examTime
      }));

      // Trigger Pabbly Webhook with the entire array
      await axios.post(webhookUrl, { data: bulkPayload });

      // Update status in DB for all these students
      const matchIds = students.map(s => s.matchId);
      await supabase
        .from("matched_students")
        .update({ notification_status: "sent" })
        .in("id", matchIds);
      
      // Update local state
      setStudents(prev => prev.map(s => ({ ...s, status: "sent" })));
      
      toast.dismiss('notify');
      toast.success(`Successfully notified all ${students.length} students!`);
    } catch (error) {
      console.error("Failed to notify students in bulk:", error);
      
      const matchIds = students.map(s => s.matchId);
      // Update status to failed
      await supabase
        .from("matched_students")
        .update({ notification_status: "failed" })
        .in("id", matchIds);
        
      setStudents(prev => prev.map(s => ({ ...s, status: "failed" })));
      
      toast.dismiss('notify');
      toast.error(`Failed to send notifications.`);
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Preview Matched Students
            </h1>

            {/* Arrangement Summary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Hall No</p>
                <p className="text-2xl font-bold text-blue-600">
                  {arrangement.hallNo}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Subject</p>
                <p className="text-xl font-bold text-gray-800">
                  {arrangement.subject}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Date</p>
                <p className="text-lg font-bold text-gray-800">
                  {arrangement.examDate}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Time</p>
                <p className="text-lg font-bold text-gray-800">
                  {arrangement.examTime}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.length}
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search by name, roll number, or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Hall
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-600"
                      >
                        No students match the search
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.matchId}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {arrangement.hallNo}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {student.status === 'sent' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Sent</span>
                          )}
                          {student.status === 'failed' && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Failed</span>
                          )}
                          {(student.status === 'pending' || !student.status) && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleRemoveStudent(student.matchId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            disabled={notifying}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  localStorage.removeItem("preview_arrangement_id");
                  setArrangement(null);
                  setStudents([]);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
                disabled={notifying}
              >
                Back
              </button>
              <button
                onClick={handleConfirmAndNotify}
                disabled={notifying}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
              >
                {notifying ? 'Sending...' : 'Notify Students'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
