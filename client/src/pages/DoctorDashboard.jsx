import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API } from "../config/api"; // Import the API config

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    symptoms: "",
    diagnosis: "",
    medicines: [{ name: "", dosage: "", duration: "" }],
    additionalNotes: "",
  });
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(API.appointments.base, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const filteredAppointments = response.data.filter(
        (appointment) => appointment.doctorId._id === user.id
      );
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        API.appointments.update(appointmentId),
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAppointments();

      if (status === "Completed") {
        const appointment = appointments.find(
          (app) => app._id === appointmentId
        );
        setSelectedAppointment(appointment);
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    }
  };

  const handlePrescriptionChange = (field, value) => {
    setPrescriptionData({
      ...prescriptionData,
      [field]: value,
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...prescriptionData.medicines];
    updatedMedicines[index][field] = value;
    setPrescriptionData({
      ...prescriptionData,
      medicines: updatedMedicines,
    });
  };

  const addMedicine = () => {
    setPrescriptionData({
      ...prescriptionData,
      medicines: [
        ...prescriptionData.medicines,
        { name: "", dosage: "", duration: "" },
      ],
    });
  };

  const removeMedicine = (index) => {
    const updatedMedicines = prescriptionData.medicines.filter(
      (_, i) => i !== index
    );
    setPrescriptionData({
      ...prescriptionData,
      medicines: updatedMedicines,
    });
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/prescriptions",
        {
          appointmentId: selectedAppointment._id,
          ...prescriptionData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedAppointment(null);
      setPrescriptionData({
        symptoms: "",
        diagnosis: "",
        medicines: [{ name: "", dosage: "", duration: "" }],
        additionalNotes: "",
      });

      fetchAppointments();
    } catch (error) {
      console.error("Error creating prescription:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-medium text-gray-800">Clinix Sphere</h1>
          <div className="flex items-center space-x-6">
            <span className="text-gray-700 font-medium">
              Dr. {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedAppointment ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex justify-between items-center border-b p-6">
              <h2 className="text-xl font-medium text-gray-800">
                Create Prescription
              </h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitPrescription} className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6 border-b pb-6">
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-medium">
                    {selectedAppointment.patientId.username}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Appointment</p>
                  <p className="font-medium">
                    {new Date(selectedAppointment.date).toLocaleDateString()} at{" "}
                    {selectedAppointment.time}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="symptoms"
                  >
                    Symptoms
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id="symptoms"
                    rows="3"
                    value={prescriptionData.symptoms}
                    onChange={(e) =>
                      handlePrescriptionChange("symptoms", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="diagnosis"
                  >
                    Diagnosis
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id="diagnosis"
                    rows="3"
                    value={prescriptionData.diagnosis}
                    onChange={(e) =>
                      handlePrescriptionChange("diagnosis", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Medicines
                    </label>
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Medicine
                    </button>
                  </div>

                  <div className="space-y-4">
                    {prescriptionData.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div>
                          <label className="block text-gray-700 text-xs font-medium mb-1">
                            Medicine Name
                          </label>
                          <input
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={medicine.name}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-xs font-medium mb-1">
                            Dosage
                          </label>
                          <input
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={medicine.dosage}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-gray-700 text-xs font-medium mb-1">
                              Duration
                            </label>
                            <input
                              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={medicine.duration}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          {prescriptionData.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicine(index)}
                              className="text-gray-400 hover:text-gray-600 p-2 focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="additionalNotes"
                  >
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id="additionalNotes"
                    rows="3"
                    value={prescriptionData.additionalNotes}
                    onChange={(e) =>
                      handlePrescriptionChange(
                        "additionalNotes",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-medium leading-6 text-gray-800">
                  Appointments
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your patient appointments
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm overflow-hidden rounded-lg">
              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">
                    No appointments found
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    New appointments will appear here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Patient
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientId.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {appointment.time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                appointment.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {appointment.status === "Pending" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment._id,
                                      "Completed"
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment._id,
                                      "Cancelled"
                                    )
                                  }
                                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
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
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
