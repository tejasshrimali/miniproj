import React from "react";

const StudentTable = ({ students, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Roll Number
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Branch
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Year
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-gray-600">
                No students added yet
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.rollNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.branch}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.year}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => onEdit(student)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(student.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
