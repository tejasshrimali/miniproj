import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const StudentForm = ({ onSubmit, onCancel, initialData }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialData || {},
  });

  const handleFormSubmit = (data) => {
    if (!data.name || !data.email || !data.rollNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    onSubmit(data);
    reset();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {initialData ? "Edit Student" : "Add New Student"}
      </h2>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name *
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Student Name"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Roll Number *
          </label>
          <input
            {...register("rollNumber")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="CS2101"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email *
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="student@example.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Phone
          </label>
          <input
            {...register("phone")}
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Branch
          </label>
          <input
            {...register("branch")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="CSE"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Year
          </label>
          <select
            {...register("year")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </select>
        </div>

        <div className="md:col-span-3 flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            {initialData ? "Update" : "Add"} Student
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
