import React from "react";

const ArrangementTable = ({
  arrangements,
  onDelete,
  onEdit,
  onSelectForMatching,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Hall No
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Branch
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Seats
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Date
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
              Time
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
          {arrangements.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-600">
                No arrangements created yet
              </td>
            </tr>
          ) : (
            arrangements.map((arrangement) => (
              <tr key={arrangement.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 font-bold">
                  {arrangement.hallNo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {arrangement.subject}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {arrangement.branch}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {arrangement.seatFrom} - {arrangement.seatTo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {arrangement.examDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {arrangement.examTime}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      arrangement.status === "draft"
                        ? "bg-yellow-200 text-yellow-800"
                        : arrangement.status === "submitted"
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {arrangement.status || "draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => onSelectForMatching(arrangement)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Match
                  </button>
                  <button
                    onClick={() => onEdit(arrangement)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(arrangement.id)}
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

export default ArrangementTable;
