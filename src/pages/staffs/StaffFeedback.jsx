import React, { useState, useEffect } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout";
import { Icon } from "@iconify/react";

export default function StaffFeedback() {
  const token = localStorage.getItem("staff_token");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/staffs/feedback`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFeedbacks(res.data.data || res.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch feedback history", err);
        setError("Failed to load your feedback history.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchFeedbacks();
    }
  }, [token, API_BASE_URL]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/staffs/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete feedback.");
    }
  };

  return (
    <StaffDashboardLayout pagetitle="My Feedback History">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#0F2843] dark:text-white">Feedback History</h1>
            <p className="text-gray-500 text-sm mt-2">Manage the feedback and reviews you've submitted.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 mb-6 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-[#BB9E7F]" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white dark:bg-[#09314F] rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mdi:message-star-outline" className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No feedback yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              You haven't submitted any feedback yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col relative group transition-all hover:shadow-md">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#BB9E7F]/10 text-[#BB9E7F] px-2 py-1 rounded-md">
                      {item.feedbackable_type?.split('\\').pop() || item.feedbackable_type || "Review"}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3 leading-tight">{item.title || "No Title"}</h3>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    title="Delete Feedback"
                  >
                    <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon 
                      key={star}
                      icon={item.rating >= star ? "mdi:star" : "mdi:star-outline"} 
                      className={`w-5 h-5 ${item.rating >= star ? "text-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                {item.comment && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                    "{item.comment}"
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:calendar-outline" className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  {item.would_recommend && (
                    <div className="flex items-center gap-1 text-[#10B981] font-semibold">
                      <Icon icon="mdi:thumb-up-outline" /> Recommended
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </StaffDashboardLayout>
  );
}
