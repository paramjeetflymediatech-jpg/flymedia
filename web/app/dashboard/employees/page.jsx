"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  User,
  Mail,
  MoreVertical,
  Phone,
  Calendar,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
    department: "",
    phone: "",
    joiningDate: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      password: "", // Don't populate password
      designation: employee.designation || "",
      department: employee.department || "",
      phone: employee.phone || "",
      joiningDate: employee.joiningDate
        ? employee.joiningDate.split("T")[0]
        : "",
    });
    setSelectedEmployeeId(employee._id);
    setEditMode(true);
    setShowInvite(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editMode) {
        // Remove password if empty to avoid overwriting with empty string
        const dataToUpdate = { ...newEmployee };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        res = await api.put(`/employees/${selectedEmployeeId}`, dataToUpdate);
      } else {
        res = await api.post("/employees", newEmployee);
      }

      if (res.data.success) {
        if (editMode) {
          setEmployees(
            employees.map((emp) =>
              emp._id === selectedEmployeeId ? res.data.data : emp,
            ),
          );
        } else {
          setEmployees([...employees, res.data.data]);
        }
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save employee", error);
    }
  };

  const resetForm = () => {
    setShowInvite(false);
    setEditMode(false);
    setSelectedEmployeeId(null);
    setNewEmployee({
      name: "",
      email: "",
      password: "",
      designation: "",
      department: "",
      phone: "",
      joiningDate: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Employees
          </h1>
          <p className="text-gray-500">Manage your team members.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setShowInvite(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {showInvite && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg animate-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {editMode ? "Edit Employee" : "Add New Employee"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {editMode ? "New Password (optional)" : "Temporary Password"}
                </Label>
                <Input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  required={!editMode}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  placeholder="e.g. Senior Developer"
                  value={newEmployee.designation}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      designation: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  placeholder="e.g. Engineering"
                  value={newEmployee.department}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      department: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input
                  type="date"
                  value={newEmployee.joiningDate}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      joiningDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editMode ? "Update Employee" : "Send Invite"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No employees found. Add one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee._id}
              className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-lg font-bold text-gray-700 ring-2 ring-white">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3" />
                      {employee.designation || employee.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
                  onClick={() => handleEdit(employee)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.department && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{employee.department}</span>
                  </div>
                )}
                {employee.joiningDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      Joined{" "}
                      {new Date(employee.joiningDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
