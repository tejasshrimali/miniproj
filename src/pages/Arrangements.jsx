import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ArrangementForm from "../components/ArrangementForm";
import ArrangementTable from "../components/ArrangementTable";
import StudentMatcher from "../components/StudentMatcher";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";

const Arrangements = () => {
  const [arrangements, setArrangements] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingArrangement, setEditingArrangement] = useState(null);
  const [matchingArrangement, setMatchingArrangement] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchArrangements();
  }, []);

  const fetchArrangements = async () => {
    try {
      const { data, error } = await supabase
        .from("exam_arrangements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(a => ({
        id: a.id,
        hallNo: a.hall_no,
        floor: a.floor,
        subject: a.subject,
        branch: a.branch,
        seatFrom: a.seat_from,
        seatTo: a.seat_to,
        examDate: a.exam_date,
        examTime: a.exam_time,
        status: a.status
      }));
      setArrangements(formattedData);
    } catch (error) {
      toast.error("Error fetching arrangements: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArrangement = async (data) => {
    try {
      const dbArrangement = {
        hall_no: data.hallNo,
        floor: data.floor,
        subject: data.subject,
        branch: data.branch,
        seat_from: data.seatFrom,
        seat_to: data.seatTo,
        exam_date: data.examDate,
        exam_time: data.examTime,
        status: "draft",
        created_by: user?.id
      };

      if (editingArrangement) {
        const { error } = await supabase
          .from("exam_arrangements")
          .update(dbArrangement)
          .eq("id", editingArrangement.id);
        
        if (error) throw error;
        toast.success("Arrangement updated");
      } else {
        const { error } = await supabase
          .from("exam_arrangements")
          .insert([dbArrangement]);
        
        if (error) throw error;
        toast.success("Arrangement created");
      }
      setShowForm(false);
      setEditingArrangement(null);
      fetchArrangements();
    } catch (error) {
      toast.error("Error saving arrangement: " + error.message);
    }
  };

  const handleDeleteArrangement = async (id) => {
    try {
      const { error } = await supabase
        .from("exam_arrangements")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Arrangement deleted");
      fetchArrangements();
    } catch (error) {
      toast.error("Error deleting arrangement: " + error.message);
    }
  };

  const handleEditArrangement = (arrangement) => {
    setEditingArrangement(arrangement);
    setShowForm(true);
  };

  const handleSelectForMatching = async (arrangement) => {
    try {
      // Fetch all students for matching
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error("Please add students first");
        return;
      }
      
      const formattedStudents = data.map(s => ({
        ...s,
        rollNumber: s.roll_number
      }));
      
      setStudents(formattedStudents);
      setMatchingArrangement(arrangement);
    } catch (error) {
      toast.error("Error fetching students for matching: " + error.message);
    }
  };

  const handleConfirmMatching = async (matchResult) => {
    try {
      const matchedStudents = matchResult.matchedStudents;
      const arrangementId = matchResult.arrangement.id;

      // Prepare data for matched_students table
      const matchedData = matchedStudents.map(student => ({
        arrangement_id: arrangementId,
        student_id: student.id,
        roll_number: student.rollNumber,
        hall_no: matchResult.arrangement.hallNo,
        subject: matchResult.arrangement.subject,
        notification_status: "pending"
      }));

      // Start transaction-like behavior: 
      // 1. Delete existing matches for this arrangement (if any) to prevent duplicates
      await supabase
        .from("matched_students")
        .delete()
        .eq("arrangement_id", arrangementId);

      // 2. Insert new matches
      const { error: insertError } = await supabase
        .from("matched_students")
        .insert(matchedData);
      
      if (insertError) throw insertError;

      // 3. Update arrangement status to matched
      const { error: updateError } = await supabase
        .from("exam_arrangements")
        .update({ status: "matched" })
        .eq("id", arrangementId);

      if (updateError) throw updateError;

      // Save to localStorage just to easily pass state to preview without URL params for now
      // Or we can rely on DB in preview, but preview expects this format currently
      // We will update Preview to fetch from DB instead in the next step
      localStorage.setItem("preview_arrangement_id", arrangementId);

      setMatchingArrangement(null);
      toast.success(`${matchResult.totalMatched} students matched!`);
      fetchArrangements();
      navigate(`/preview`);
    } catch (error) {
      toast.error("Error matching students: " + error.message);
    }
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
                Exam Arrangements
              </h1>
              <button
                onClick={() => {
                  setEditingArrangement(null);
                  setShowForm(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Create Arrangement
              </button>
            </div>

            {showForm && (
              <ArrangementForm
                onSubmit={handleAddArrangement}
                onCancel={() => {
                  setShowForm(false);
                  setEditingArrangement(null);
                }}
                initialData={editingArrangement}
              />
            )}

            {loading ? (
              <div className="text-center py-10">Loading arrangements...</div>
            ) : (
              <ArrangementTable
                arrangements={arrangements}
                onDelete={handleDeleteArrangement}
                onEdit={handleEditArrangement}
                onSelectForMatching={handleSelectForMatching}
              />
            )}

            {matchingArrangement && (
              <StudentMatcher
                arrangement={matchingArrangement}
                students={students}
                onConfirm={handleConfirmMatching}
                onCancel={() => setMatchingArrangement(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arrangements;
