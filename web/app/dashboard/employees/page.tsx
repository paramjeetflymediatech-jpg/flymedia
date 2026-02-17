"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Plus, User, Mail, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Employee {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", password: "" });

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

  const handleInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await api.post("/employees", newEmployee);
          if (res.data.success) {
              setEmployees([...employees, res.data.data]);
              setShowInvite(false);
              setNewEmployee({ name: "", email: "", password: "" });
          }
      } catch (error) {
          console.error("Failed to invite employee", error);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-gray-400">Manage your team members.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowInvite(!showInvite)}>
            <Plus className="h-4 w-4" />
            Add Employee
        </Button>
      </div>

      {showInvite && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-top-4">
              <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                          <Label>Name</Label>
                          <Input 
                            value={newEmployee.name} 
                            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} 
                            required 
                          />
                      </div>
                      <div>
                          <Label>Email</Label>
                          <Input 
                            type="email"
                            value={newEmployee.email} 
                            onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} 
                            required 
                          />
                      </div>
                      <div>
                          <Label>Temporary Password</Label>
                          <Input 
                            type="password"
                            value={newEmployee.password} 
                            onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} 
                            required 
                          />
                      </div>
                  </div>
                  <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
                      <Button type="submit">Add Employee</Button>
                  </div>
              </form>
          </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
            <User className="h-10 w-10 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">No employees found</h3>
            <p className="text-gray-400">Invite your first team member to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => (
                <div key={employee._id} className="group relative rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                            {employee.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{employee.name}</h3>
                            <p className="text-sm text-gray-400 capitalize">{employee.role}</p>
                        </div>
                        <button className="ml-auto text-gray-500 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Mail className="h-4 w-4" />
                        {employee.email}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            Active
                        </span>
                        <Button variant="ghost" size="sm" className="h-8">View Profile</Button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
