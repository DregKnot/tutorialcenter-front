import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function useExamForm() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const navigate = useNavigate();
  const { id: editQuestionId } = useParams();
  const isEditMode = Boolean(editQuestionId);

  // Edit mode tracking
  const [existingGroupId, setExistingGroupId] = useState(null);

  // Form State
  const [examBodyId, setExamBodyId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examYearId, setExamYearId] = useState("");
  
  // Exam Group State
  const [groupType, setGroupType] = useState("none");
  const [groupTitle, setGroupTitle] = useState("");
  const [groupContent, setGroupContent] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);

  // Group Management Additions
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isGroupCreationMode, setIsGroupCreationMode] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");

  // Questions Batch State
  const [questions, setQuestions] = useState([
    {
      tempId: Date.now(),
      questionNumber: "",
      questionText: "",
      questionType: "true_false",
      marks: 1,
      explanation: "",
      status: "active",
      options: [
        { label: "A", option_text: "", is_correct: false, sort_order: 1 },
        { label: "B", option_text: "", is_correct: false, sort_order: 2 },
        { label: "C", option_text: "", is_correct: false, sort_order: 3 },
        { label: "D", option_text: "", is_correct: false, sort_order: 4 },
      ],
      files: [],
      captions: [],
      isExpanded: true,
      isSaved: false
    }
  ]);

  // Data Lists
  const [examBodies, setExamBodies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examYears, setExamYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [messageToast, setMessageToast] = useState(null);

  // Sub-modal visibility
  const [isExamBodyModalOpen, setIsExamBodyModalOpen] = useState(false);
  const [isExamYearModalOpen, setIsExamYearModalOpen] = useState(false);

  // Batch Submission Tracking
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [submissionErrors, setSubmissionErrors] = useState({});
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [batchComplete, setBatchComplete] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState([]);

  // Fetch existing questions for selected examYearId (cannot be edited, just read-only)
  useEffect(() => {
    if (!examYearId) {
      setExistingQuestions([]);
      return;
    }
    const fetchExistingQuestions = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        };
        const res = await axios.get(`${API_BASE_URL}/api/admin/past-questions/all`, config);
        const allQuestions = res.data?.questions?.data || res.data?.data || res.data?.questions || [];
        const filtered = allQuestions.filter(q => String(q.exam_year_id) === String(examYearId));
        
        // Sort by question number
        filtered.sort((a, b) => {
          const numA = parseInt(a.question_number || a.questionNumber, 10) || 0;
          const numB = parseInt(b.question_number || b.questionNumber, 10) || 0;
          return numA - numB;
        });

        setExistingQuestions(filtered);
      } catch (err) {
        console.error("Failed to fetch existing questions:", err);
      }
    };
    fetchExistingQuestions();
  }, [examYearId, API_BASE_URL, token]);

  useEffect(() => {
    if (messageToast) {
      const timer = setTimeout(() => setMessageToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageToast]);

  const fetchGroups = useCallback(async () => {
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        } 
      };
      const res = await axios.get(`${API_BASE_URL}/api/admin/past-question-groups/all`, config);
      console.log("[ExamQuestion] All Past Question Groups Response:", res.data);
      const fetchedGroups = res.data?.groups?.data || res.data?.data || res.data || [];
      setAllGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  }, [API_BASE_URL, token]);

  const fetchInitialData = useCallback(async () => {
    setFetchingData(true);
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        } 
      };
      console.log("[ExamQuestion] Fetching Initial Meta Data (Bodies, Courses, Years)");
      const [bodiesRes, coursesRes, yearsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config),
        axios.get(`${API_BASE_URL}/api/courses`, config),
        axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config)
      ]);

      console.log("[ExamQuestion] Meta Response (Bodies):", bodiesRes.data);
      setExamBodies(bodiesRes.data?.exam_bodies || bodiesRes.data?.data || bodiesRes.data || []);
      setCourses(coursesRes.data?.data || coursesRes.data?.courses || []);
      setExamYears(yearsRes.data?.data || yearsRes.data?.exam_years || yearsRes.data || []);
      setFilteredYears(yearsRes.data?.data || yearsRes.data?.exam_years || yearsRes.data || []);

      // Load saved selections
      const savedBodyId = localStorage.getItem("selected_exam_body_id");
      const savedSubjectId = localStorage.getItem("selected_subject_id");
      const savedYearId = localStorage.getItem("selected_exam_year_id");

      if (savedBodyId) setExamBodyId(savedBodyId);
      if (savedSubjectId) setSubjectId(savedSubjectId);
      if (savedYearId) setExamYearId(savedYearId);

    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setFetchingData(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch groups dynamically when groupType changes
  useEffect(() => {
    if (groupType !== "none") {
      fetchGroups();
    }
  }, [groupType, fetchGroups]);

  const fetchGroupDetails = async (groupId) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        } 
      };
      const res = await axios.get(`${API_BASE_URL}/api/admin/past-question-groups/${groupId}`, config);
      console.log(`[ExamQuestion] Group Details Response for ID ${groupId}:`, res.data);
      const groupData = res.data?.data || res.data;
      
      if (groupData) {
        setGroupTitle(groupData.title || "");
        setGroupContent(groupData.content || "");
        setSortOrder(groupData.sort_order || 1);
        if (groupData.image) {
          setGroupImagePreview(groupData.image.startsWith('http') ? groupData.image : `${API_BASE_URL}/storage/${groupData.image}`);
        } else {
          setGroupImagePreview(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch group details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load existing question data in edit mode
  useEffect(() => {
    if (!isEditMode || !editQuestionId) return;
    const loadQuestion = async () => {
      try {
        const config = { 
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          } 
        };
        console.log("[ExamQuestion] Fetching Question for Edit:", `${API_BASE_URL}/api/admin/past-questions/${editQuestionId}`);
        const res = await axios.get(`${API_BASE_URL}/api/admin/past-questions/${editQuestionId}`, config);
        console.log("[ExamQuestion] Question Data Response:", res.data);
        const q = res.data?.data || res.data;

        const loadedOptions = (q.options && q.options.length > 0) 
          ? q.options.map((opt, i) => ({
              id: opt.id,
              label: opt.label || String.fromCharCode(65 + i),
              option_text: opt.option_text || "",
              is_correct: Boolean(opt.is_correct),
              sort_order: opt.sort_order || i + 1,
            }))
          : [
              { label: "A", option_text: "", is_correct: false, sort_order: 1 },
              { label: "B", option_text: "", is_correct: false, sort_order: 2 },
              { label: "C", option_text: "", is_correct: false, sort_order: 3 },
              { label: "D", option_text: "", is_correct: false, sort_order: 4 },
            ];

        setQuestions([{
          tempId: Date.now(),
          questionNumber: q.question_number || "",
          questionText: q.question || q.question_text || q.text || "",
          questionType: q.question_type || "true_false",
          marks: q.marks || 1,
          explanation: q.explanation || q.explanation_text || "",
          status: q.status || "active",
          options: loadedOptions,
          files: [], 
          captions: [],
          isExpanded: true,
          isSaved: false
        }]);

        setExamYearId(String(q.exam_year_id || ""));
        
        // Load group info
        if (q.past_question_group_id && q.group) {
          setExistingGroupId(q.past_question_group_id);
          setGroupType(q.group.type || "none");
          setGroupTitle(q.group.title || "");
          setGroupContent(q.group.content || "");
          setSortOrder(q.group.sort_order || 1);
          if (q.group.image) setGroupImagePreview(q.group.image);
        }

        // Try to infer exam body from year
        if (q.exam_year?.exam_body_id) {
          setExamBodyId(String(q.exam_year.exam_body_id));
        }
      } catch (err) {
        console.error("Failed to load question:", err);
      }
    };
    loadQuestion();
  }, [isEditMode, editQuestionId, API_BASE_URL, token]);

  // Filter years and subjects when context changes
  useEffect(() => {
    const selectedBody = examBodies.find(b => String(b.id) === String(examBodyId));
    const inferredCourseId = selectedBody?.course_id || "";
    setCourseId(inferredCourseId);

    // Filter Subjects (Fetch from API)
    const fetchSubjects = async () => {
      if (!inferredCourseId) {
        setSubjects([]);
        return;
      }
      try {
        const config = { 
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          } 
        };
        const res = await axios.get(`${API_BASE_URL}/api/courses/${inferredCourseId}/subjects`, config);
        setSubjects(res.data?.data || res.data?.subjects || []);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    };
    fetchSubjects();

    // Filter Years (In-memory)
    let filtered = [...examYears];
    if (examBodyId) {
      filtered = filtered.filter(y => String(y.exam_body_id) === String(examBodyId));
    }
    if (subjectId) {
      filtered = filtered.filter(y => String(y.subject_id) === String(subjectId));
    }
    setFilteredYears(filtered);

  }, [examBodyId, subjectId, examBodies, examYears, API_BASE_URL, token]);

  const handleSubjectChange = (id) => {
    setSubjectId(id);
    if (id) {
      localStorage.setItem("selected_subject_id", id);
    } else {
      localStorage.removeItem("selected_subject_id");
    }
  };

  const handleBodyChange = (id) => {
    setExamBodyId(id);
    if (id) {
      localStorage.setItem("selected_exam_body_id", id);
    } else {
      localStorage.removeItem("selected_exam_body_id");
    }
  };

  const handleYearChange = (id) => {
    setExamYearId(id);
    if (id) {
      localStorage.setItem("selected_exam_year_id", id);
    } else {
      localStorage.removeItem("selected_exam_year_id");
    }
  };

  const handleCreateSuccess = async (type, newData) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    if (type === "exam-body") {
      const res = await axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config);
      const bodies = res.data?.exam_bodies || res.data?.data || res.data || [];
      setExamBodies(bodies);
      setExamBodyId(newData.id);
    } else if (type === "exam-year") {
      const res = await axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config);
      const years = res.data?.data || res.data?.exam_years || res.data || [];
      setExamYears(years);
      setExamYearId(newData.id);
    }
  };

  const handleGroupImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
      setGroupImagePreview(URL.createObjectURL(file));
    }
  };

  // Questions Batch Logic
  const addQuestion = () => {
    const newQuestion = {
      tempId: Date.now(),
      questionNumber: "",
      questionText: "",
      questionType: "true_false",
      marks: 1,
      explanation: "",
      status: "active",
      options: [
        { label: "A", option_text: "", is_correct: false, sort_order: 1 },
        { label: "B", option_text: "", is_correct: false, sort_order: 2 },
        { label: "C", option_text: "", is_correct: false, sort_order: 3 },
        { label: "D", option_text: "", is_correct: false, sort_order: 4 },
      ],
      files: [],
      captions: [],
      isExpanded: true,
      isSaved: false
    };

    setQuestions(prev => prev.map(q => ({ ...q, isExpanded: false })).concat(newQuestion));
  };

  const removeQuestion = (qIdx) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));
  };

  const toggleExpand = (qIdx) => {
    setQuestions(prev => prev.map((q, i) => ({
      ...q,
      isExpanded: i === qIdx ? !q.isExpanded : false
    })));
  };

  const updateQuestionField = (qIdx, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx][field] = value;
    setQuestions(newQuestions);
  };

  const isDuplicateNumber = (qIdx, num) => {
    if (!num) return false;
    return questions.some((q, i) => i !== qIdx && q.questionNumber === num);
  };

  // Option Handlers
  const isScienceSubject = () => {
    const scienceKeywords = ["math", "physic", "chemist", "biolog", "science", "further maths", "geograph", "agric"];
    const currentSubject = subjects.find(s => String(s.id) === String(subjectId));
    const name = (currentSubject?.name || "").toLowerCase();
    return scienceKeywords.some(key => name.includes(key));
  };

  const insertSymbol = (qIdx, optIdx, symbol) => {
    const input = document.getElementById(`option-input-${qIdx}-${optIdx}`);
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = questions[qIdx].options[optIdx].option_text;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + symbol + after;

    handleOptionChange(qIdx, optIdx, "option_text", newText);

    // Reset cursor position after React re-render
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  const handleOptionChange = (qIdx, optIdx, field, value) => {
    const newQuestions = [...questions];
    const q = newQuestions[qIdx];
    const newOptions = [...q.options];

    if (field === "is_correct" && q.questionType === "multiple_choice") {
      newOptions.forEach((opt, i) => opt.is_correct = i === optIdx ? value : false);
    } else {
      newOptions[optIdx][field] = value;
    }

    q.options = newOptions;
    setQuestions(newQuestions);
  };

  const addOption = (qIdx) => {
    const newQuestions = [...questions];
    const q = newQuestions[qIdx];
    const nextLabel = String.fromCharCode(65 + q.options.length);
    q.options = [...q.options, { label: nextLabel, option_text: "", is_correct: false, sort_order: q.options.length + 1 }];
    setQuestions(newQuestions);
  };

  const removeOption = async (qIdx, optIdx) => {
    const q = questions[qIdx];
    if (q.options.length <= 2) return;
    const optToRemove = q.options[optIdx];

    if (isEditMode && optToRemove.id) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_BASE_URL}/api/admin/past-question-options/destroy/${optToRemove.id}`, config);
      } catch (err) {
        console.error("Failed to delete option:", err);
        return;
      }
    }

    const newQuestions = [...questions];
    newQuestions[qIdx].options = q.options.filter((_, i) => i !== optIdx).map((opt, i) => ({
      ...opt,
      sort_order: i + 1
    }));
    setQuestions(newQuestions);
  };

  // File Handlers
  const handleQuestionFilesChange = (qIdx, e) => {
    const files = Array.from(e.target.files);
    const newQuestions = [...questions];
    newQuestions[qIdx].files = [...newQuestions[qIdx].files, ...files];
    newQuestions[qIdx].captions = [...newQuestions[qIdx].captions, ...files.map(() => "")];
    setQuestions(newQuestions);
  };

  const removeFile = (qIdx, fIdx) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].files = newQuestions[qIdx].files.filter((_, i) => i !== fIdx);
    newQuestions[qIdx].captions = newQuestions[qIdx].captions.filter((_, i) => i !== fIdx);
    setQuestions(newQuestions);
  };

  const handleCaptionChange = (qIdx, fIdx, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].captions[fIdx] = value;
    setQuestions(newQuestions);
  };

  // Pre-submission validation
  const validateQuestions = () => {
    const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim() : "";
    const errors = {};
    const unsaved = questions.filter(q => !q.isSaved);

    unsaved.forEach((q, idx) => {
      const qErrors = [];

      // Question number checks
      if (!q.questionNumber) qErrors.push("Question number is required");
      if (q.questionNumber && isDuplicateNumber(questions.indexOf(q), q.questionNumber)) {
        qErrors.push("Duplicate question number");
      }

      // Question text check
      const qText = stripHtml(q.questionText);
      if (!qText) qErrors.push("Question text is required");

      // Question text vs explanation check
      const expText = stripHtml(q.explanation);
      if (qText && expText && qText === expText) {
        qErrors.push("Question and explanation cannot be the same");
      }

      // MCQ option checks
      if (q.questionType === "multiple_choice") {
        const filledOptions = q.options.filter(o => o.option_text.trim());
        if (filledOptions.length < 2) qErrors.push("At least 2 options are required");

        const hasCorrect = q.options.some(o => o.is_correct);
        if (!hasCorrect) qErrors.push("Mark at least one correct answer");

        // Duplicate option text check
        const optTexts = q.options.map(o => o.option_text.trim().toLowerCase()).filter(t => t);
        const uniqueTexts = new Set(optTexts);
        if (optTexts.length !== uniqueTexts.size) qErrors.push("Duplicate option text detected");
      }

      if (qErrors.length > 0) errors[q.tempId] = qErrors;
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation first
    const { isValid, errors } = validateQuestions();
    if (!isValid) {
      setValidationErrors(errors);
      setMessageToast({ type: "error", message: "Please fix the highlighted errors before submitting." });
      return;
    }
    setValidationErrors({});

    setLoading(true);


    const config = {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      }
    };

    // Determine which questions to submit
    const unsavedQuestions = questions.filter(q => !q.isSaved);

    // Initialize submission tracking
    const initialStatus = {};
    unsavedQuestions.forEach(q => { initialStatus[q.tempId] = 'idle'; });
    setSubmissionStatus(initialStatus);
    setSubmissionErrors({});
    setIsBatchSubmitting(true);
    setBatchComplete(false);

    try {
      // 1. Create or Update Group (Shared for the batch)
      let currentGroupId = selectedGroupId || existingGroupId;
      
      if (groupType !== "none") {
        const groupFormData = new FormData();
        groupFormData.append("exam_year_id", examYearId);
        groupFormData.append("type", groupType);
        groupFormData.append("title", groupTitle);
        groupFormData.append("content", groupContent);
        groupFormData.append("sort_order", sortOrder);
        if (groupImage) groupFormData.append("image", groupImage);

        if (!currentGroupId) {
          const groupRes = await axios.post(`${API_BASE_URL}/api/admin/past-question-groups`, groupFormData, config);
          currentGroupId = groupRes.data?.data?.id || groupRes.data?.id;
          setExistingGroupId(currentGroupId);
        } else {
          groupFormData.append("_method", "PUT");
          await axios.post(`${API_BASE_URL}/api/admin/past-question-groups/update/${currentGroupId}`, groupFormData, config);
        }
      }

      // 2. Process Questions one by one
      for (const q of unsavedQuestions) {
        // Mark as submitting
        setSubmissionStatus(prev => ({ ...prev, [q.tempId]: 'submitting' }));

        try {
          const questionFormData = new FormData();
          questionFormData.append("exam_year_id", examYearId);
          if (currentGroupId) questionFormData.append("past_question_group_id", currentGroupId);
          questionFormData.append("question_number", q.questionNumber);
          questionFormData.append("question", q.questionText);
          questionFormData.append("question_type", q.questionType);
          questionFormData.append("marks", q.marks);
          questionFormData.append("explanation", q.explanation);
          questionFormData.append("status", q.status);

          // Options
          q.options.forEach((opt, index) => {
            questionFormData.append(`options[${index}][label]`, opt.label);
            questionFormData.append(`options[${index}][option_text]`, opt.option_text);
            questionFormData.append(`options[${index}][is_correct]`, opt.is_correct ? 1 : 0);
            questionFormData.append(`options[${index}][sort_order]`, opt.sort_order);
          });

          // Files
          q.files.forEach((file, index) => {
            questionFormData.append(`files[${index}]`, file);
            questionFormData.append(`captions[${index}]`, q.captions[index] || "");
          });

          if (isEditMode && editQuestionId) {
            await axios.put(`${API_BASE_URL}/api/admin/past-questions/update/${editQuestionId}`, questionFormData, config);
          } else {
            await axios.post(`${API_BASE_URL}/api/admin/past-questions`, questionFormData, config);
          }

          // Success
          setSubmissionStatus(prev => ({ ...prev, [q.tempId]: 'success' }));
          setQuestions(prev => prev.map(item => item.tempId === q.tempId ? { ...item, isSaved: true } : item));

        } catch (questionErr) {
          // Categorize the error
          const statusCode = questionErr.response?.status;
          let errorMsg = 'Recheck your content';
          if (statusCode === 500 || !questionErr.response) {
            errorMsg = 'Network issue';
          }
          setSubmissionStatus(prev => ({ ...prev, [q.tempId]: 'failed' }));
          setSubmissionErrors(prev => ({ ...prev, [q.tempId]: errorMsg }));
          console.error(`[ExamQuestion] Failed Q${q.questionNumber}:`, questionErr);
          // Continue to next question (don't stop)
        }
      }

    } catch (err) {
      // Group creation/update failed — mark all as failed
      console.error("Group operation failed:", err);
      const statusCode = err.response?.status;
      let errorMsg = statusCode === 500 || !err.response ? 'Network issue' : 'Recheck your content';
      unsavedQuestions.forEach(q => {
        setSubmissionStatus(prev => ({ ...prev, [q.tempId]: 'failed' }));
        setSubmissionErrors(prev => ({ ...prev, [q.tempId]: errorMsg }));
      });
    } finally {
      setLoading(false);
      setBatchComplete(true);
    }
  };

  // Retry only failed questions
  const retryFailed = async () => {
    const failedQuestions = questions.filter(q => submissionStatus[q.tempId] === 'failed');
    if (failedQuestions.length === 0) return;

    setLoading(true);
    setBatchComplete(false);


    const config = {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      }
    };

    const currentGroupId = selectedGroupId || existingGroupId;

    for (const q of failedQuestions) {
      setSubmissionStatus(prev => ({ ...prev, [q.tempId]: 'submitting' }));
      setSubmissionErrors(prev => { const n = { ...prev }; delete n[q.tempId]; return n; });

      try {
        const questionFormData = new FormData();
        questionFormData.append("exam_year_id", examYearId);
        if (currentGroupId) questionFormData.append("past_question_group_id", currentGroupId);
        questionFormData.append("question_number", q.questionNumber);
        questionFormData.append("question", q.questionText);
        questionFormData.append("question_type", q.questionType);
        questionFormData.append("marks", q.marks);
        questionFormData.append("explanation", q.explanation);
        questionFormData.append("status", q.status);

        q.options.forEach((opt, index) => {
          questionFormData.append(`options[${index}][label]`, opt.label);
          questionFormData.append(`options[${index}][option_text]`, opt.option_text);
          questionFormData.append(`options[${index}][is_correct]`, opt.is_correct ? 1 : 0);
          questionFormData.append(`options[${index}][sort_order]`, opt.sort_order);
        });

        q.files.forEach((file, index) => {
          questionFormData.append(`files[${index}]`, file);
          questionFormData.append(`captions[${index}]`, q.captions[index] || "");
        });

        await axios.post(`${API_BASE_URL}/api/admin/past-questions`, questionFormData, config);
        setSubmissionStatus(prev => ({ ...prev, [q.tempId]: 'success' }));
        setQuestions(prev => prev.map(item => item.tempId === q.tempId ? { ...item, isSaved: true } : item));

      } catch (questionErr) {
        const statusCode = questionErr.response?.status;
        let errorMsg = statusCode === 500 || !questionErr.response ? 'Network issue' : 'Recheck your content';
        setSubmissionStatus(prev => ({ ...prev, [q.tempId]: 'failed' }));
        setSubmissionErrors(prev => ({ ...prev, [q.tempId]: errorMsg }));
      }
    }

    setLoading(false);
    setBatchComplete(true);
  };

  // Close the overlay and clean up
  const closeBatchOverlay = () => {
    setIsBatchSubmitting(false);
    setBatchComplete(false);
    setSubmissionStatus({});
    setSubmissionErrors({});

    // Reset to one blank question if all were saved
    if (!isEditMode) {
      setQuestions(prev => {
        const stillUnsaved = prev.filter(q => !q.isSaved);
        if (stillUnsaved.length === 0) {
          return [{
            tempId: Date.now(),
            questionNumber: "",
            questionText: "",
            questionType: "true_false",
            marks: 1,
            explanation: "",
            status: "active",
            options: [
              { label: "A", option_text: "", is_correct: false, sort_order: 1 },
              { label: "B", option_text: "", is_correct: false, sort_order: 2 },
              { label: "C", option_text: "", is_correct: false, sort_order: 3 },
              { label: "D", option_text: "", is_correct: false, sort_order: 4 },
            ],
            files: [],
            captions: [],
            isExpanded: true,
            isSaved: false
          }];
        }
        return stillUnsaved;
      });
    }
  };

  // Delete question (edit mode only)
  const handleDeleteQuestion = async () => {
    if (!isEditMode || !editQuestionId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this question? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.delete(`${API_BASE_URL}/api/admin/past-questions/destroy/${editQuestionId}`, config);
      const msg = res.data?.message || "Question deleted successfully!";
      setMessageToast({ type: "success", message: msg });
      setTimeout(() => navigate("/staffs/manage-exams"), 1500);
    } catch (err) {
      console.error("Failed to delete question:", err);
      const msg = err.response?.data?.message || "Failed to delete question.";
      setMessageToast({ type: "error", message: msg });
    } finally {
      setDeleting(false);
    }
  };

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasUnsaved = questions.some(q => !q.isSaved && (q.questionText || q.questionNumber));
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [questions]);

  return {
    examBodyId, setExamBodyId,
    courseId, setCourseId,
    subjectId, setSubjectId,
    examYearId, setExamYearId,
    groupType, setGroupType,
    groupTitle, setGroupTitle,
    groupContent, setGroupContent,
    groupImage, setGroupImage,
    groupImagePreview, setGroupImagePreview,
    sortOrder, setSortOrder,
    allGroups, setAllGroups,
    selectedGroupId, setSelectedGroupId,
    isGroupCreationMode, setIsGroupCreationMode,
    groupSearchTerm, setGroupSearchTerm,
    questions, setQuestions,
    examBodies, setExamBodies,
    courses, setCourses,
    subjects, setSubjects,
    examYears, setExamYears,
    filteredYears, setFilteredYears,
    loading, setLoading,
    fetchingData, setFetchingData,
    messageToast, setMessageToast,
    isExamBodyModalOpen, setIsExamBodyModalOpen,
    isExamYearModalOpen, setIsExamYearModalOpen,
    isEditMode,
    navigate,
    handleSubjectChange,
    handleBodyChange,
    handleYearChange,
    handleCreateSuccess,
    handleGroupImageChange,
    addQuestion,
    removeQuestion,
    toggleExpand,
    updateQuestionField,
    isDuplicateNumber,
    isScienceSubject,
    insertSymbol,
    handleOptionChange,
    addOption,
    removeOption,
    handleQuestionFilesChange,
    removeFile,
    handleCaptionChange,
    handleSubmit,
    fetchGroupDetails,
    // Batch submission overlay
    submissionStatus,
    submissionErrors,
    isBatchSubmitting,
    batchComplete,
    validationErrors,
    retryFailed,
    closeBatchOverlay,
    // Delete question (edit mode)
    handleDeleteQuestion,
    deleting,
    editQuestionId,
    existingQuestions,
    setExistingQuestions
  };
}
