import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import CreateMasterClassModal from "../../../components/private/staffs/AdminMasterclassModal.jsx";
import { isReadOnlyStaff } from "../../../utils/roleUtils.js";
import {
  BOOTCAMP_TRACKS,
  matchClassForBootcampTrack,
  getBootcampCardSummary,
  getCurrentWeekMondayYMD,
  formatDurationClock,
} from "../../../utils/bootcampUtils.js";

const MATH_SYMBOLS = ["±", "×", "÷", "√", "π", "θ", "°", "²", "³", "½", "¼", "≤", "≥", "≠", "≈", "Δ"];

const createEmptyQuestion = () => ({
  id: null,
  passage_text: "",
  question_text: "",
  image_url: "",
  options: [
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
  ],
  correct_option: "A",
  explanation: "",
});

const toLocalDateTimeInput = (isoValue) => {
  if (!isoValue) return "";
  const d = new Date(isoValue);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toUtcIsoString = (localInput) => {
  if (!localInput) return null;
  const d = new Date(localInput);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const buildInitialQuestions = (count = 20) =>
  Array.from({ length: count }, () => createEmptyQuestion());

export default function BootcampManagement() {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const staffRole = (localStorage.getItem("staff_role") || "").toLowerCase();
  const isReadOnly = isReadOnlyStaff(staffRole);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }),
    [token]
  );

  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- LIVE CLASSES STATE ---
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);

  // --- CBT STATE ---
  const [cbts, setCbts] = useState([]);
  const [cbtsLoading, setCbtsLoading] = useState(true);
  const [activeTrackFilter, setActiveTrackFilter] = useState("all");
  const [activeSectionTab, setActiveSectionTab] = useState("cbts"); // "cbts" | "participants"

  // --- CBT EDITOR MODAL ---
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCbtId, setEditingCbtId] = useState(null);
  const [savingCbt, setSavingCbt] = useState(false);
  const [cbtForm, setCbtForm] = useState({
    title: "Week 1 - JAMB Use of English",
    subject_track: "jamb_english",
    week_start_date: getCurrentWeekMondayYMD(),
    duration_minutes: 20,
    starts_at: "",
    expires_at: "",
    is_active: true,
  });
  const [cbtQuestions, setCbtQuestions] = useState(() => buildInitialQuestions(20));
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [uploadingImgIdx, setUploadingImgIdx] = useState(null);

  // --- CBT RESULTS MODAL ---
  const [resultsModalCbt, setResultsModalCbt] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // --- PARTICIPANTS & PIN RESET ---
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [resetPinResult, setResetPinResult] = useState(null);

  // --- FETCH CLASSES ---
  const fetchClasses = useCallback(async () => {
    setClassesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/classes/all`, {
        headers: authHeaders,
      });
      const list = res.data?.classes || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setClasses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch classes for Bootcamp:", err);
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, [API_BASE_URL, authHeaders]);

  // --- FETCH CBTS ---
  const fetchCbts = useCallback(async () => {
    setCbtsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/bootcamp/cbts`, {
        headers: authHeaders,
      });
      setCbts(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch Bootcamp CBTs:", err);
      setCbts([]);
    } finally {
      setCbtsLoading(false);
    }
  }, [API_BASE_URL, authHeaders]);

  // --- FETCH PARTICIPANTS ---
  const fetchParticipants = useCallback(
    async (search = "") => {
      setParticipantsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/bootcamp/participants`, {
          headers: authHeaders,
          params: search ? { search } : {},
        });
        setParticipants(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error("Failed to fetch Bootcamp participants:", err);
        setParticipants([]);
      } finally {
        setParticipantsLoading(false);
      }
    },
    [API_BASE_URL, authHeaders]
  );

  useEffect(() => {
    fetchClasses();
    fetchCbts();
  }, [fetchClasses, fetchCbts]);

  useEffect(() => {
    if (activeSectionTab === "participants") {
      fetchParticipants(participantSearch);
    }
  }, [activeSectionTab, participantSearch, fetchParticipants]);

  const bootcampClassCards = useMemo(() => {
    return BOOTCAMP_TRACKS.map((track) => {
      const matched = matchClassForBootcampTrack(classes, track);
      return {
        track,
        summary: getBootcampCardSummary(matched, track),
      };
    });
  }, [classes]);

  const copyText = (text, key, label = "Link copied!") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    showToast("success", label);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getPublicCbtUrl = (accessToken) => {
    const origin = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
    return `${origin}/bootcamp/cbt/${accessToken}`;
  };

  // --- CBT EDITOR HANDLERS ---
  const openCreateCbt = (defaultTrackKey = "jamb_english") => {
    const track = BOOTCAMP_TRACKS.find((t) => t.key === defaultTrackKey) || BOOTCAMP_TRACKS[0];
    const nextWeekNum =
      cbts.filter((c) => c.subject_track === track.key).length + 1;
    setEditingCbtId(null);
    setCbtForm({
      title: `Week ${nextWeekNum} - ${track.label}`,
      subject_track: track.key,
      week_start_date: getCurrentWeekMondayYMD(),
      duration_minutes: 20,
      starts_at: "",
      expires_at: "",
      is_active: true,
    });
    setCbtQuestions(buildInitialQuestions(20));
    setActiveQuestionIdx(0);
    setEditorOpen(true);
  };

  const openEditCbt = async (cbt) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/bootcamp/cbts/${cbt.id}`, {
        headers: authHeaders,
      });
      const detail = res.data?.data;
      const loadedCbt = detail?.cbt || cbt;
      const loadedQuestions = (detail?.questions || []).map((q) => ({
        id: q.id || null,
        passage_text: q.passage_text || "",
        question_text: q.question_text || "",
        image_url: q.image_url || "",
        options:
          Array.isArray(q.options) && q.options.length > 0
            ? q.options
            : createEmptyQuestion().options,
        correct_option: q.correct_option || "A",
        explanation: q.explanation || "",
      }));

      while (loadedQuestions.length < 20) {
        loadedQuestions.push(createEmptyQuestion());
      }

      setEditingCbtId(cbt.id);
      setCbtForm({
        title: loadedCbt.title || "",
        subject_track: loadedCbt.subject_track || "jamb_english",
        week_start_date: loadedCbt.week_start_date || getCurrentWeekMondayYMD(),
        duration_minutes: loadedCbt.duration_minutes || 20,
        starts_at: toLocalDateTimeInput(loadedCbt.starts_at),
        expires_at: toLocalDateTimeInput(loadedCbt.expires_at),
        is_active: Boolean(loadedCbt.is_active),
      });
      setCbtQuestions(loadedQuestions);
      setActiveQuestionIdx(0);
      setEditorOpen(true);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to load CBT details.");
    }
  };

  const updateQuestion = (idx, patch) => {
    setCbtQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  };

  const updateQuestionOption = (qIdx, optIdx, text) => {
    setCbtQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextOpts = q.options.map((opt, j) =>
          j === optIdx ? { ...opt, text } : opt
        );
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleUploadQuestionImage = async (qIdx, file) => {
    if (!file) return;
    setUploadingImgIdx(qIdx);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(`${API_BASE_URL}/api/admin/bootcamp/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data?.url) {
        updateQuestion(qIdx, { image_url: res.data.url });
        showToast("success", "Image attached to question.");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploadingImgIdx(null);
    }
  };

  const handleSaveCbt = async (e) => {
    e.preventDefault();
    if (!cbtForm.title.trim()) {
      showToast("error", "Please enter a CBT title.");
      return;
    }

    const populatedQuestions = cbtQuestions.filter(
      (q) =>
        q.question_text.trim() !== "" ||
        q.options.some((opt) => opt.text.trim() !== "")
    );

    if (populatedQuestions.length === 0) {
      showToast("error", "Please fill in at least 1 question before saving.");
      return;
    }

    for (let i = 0; i < populatedQuestions.length; i++) {
      const q = populatedQuestions[i];
      if (!q.question_text.trim()) {
        showToast("error", `Question #${i + 1} is missing question text.`);
        return;
      }
      const filledOpts = q.options.filter((o) => o.text.trim() !== "");
      if (filledOpts.length < 2) {
        showToast("error", `Question #${i + 1} needs at least 2 answer options.`);
        return;
      }
    }

    const sanitizedQuestions = populatedQuestions.map((q) => ({
      ...q,
      options: q.options.filter((o) => o.text.trim() !== ""),
    }));

    setSavingCbt(true);
    try {
      const payload = {
        ...cbtForm,
        duration_minutes: Number(cbtForm.duration_minutes) || 20,
        starts_at: toUtcIsoString(cbtForm.starts_at),
        expires_at: toUtcIsoString(cbtForm.expires_at),
        questions: sanitizedQuestions,
      };

      if (editingCbtId) {
        await axios.put(`${API_BASE_URL}/api/admin/bootcamp/cbts/${editingCbtId}`, payload, {
          headers: authHeaders,
        });
        showToast("success", "Bootcamp CBT updated!");
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/bootcamp/cbts`, payload, {
          headers: authHeaders,
        });
        showToast("success", "Bootcamp CBT created! Copy the unlisted link to share.");
      }

      setEditorOpen(false);
      fetchCbts();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save CBT.");
    } finally {
      setSavingCbt(false);
    }
  };

  const handleToggleActive = async (cbt) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/bootcamp/cbts/${cbt.id}/toggle-active`,
        {},
        { headers: authHeaders }
      );
      showToast("success", cbt.is_active ? "CBT link paused." : "CBT link activated.");
      fetchCbts();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not update status.");
    }
  };

  const handleRegenerateToken = async (cbt) => {
    if (!window.confirm("Generate a brand-new unlisted CBT link? The old link will stop working.")) {
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/bootcamp/cbts/${cbt.id}/regenerate-token`,
        {},
        { headers: authHeaders }
      );
      showToast("success", "New unlisted CBT link generated.");
      fetchCbts();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not regenerate link.");
    }
  };

  const handleDeleteCbt = async (cbt) => {
    if (!window.confirm(`Delete "${cbt.title}" and all its attempts?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/bootcamp/cbts/${cbt.id}`, {
        headers: authHeaders,
      });
      showToast("success", "Bootcamp CBT deleted.");
      fetchCbts();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not delete CBT.");
    }
  };

  const handleOpenResults = async (cbt) => {
    setResultsLoading(true);
    setResultsModalCbt({ cbt, attempts: [] });
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/bootcamp/cbts/${cbt.id}`, {
        headers: authHeaders,
      });
      setResultsModalCbt({
        cbt: res.data?.data?.cbt || cbt,
        attempts: res.data?.data?.attempts || [],
      });
    } catch (err) {
      showToast("error", "Failed to load CBT results.");
      setResultsModalCbt(null);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleResetParticipantPin = async (participant) => {
    if (!window.confirm(`Generate a new 4-digit secret PIN for ${participant.full_name} (${participant.phone_raw})?`)) {
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/bootcamp/participants/${participant.id}/reset-pin`,
        {},
        { headers: authHeaders }
      );
      setResetPinResult(res.data?.data);
      showToast("success", `New PIN generated for ${participant.full_name}.`);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to reset PIN.");
    }
  };

  const filteredCbts = useMemo(() => {
    if (activeTrackFilter === "all") return cbts;
    return cbts.filter((c) => c.subject_track === activeTrackFilter);
  }, [cbts, activeTrackFilter]);

  const activeQuestion = cbtQuestions[activeQuestionIdx] || cbtQuestions[0];
  const populatedCount = useMemo(
    () => cbtQuestions.filter((q) => q.question_text.trim() !== "").length,
    [cbtQuestions]
  );

  return (
    <StaffDashboardLayout pagetitle="Bootcamp">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[250] px-5 py-3.5 rounded-2xl shadow-2xl text-white flex items-center gap-2.5 text-sm font-bold ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <Icon
            icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"}
            className="w-5 h-5 shrink-0"
          />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-[1550px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#09314F] via-[#0F2843] to-[#173f66] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[#BB9E7F]/20 text-[#BB9E7F] border border-[#BB9E7F]/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                Bootcamp Operations
              </span>
              <span className="text-xs text-white/70 font-medium">
                Mon–Thu Free Classes & Unlisted Weekly CBTs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bootcamp Command Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              Share the Monday–Thursday Maths & English class links directly from here, publish weekly 20+ question CBTs, and manage participant access PINs.
            </p>
          </div>

          {!isReadOnly && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowClassModal(true)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <Icon icon="lucide:calendar-plus" className="w-4 h-4 text-[#BB9E7F]" />
                Schedule Class
              </button>
              <button
                type="button"
                onClick={() => openCreateCbt()}
                className="px-5 py-3 bg-[#BB9E7F] hover:bg-white text-[#09314F] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
              >
                <Icon icon="lucide:file-plus-2" className="w-4 h-4" />
                Create Weekly CBT
              </button>
            </div>
          )}
        </div>

        {/* ── TOP SECTION: MON-THU LIVE BOOTCAMP CLASSES ─────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-[#09314F] dark:text-white flex items-center gap-2">
                <Icon icon="lucide:video" className="w-5 h-5 text-[#E83831]" />
                Weekly Bootcamp Classes (Monday – Thursday)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Linked directly to your active group Master Classes (private 1-on-1 classes are excluded). Check attendance in Zoom Pro Reports.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchClasses}
              className="self-start sm:self-auto px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Icon icon="lucide:refresh-cw" className={`w-3.5 h-3.5 ${classesLoading ? "animate-spin" : ""}`} />
              Refresh Classes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {bootcampClassCards.map(({ track, summary }) => (
              <div
                key={track.key}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className={`bg-gradient-to-r ${track.accent} p-4 text-white flex items-center justify-between`}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                        {track.day}
                      </span>
                      <h3 className="text-base font-black leading-tight mt-0.5">{track.label}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white/15 text-[10px] font-black uppercase">
                      {track.examTag}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {classesLoading ? (
                      <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ) : summary ? (
                      <>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Class Title
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {summary.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/70 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                          <Icon icon="lucide:user-check" className="w-4 h-4 text-[#09314F] dark:text-[#BB9E7F] shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-gray-400 block leading-none">Tutor</span>
                            <span className="font-extrabold truncate block">{summary.tutorName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Icon icon="lucide:clock" className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-semibold truncate">{summary.scheduleText}</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          No matching class found
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 px-2">
                          Schedule a {track.label} class in Master Classes to populate this slot.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  {summary?.joinLink ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            summary.joinLink,
                            `class-${track.key}`,
                            `${track.label} class link copied!`
                          )
                        }
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          copiedId === `class-${track.key}`
                            ? "bg-emerald-600 text-white"
                            : "bg-[#09314F] hover:bg-[#124b78] text-white"
                        }`}
                      >
                        <Icon
                          icon={copiedId === `class-${track.key}` ? "lucide:check" : "lucide:copy"}
                          className="w-4 h-4"
                        />
                        {copiedId === `class-${track.key}` ? "Copied!" : "Copy Class Link"}
                      </button>
                      <a
                        href={summary.joinLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        title="Open meeting link"
                      >
                        <Icon icon="lucide:external-link" className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-[11px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                      No Zoom/Meet link set yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION TABS: CBTs vs PARTICIPANTS ─────────────────────────────── */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSectionTab("cbts")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeSectionTab === "cbts"
                    ? "bg-[#09314F] text-white shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                }`}
              >
                <Icon icon="lucide:clipboard-list" className="w-4 h-4" />
                Weekly CBTs ({cbts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSectionTab("participants")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeSectionTab === "participants"
                    ? "bg-[#09314F] text-white shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                }`}
              >
                <Icon icon="lucide:users" className="w-4 h-4" />
                Participants & PIN Reset
              </button>
            </div>

            {activeSectionTab === "cbts" && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTrackFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    activeTrackFilter === "all"
                      ? "bg-[#BB9E7F] text-[#09314F]"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  All Subjects
                </button>
                {BOOTCAMP_TRACKS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTrackFilter(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      activeTrackFilter === t.key
                        ? "bg-[#BB9E7F] text-[#09314F]"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {t.shortLabel}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: CBT LIST */}
          {activeSectionTab === "cbts" && (
            <>
              {cbtsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-44 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredCbts.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
                  <Icon icon="lucide:file-question" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-black text-gray-800 dark:text-white">
                    No Bootcamp CBTs Created Yet
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    Create a weekly CBT (default 20 questions, expandable anytime) to get an unlisted public link to share with Bootcamp students.
                  </p>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => openCreateCbt()}
                      className="mt-4 px-5 py-2.5 bg-[#09314F] text-white rounded-xl text-xs font-black uppercase tracking-wider"
                    >
                      Create First CBT
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {filteredCbts.map((cbt) => {
                    const publicUrl = getPublicCbtUrl(cbt.access_token);
                    const trackMeta = BOOTCAMP_TRACKS.find((t) => t.key === cbt.subject_track);

                    return (
                      <div
                        key={cbt.id}
                        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                    trackMeta?.badgeBg || "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {cbt.subject_label}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    cbt.is_open
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                  }`}
                                >
                                  {cbt.is_open ? "Live Link" : "Paused / Closed"}
                                </span>
                                <span className="text-[11px] font-bold text-gray-400">
                                  Week of {cbt.week_start_date}
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-[#09314F] dark:text-white">
                                {cbt.title}
                              </h3>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-[#09314F] dark:text-[#BB9E7F] block">
                                {cbt.questions_count} Qs
                              </span>
                              <span className="text-[11px] font-semibold text-gray-400">
                                {cbt.duration_minutes} mins
                              </span>
                            </div>
                          </div>

                          {/* Stats strip */}
                          <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                                Submissions
                              </span>
                              <span className="font-black text-gray-900 dark:text-white">
                                {cbt.submitted_attempts_count} students
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                                Current #1
                              </span>
                              <span className="font-black text-amber-600 dark:text-amber-400 truncate block">
                                {cbt.top_scorer
                                  ? `${cbt.top_scorer.full_name} (${cbt.top_scorer.score}/${cbt.top_scorer.total_questions})`
                                  : "No submissions yet"}
                              </span>
                            </div>
                          </div>

                          {/* Unlisted Link Box */}
                          <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-black/30 rounded-xl border border-gray-200 dark:border-gray-800">
                            <Icon icon="lucide:lock" className="w-4 h-4 text-[#BB9E7F] shrink-0" />
                            <input
                              type="text"
                              readOnly
                              value={publicUrl}
                              className="bg-transparent text-xs font-mono text-gray-700 dark:text-gray-300 w-full focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                copyText(publicUrl, `cbt-${cbt.id}`, "Unlisted CBT link copied!")
                              }
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase shrink-0 transition-all ${
                                copiedId === `cbt-${cbt.id}`
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#09314F] text-white hover:opacity-90"
                              }`}
                            >
                              {copiedId === `cbt-${cbt.id}` ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <button
                            type="button"
                            onClick={() => handleOpenResults(cbt)}
                            className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-[#09314F] dark:text-blue-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-100"
                          >
                            <Icon icon="lucide:trophy" className="w-4 h-4 text-amber-500" />
                            Results ({cbt.submitted_attempts_count})
                          </button>

                          {!isReadOnly && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => openEditCbt(cbt)}
                                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200"
                              >
                                Edit Questions
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleActive(cbt)}
                                className="px-3 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold"
                              >
                                {cbt.is_active ? "Pause" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRegenerateToken(cbt)}
                                className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:text-[#09314F]"
                                title="Regenerate unlisted link"
                              >
                                <Icon icon="lucide:refresh-ccw" className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCbt(cbt)}
                                className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl hover:bg-rose-100"
                                title="Delete CBT"
                              >
                                <Icon icon="lucide:trash-2" className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PARTICIPANTS & PIN RESET */}
          {activeSectionTab === "participants" && (
            <div className="space-y-4">
              {resetPinResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">
                      New 4-Digit Secret PIN Ready
                    </p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                      {resetPinResult.full_name} ({resetPinResult.phone_raw}) →{" "}
                      <span className="font-mono text-lg font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-black/40 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {resetPinResult.new_pin}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          resetPinResult.new_pin,
                          "reset-pin",
                          "Secret PIN copied to clipboard!"
                        )
                      }
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase"
                    >
                      Copy PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetPinResult(null)}
                      className="px-3 py-2 text-xs font-bold text-gray-500"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Icon
                      icon="lucide:search"
                      className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      placeholder="Search name or phone number..."
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white focus:outline-none"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {participants.length} registered participants
                  </span>
                </div>

                {participantsLoading ? (
                  <div className="p-10 text-center text-xs font-bold text-gray-400">
                    Loading participants...
                  </div>
                ) : participants.length === 0 ? (
                  <div className="p-10 text-center text-xs font-bold text-gray-400">
                    No registered Bootcamp CBT participants yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/60 text-gray-400 uppercase font-black text-[10px] tracking-wider border-b border-gray-100 dark:border-gray-800">
                          <th className="py-3.5 px-5">Student Name</th>
                          <th className="py-3.5 px-5">Phone Number</th>
                          <th className="py-3.5 px-5 text-center">CBTs Taken</th>
                          <th className="py-3.5 px-5 text-center">Total Points</th>
                          {!isReadOnly && <th className="py-3.5 px-5 text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {participants.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                            <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">
                              {p.full_name}
                            </td>
                            <td className="py-3.5 px-5 font-mono text-gray-600 dark:text-gray-300">
                              {p.phone_raw}
                            </td>
                            <td className="py-3.5 px-5 text-center font-bold">
                              {p.completed_cbts_count}
                            </td>
                            <td className="py-3.5 px-5 text-center font-black text-[#09314F] dark:text-[#BB9E7F]">
                              {p.total_points} pts
                            </td>
                            {!isReadOnly && (
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleResetParticipantPin(p)}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg font-extrabold text-[11px]"
                                >
                                  Reset PIN
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── MODAL: CREATE / EDIT CBT + 20+ QUESTIONS ─────────────────────────── */}
      {editorOpen && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <form
            onSubmit={handleSaveCbt}
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl max-h-[92vh] border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-[#09314F] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black">
                  {editingCbtId ? "Edit Bootcamp CBT" : "Create Weekly Bootcamp CBT"}
                </h3>
                <p className="text-xs text-white/75">
                  Default 20 questions — add as many extra questions as needed ({populatedCount} filled).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* CBT Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    CBT Title
                  </label>
                  <input
                    type="text"
                    required
                    value={cbtForm.title}
                    onChange={(e) => setCbtForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Week 1 - JAMB Use of English"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Subject Track
                  </label>
                  <select
                    value={cbtForm.subject_track}
                    onChange={(e) =>
                      setCbtForm((p) => ({ ...p, subject_track: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white"
                  >
                    {BOOTCAMP_TRACKS.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Week Starting (Monday)
                  </label>
                  <input
                    type="date"
                    required
                    value={cbtForm.week_start_date}
                    onChange={(e) =>
                      setCbtForm((p) => ({ ...p, week_start_date: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Timer (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={cbtForm.duration_minutes}
                    onChange={(e) =>
                      setCbtForm((p) => ({ ...p, duration_minutes: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Opens At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cbtForm.starts_at}
                    onChange={(e) => setCbtForm((p) => ({ ...p, starts_at: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cbtForm.expires_at}
                    onChange={(e) => setCbtForm((p) => ({ ...p, expires_at: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2.5 cursor-pointer px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full">
                    <input
                      type="checkbox"
                      checked={cbtForm.is_active}
                      onChange={(e) =>
                        setCbtForm((p) => ({ ...p, is_active: e.target.checked }))
                      }
                      className="rounded text-[#09314F]"
                    />
                    <span className="text-xs font-extrabold text-gray-800 dark:text-white">
                      Link Active Immediately
                    </span>
                  </label>
                </div>
              </div>

              {/* Question Number Navigator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#09314F] dark:text-white">
                    Questions ({cbtQuestions.length} Slots • {populatedCount} Ready)
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCbtQuestions((prev) => [...prev, createEmptyQuestion()]);
                        setActiveQuestionIdx(cbtQuestions.length);
                      }}
                      className="px-3 py-1.5 bg-[#09314F] text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Icon icon="lucide:plus" className="w-3.5 h-3.5" /> Add Question
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCbtQuestions((prev) => [...prev, ...buildInitialQuestions(5)])
                      }
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold"
                    >
                      +5 Slots
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cbtQuestions.map((q, idx) => {
                    const isFilled = q.question_text.trim() !== "";
                    const isCurrent = idx === activeQuestionIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all border ${
                          isCurrent
                            ? "bg-[#09314F] text-white border-[#09314F] scale-105 shadow-md"
                            : isFilled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                            : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question Editor Card */}
              {activeQuestion && (
                <div className="p-5 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#09314F] dark:text-white">
                      Question #{activeQuestionIdx + 1}
                    </span>
                    {cbtQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCbtQuestions((prev) =>
                            prev.filter((_, i) => i !== activeQuestionIdx)
                          );
                          setActiveQuestionIdx((prev) => Math.max(0, prev - 1));
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove Slot
                      </button>
                    )}
                  </div>

                  {/* Quick Math Symbols */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-gray-400 mr-1">
                      Insert Symbol:
                    </span>
                    {MATH_SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() =>
                          updateQuestion(activeQuestionIdx, {
                            question_text: activeQuestion.question_text + sym,
                          })
                        }
                        className="px-2 py-1 text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                      Passage / Instruction (Optional — useful for English)
                    </label>
                    <textarea
                      rows="2"
                      value={activeQuestion.passage_text}
                      onChange={(e) =>
                        updateQuestion(activeQuestionIdx, { passage_text: e.target.value })
                      }
                      placeholder="Optional comprehension passage or instruction..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                      Question Text
                    </label>
                    <textarea
                      rows="3"
                      value={activeQuestion.question_text}
                      onChange={(e) =>
                        updateQuestion(activeQuestionIdx, { question_text: e.target.value })
                      }
                      placeholder="Enter question..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Optional Diagram Image */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5">
                      <Icon icon="lucide:image" className="w-4 h-4 text-[#09314F] dark:text-[#BB9E7F]" />
                      <span>
                        {uploadingImgIdx === activeQuestionIdx ? "Uploading..." : "Attach Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadQuestionImage(activeQuestionIdx, e.target.files?.[0])
                        }
                      />
                    </label>
                    {activeQuestion.image_url && (
                      <div className="flex items-center gap-2">
                        <img
                          src={activeQuestion.image_url}
                          alt="Question diagram"
                          className="h-10 w-10 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuestion(activeQuestionIdx, { image_url: "" })}
                          className="text-xs font-bold text-rose-500"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Options A-D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeQuestion.options.map((opt, optIdx) => {
                      const isCorrect = activeQuestion.correct_option === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                            isCorrect
                              ? "bg-emerald-50/70 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-600"
                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQuestion(activeQuestionIdx, { correct_option: opt.key })
                            }
                            className={`w-8 h-8 rounded-xl text-xs font-black shrink-0 ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                            }`}
                            title="Mark as correct option"
                          >
                            {opt.key}
                          </button>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) =>
                              updateQuestionOption(activeQuestionIdx, optIdx, e.target.value)
                            }
                            placeholder={`Option ${opt.key}...`}
                            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                      Explanation (Optional — shown after student submits)
                    </label>
                    <input
                      type="text"
                      value={activeQuestion.explanation}
                      onChange={(e) =>
                        updateQuestion(activeQuestionIdx, { explanation: e.target.value })
                      }
                      placeholder="Brief solution or explanation..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeQuestionIdx === 0}
                  onClick={() => setActiveQuestionIdx((p) => Math.max(0, p - 1))}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold disabled:opacity-40"
                >
                  Previous Q
                </button>
                <button
                  type="button"
                  disabled={activeQuestionIdx >= cbtQuestions.length - 1}
                  onClick={() =>
                    setActiveQuestionIdx((p) => Math.min(cbtQuestions.length - 1, p + 1))
                  }
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold disabled:opacity-40"
                >
                  Next Q
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCbt}
                  className="px-6 py-2.5 bg-[#09314F] hover:bg-[#124b78] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-60"
                >
                  {savingCbt ? "Saving..." : editingCbtId ? "Save Changes" : "Publish CBT"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: CBT RESULTS & LEADERBOARD ─────────────────────────────────── */}
      {resultsModalCbt && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[85vh] border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 bg-[#09314F] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#BB9E7F]">
                  {resultsModalCbt.cbt?.subject_label}
                </span>
                <h3 className="text-lg font-black">{resultsModalCbt.cbt?.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setResultsModalCbt(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {resultsLoading ? (
                <p className="text-center py-8 text-xs font-bold text-gray-400">
                  Loading leaderboard...
                </p>
              ) : resultsModalCbt.attempts.length === 0 ? (
                <p className="text-center py-8 text-xs font-bold text-gray-400">
                  No completed submissions yet for this CBT.
                </p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 uppercase font-black text-[10px] border-b border-gray-100 dark:border-gray-800">
                      <th className="py-2.5 pr-3">Rank</th>
                      <th className="py-2.5 pr-3">Name</th>
                      <th className="py-2.5 pr-3">Phone</th>
                      <th className="py-2.5 pr-3 text-center">Points</th>
                      <th className="py-2.5 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {resultsModalCbt.attempts.map((a) => (
                      <tr key={a.id}>
                        <td className="py-3 pr-3 font-black">#{a.rank}</td>
                        <td className="py-3 pr-3 font-bold text-gray-900 dark:text-white">
                          {a.full_name}
                        </td>
                        <td className="py-3 pr-3 font-mono text-gray-500">{a.phone}</td>
                        <td className="py-3 pr-3 text-center font-black text-emerald-600">
                          {a.score} / {a.total_questions}
                        </td>
                        <td className="py-3 text-right font-mono text-gray-500">
                          {formatDurationClock(a.time_taken_seconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE MASTER CLASS ─────────────────────────────────────── */}
      {showClassModal && (
        <CreateMasterClassModal
          onClose={() => setShowClassModal(false)}
          onSuccess={() => {
            setShowClassModal(false);
            fetchClasses();
            showToast("success", "Class schedule updated!");
          }}
        />
      )}
    </StaffDashboardLayout>
  );
}
