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
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function EmployeesPage() {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee", // Default role
    designation: "",
    department: "",
    phone: "",
    joiningDate: "",
    tenant: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (currentUser?.role === "superadmin") {
      fetchTenants();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchEmployees(1, false, searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants");
      if (res.data.success) {
        setTenants(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    }
  };

  const fetchEmployees = async (pageNum = 1, append = false, query = "") => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const endpoint = query 
        ? `/employees/search?q=${encodeURIComponent(query)}` 
        : `/employees?page=${pageNum}&limit=12`;

      const res = await api.get(endpoint);
      if (res.data.success) {
        if (append && !query) {
          setEmployees((prev) => [...prev, ...res.data.data]);
        } else {
          setEmployees(res.data.data);
        }
        setTotalEmployees(res.data.total || res.data.count);
        setHasMore(query ? false : (res.data.pagination?.next ? true : false));
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEmployees(nextPage, true);
  };

  const handleEdit = (employee) => {
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      password: "", // Don't populate password
      role: employee.role || "employee",
      designation: employee.designation || "",
      department: employee.department || "",
      phone: employee.phone || "",
      joiningDate: employee.joiningDate
        ? employee.joiningDate.split("T")[0]
        : "",
      tenant: employee.tenant?._id || employee.tenant || "",
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
          // Reset to page 1 and fetch fresh list to show new employee at top
          setPage(1);
          fetchEmployees(1, false);
        }
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save employee", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter((emp) => emp._id !== id));
      } catch (error) {
        console.error("Failed to delete employee", error);
      }
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
      role: "employee",
      designation: "",
      department: "",
      phone: "",
      joiningDate: "",
      tenant: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Employees
          </h1>
          <p className="text-gray-500 text-sm md:text-base">Manage your team members.</p>
        </div>
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => {
            resetForm();
            setShowInvite(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="inline">Add Employee</span>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees by name, email, role or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
        />
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
                <Label>Role</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newEmployee.role}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="client">Client</option>
                </select>
              </div>
              {currentUser?.role === "superadmin" && (
                <div className="space-y-2">
                  <Label>Tenant</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={newEmployee.tenant}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, tenant: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative"
              >
                {/* ... existing card content ... */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-base md:text-lg font-bold text-gray-700 ring-2 ring-white shrink-0">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base md:text-lg text-gray-900 leading-tight truncate">
                        {employee.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-[10px] md:text-xs text-gray-500 capitalize flex items-center gap-1 truncate">
                          <Briefcase className="w-3 h-3" />
                          {employee.designation || "No title"}
                        </p>
                        {currentUser?.role === "superadmin" && employee.tenant && (
                          <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-medium whitespace-nowrap">
                            {employee.tenant?.name || "Global"}
                          </span>
                        )}
                        <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${employee.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-100' :
                          employee.role === 'manager' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                            employee.role === 'client' ? 'bg-green-50 text-green-700 border border-green-100' :
                              'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                          {employee.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 self-end sm:self-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                      onClick={() => handleEdit(employee)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(employee._id)}
                    >
                      <Briefcase className="h-4 w-4 hidden" /> {/* Dummy to keep layout */}
                      <Plus className="h-4 w-4 rotate-45" /> {/* Delete icon representation */}
                    </Button>
                  </div>
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

          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-[150px]"
              >
                {loadingMore ? "Loading..." : "Load More Members"}
              </Button>
            </div>
          )}

          {!hasMore && totalEmployees > 12 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              You've reached the end of the list.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
