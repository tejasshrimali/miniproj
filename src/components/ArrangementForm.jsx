import React from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";

const ArrangementForm = ({ onSubmit, onCancel, initialData }) => {
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: initialData || {
      hallNo: "",
      floor: "",
      subject: "",
      branch: "",
      seatFrom: "",
      seatTo: "",
      examDate: "",
      examTime: "",
    },
  });

  const seatFrom = watch("seatFrom");
  const seatTo = watch("seatTo");

  const validateSeatRange = () => {
    if (!seatFrom || !seatTo) return true;

    const fromNum = parseInt(seatFrom.replace(/\D/g, ""));
    const toNum = parseInt(seatTo.replace(/\D/g, ""));

    if (isNaN(fromNum) || isNaN(toNum)) {
      toast.error("Invalid seat format");
      return false;
    }

    if (fromNum > toNum) {
      toast.error("Seat From must be less than Seat To");
      return false;
    }

    return true;
  };

  const handleFormSubmit = (data) => {
    if (!validateSeatRange()) return;
    if (
      !data.hallNo ||
      !data.floor ||
      !data.subject ||
      !data.branch ||
      !data.examDate ||
      !data.examTime
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    onSubmit(data);
    reset();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {initialData ? "Edit Exam Arrangement" : "Create New Arrangement"}
      </h2>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Hall No *
          </label>
          <Controller
            name="hallNo"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="401"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Floor *
          </label>
          <Controller
            name="floor"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fourth Floor"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Subject *
          </label>
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="EM-III"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Branch *
          </label>
          <Controller
            name="branch"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SY CSE A"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Seat From *
          </label>
          <Controller
            name="seatFrom"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CS2101"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Seat To *
          </label>
          <Controller
            name="seatTo"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CS2135"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Exam Date *
          </label>
          <Controller
            name="examDate"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Exam Time *
          </label>
          <Controller
            name="examTime"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        <div className="md:col-span-4 flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            {initialData ? "Update" : "Create"} Arrangement
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

export default ArrangementForm;
