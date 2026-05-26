import React, { useRef } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const ExcelUpload = ({ onUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedStudents = jsonData.map((row) => ({
          id: Date.now() + Math.random(),
          name: row.name || row.Name || "",
          rollNumber:
            row.rollNumber || row["Roll Number"] || row["roll_number"] || "",
          email: row.email || row.Email || "",
          phone: row.phone || row.Phone || "",
          branch: row.branch || row.Branch || "",
          year: row.year || row.Year || "",
        }));

        onUpload(importedStudents);
        toast.success(`${importedStudents.length} students imported`);
        fileInputRef.current.value = "";
      } catch (error) {
        toast.error("Error reading Excel file");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
      >
        Import Excel
      </button>
    </>
  );
};

export default ExcelUpload;
