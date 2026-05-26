import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StudentTable from "../components/StudentTable";
import StudentForm from "../components/StudentForm";
import ExcelUpload from "../components/ExcelUpload";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map DB snake_case to camelCase for frontend components
      const formattedData = data.map(s => ({
        ...s,
        rollNumber: s.roll_number
      }));
      setStudents(formattedData);
    } catch (error) {
      toast.error("Error fetching students: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (student) => {
    try {
      const dbStudent = {
        name: student.name,
        email: student.email,
        phone: student.phone,
        roll_number: student.rollNumber,
        branch: student.branch,
        year: student.year,
        division: student.division
      };

      if (editingStudent) {
        const { error } = await supabase
          .from("students")
          .update(dbStudent)
          .eq("id", editingStudent.id);
        
        if (error) throw error;
        toast.success("Student updated successfully");
      } else {
        const { error } = await supabase
          .from("students")
          .insert([dbStudent]);
        
        if (error) throw error;
        toast.success("Student added successfully");
      }
      
      setShowForm(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error("Error saving student: " + error.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Student deleted");
      fetchStudents();
    } catch (error) {
      toast.error("Error deleting student: " + error.message);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleExcelUpload = async (importedStudents) => {
    try {
      const dbStudents = importedStudents.map(s => ({
        name: s.name,
        email: s.email,
        phone: s.phone,
        roll_number: s.rollNumber,
        branch: s.branch,
        year: s.year
      }));

      const { error } = await supabase
        .from("students")
        .insert(dbStudents);
      
      if (error) throw error;
      toast.success(`${importedStudents.length} students imported successfully`);
      fetchStudents();
    } catch (error) {
      toast.error("Error importing students: " + error.message);
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
              <h1 className="text-3xl font-bold text-gray-800">Students</h1>
              <div className="space-x-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Add Student
                </button>
                <ExcelUpload onUpload={handleExcelUpload} />
              </div>
            </div>

            {showForm && (
              <StudentForm
                onSubmit={handleAddStudent}
                onCancel={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                }}
                initialData={editingStudent}
              />
            )}

            {loading ? (
              <div className="text-center py-10">Loading students...</div>
            ) : (
              <StudentTable
                students={students}
                onDelete={handleDeleteStudent}
                onEdit={handleEditStudent}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
