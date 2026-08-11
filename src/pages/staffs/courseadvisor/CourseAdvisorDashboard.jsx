import React, { useState, useEffect, useCallback } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import {
  UserGroupIcon as UserGroupOutline, 
  ShieldCheckIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";
import axios from "axios";

export default function CourseAdvisorDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [inactiveStudents, setInactiveStudents] = useState(0);
  const [newStudentsCount, setNewStudentsCount] = useState(0);
  const [guardians, setGuardians] = useState([]);
  const [avgAttempts, setAvgAttempts] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const getLatestCourse = useCallback((student) => {
    const payments = student.payments || [];
    if (payments.length > 0) {
       const sortedPayments = [...payments]
         .filter(p => p.status === 'successful' && p.enrollment && p.enrollment.end_date)
         .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
       
       if (sortedPayments.length > 0) {
          const latestPayment = sortedPayments[0];
          return {
             status: latestPayment.enrollment.status || 'active',
             end_date: latestPayment.enrollment.end_date,
             start_date: latestPayment.enrollment.start_date
          };
       }
    }

    const studentInfo = Array.isArray(student?.information) ? student.information[0] : (student?.information || {});
    const courses = student?.courses || student?.course_enrollments || studentInfo?.courses || studentInfo?.course_enrollments || [];
    
    if (!courses || courses.length === 0) return null;
    
    return [...courses].sort((a, b) => {
       const dateA = new Date(a.end_date || 0);
       const dateB = new Date(b.end_date || 0);
       return dateB - dateA;
    })[0];
  }, []);

  const isStudentActive = useCallback((student) => {
    const latest = getLatestCourse(student);
    if (!latest) return false;
    return latest.status === 'active' || (latest.end_date && new Date(latest.end_date) >= new Date());
  }, [getLatestCourse]);

  const isStudentSuspended = useCallback((student) => {
    return student.banned === 1 || 
      student.account_status === "suspended" || 
      student.deleted_at != null || 
      student.information?.deleted_at != null || 
      (Array.isArray(student.information) && student.information[0]?.deleted_at != null);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const config = {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      };

      const [studentsRes, statsRes, guardiansRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/advisor/students/all`, config),
        axios.get(`${API_BASE_URL}/api/advisor/dashboard/stats`, config).catch(e => { return { data: null }; }),
        axios.get(`${API_BASE_URL}/api/advisor/guardians/all`, config).catch(e => { return { data: null }; })
      ]);

      // Calculate Students Stats
      const allStudents = studentsRes.data?.students || studentsRes.data?.data || [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const newStudents = allStudents.filter(s => {
        if (!s.created_at) return false;
        const date = new Date(s.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const active = allStudents.filter(s => isStudentActive(s) && !isStudentSuspended(s)).length;
      const inactive = allStudents.filter(s => !isStudentActive(s) && !isStudentSuspended(s)).length;

      setTotalStudents(allStudents.length);
      setNewStudentsCount(newStudents.length);
      setActiveStudents(active);
      setInactiveStudents(inactive);

      // Set Dashboard Stats
      if (statsRes.data) {
        setAvgAttempts(statsRes.data.average_attempts_per_student || 0);
        setAvgScore(statsRes.data.average_point_per_exam || 0);
      }

      // Set Guardians
      setGuardians(guardiansRes.data?.guardians || []);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  }, [API_BASE_URL, token, isStudentActive, isStudentSuspended]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <StaffDashboardLayout pagetitle="Dashboard" hideHeader={false}>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        {/* Alert Banner */}
        <div className="bg-[#EBEDED] dark:bg-gray-800 p-6 rounded-xl flex justify-between items-center shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[#09314F] dark:text-gray-200 font-medium text-sm md:text-base">
            You have English Master Class in 20mins
          </p>
          <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">10:15am</span>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Students Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group col-span-1 md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                <UserGroupOutline className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
              </div>
              <span className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-wider">
                +{newStudentsCount} this month
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-400 mb-1 tracking-tight">Total Students</h4>
            <div className="text-4xl font-black text-[#09314F] dark:text-white mb-6 tracking-tighter">{totalStudents}</div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Active Students <span className="lowercase text-gray-300 font-medium">(paid)</span></p>
                <p className="text-2xl font-black text-[#76D287]">{activeStudents}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Inactive Students <span className="lowercase text-gray-300 font-medium">(unpaid)</span></p>
                <p className="text-2xl font-black text-[#E83831]">{inactiveStudents}</p>
              </div>
            </div>
          </div>

          {/* Total Guardians Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group col-span-1 md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-gray-400 mb-1 tracking-tight">Total Guardians</h4>
            <div className="text-4xl font-black text-[#09314F] dark:text-white mb-6 tracking-tighter">{guardians.length}</div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase">Guardians currently in your roster</p>
          </div>

          {/* Average Attempts Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group col-span-1 md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-gray-400 mb-1 tracking-tight">Average Exam Attempts</h4>
            <div className="text-4xl font-black text-[#09314F] dark:text-white mb-2 tracking-tighter">{avgAttempts}</div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase">Per Student (Overall)</p>
          </div>

          {/* Average Score Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group col-span-1 md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-gray-400 mb-1 tracking-tight">Average Exam Score</h4>
            <div className="text-4xl font-black text-[#09314F] dark:text-white mb-2 tracking-tighter">{avgScore}%</div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase">Points Per Exam (Overall)</p>
          </div>

        </div>

        {/* Guardians and Wards Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-8 pb-4">
            <h3 className="text-lg font-bold text-[#0F2843] dark:text-white">Guardians and their Wards</h3>
            <p className="text-xs text-gray-400 font-medium">List of guardians and the students assigned to them</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#B99E7F] text-white">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Guardian Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Wards (Students)</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Guardian Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {guardians.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-8 text-center text-sm font-medium text-gray-500">
                      No guardians found.
                    </td>
                  </tr>
                ) : (
                  guardians.map((guardian, idx) => (
                    <tr key={guardian.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">
                            {guardian.first_name ? guardian.first_name.charAt(0) : "G"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0F2843] dark:text-gray-200">
                              {guardian.first_name} {guardian.last_name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {guardian.students && guardian.students.length > 0 ? (
                            guardian.students.map(student => (
                              <span key={student.id} className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap">
                                {student.first_name} {student.last_name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center font-bold text-xs text-gray-500 dark:text-gray-400">
                        {guardian.email || guardian.tel || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </StaffDashboardLayout>
  );
}
