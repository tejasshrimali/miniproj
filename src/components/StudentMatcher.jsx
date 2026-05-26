import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";

// Utility function to extract numeric part and prefix from roll number
const parseRollNumber = (rollNumber) => {
  const match = rollNumber.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return { prefix: match[1], number: parseInt(match[2]) };
};

// Generate roll numbers between range
const generateRollRange = (seatFrom, seatTo) => {
  const fromParsed = parseRollNumber(seatFrom);
  const toParsed = parseRollNumber(seatTo);

  if (!fromParsed || !toParsed) {
    return [];
  }

  if (fromParsed.prefix !== toParsed.prefix) {
    toast.error("Seat range must have same prefix (e.g., CS2101 - CS2135)");
    return [];
  }

  const range = [];
  const padding = seatFrom.replace(/\D/g, "").length;

  for (let i = fromParsed.number; i <= toParsed.number; i++) {
    range.push(`${fromParsed.prefix}${i.toString().padStart(padding, "0")}`);
  }

  return range;
};

const StudentMatcher = ({ arrangement, students, onConfirm, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Generate expected roll numbers
  const expectedRolls = useMemo(() => {
    return generateRollRange(arrangement.seatFrom, arrangement.seatTo);
  }, [arrangement.seatFrom, arrangement.seatTo]);

  // Match students with generated roll numbers
  const matchedStudents = useMemo(() => {
    return students.filter((student) =>
      expectedRolls.includes(student.rollNumber),
    );
  }, [students, expectedRolls]);

  const missingRolls = expectedRolls.filter(
    (roll) => !matchedStudents.some((s) => s.rollNumber === roll),
  );

  const filteredMatches = matchedStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.includes(searchTerm),
  );

  const toggleSelection = (student) => {
    setSelectedStudents((prev) =>
      prev.some((s) => s.id === student.id)
        ? prev.filter((s) => s.id !== student.id)
        : [...prev, student],
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredMatches.length) {
      // If all are selected, deselect all currently filtered
      const filteredIds = filteredMatches.map(s => s.id);
      setSelectedStudents(prev => prev.filter(s => !filteredIds.includes(s.id)));
    } else {
      // Select all currently filtered that aren't already selected
      const currentSelectedIds = selectedStudents.map(s => s.id);
      const newSelections = filteredMatches.filter(s => !currentSelectedIds.includes(s.id));
      setSelectedStudents(prev => [...prev, ...newSelections]);
    }
  };

  const handleConfirm = () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    onConfirm({
      arrangement,
      matchedStudents: selectedStudents,
      totalExpected: expectedRolls.length,
      totalMatched: selectedStudents.length,
    });
  };

  const isAllSelected = filteredMatches.length > 0 && selectedStudents.length === filteredMatches.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">
            Match Students - {arrangement.hallNo} ({arrangement.subject})
          </h2>
          <p className="text-gray-600 mt-2">
            Found {matchedStudents.length} out of {expectedRolls.length}{" "}
            students
          </p>
        </div>

        {missingRolls.length > 0 && (
          <div className="p-4 bg-red-50 border-b border-red-200 shrink-0">
            <p className="text-red-700 font-bold mb-2">
              ⚠️ Missing Students ({missingRolls.length}):
            </p>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {missingRolls.slice(0, 10).map((roll) => (
                <span
                  key={roll}
                  className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs"
                >
                  {roll}
                </span>
              ))}
              {missingRolls.length > 10 && (
                <span className="text-red-600 text-xs mt-1">
                  ...and {missingRolls.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border-b shrink-0 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name or roll number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSelectAll}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg whitespace-nowrap border border-gray-300 transition-colors"
          >
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 min-h-[200px]">
          <div className="space-y-2">
            {filteredMatches.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No matching students found
              </p>
            ) : (
              filteredMatches.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleSelection(student)}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.some((s) => s.id === student.id)}
                    onChange={() => {}} // handled by parent div onClick
                    className="w-4 h-4 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      {student.rollNumber} | {student.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2 shrink-0">
          <button
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Confirm ({selectedStudents.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentMatcher;
