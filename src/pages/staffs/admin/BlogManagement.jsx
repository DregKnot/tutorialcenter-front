import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { getBlogImageUrl } from "../../../utils/imageUrl";

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "editor" | "preview"
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Editor Form State
  const [formData, setFormData] = useState({
    title: "",
    category_name: "Academic Tips",
    excerpt: "",
    content: "",
    status: "draft",
    is_featured: false,
    allow_comments: true,
    meta_keywords: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const token = localStorage.getItem("staff_token");
  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }),
    [token]
  );

  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch blogs & categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [blogsRes, catsRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/blogs?per_page=100&staff_preview=1`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/api/blogs/categories`, { headers: authHeaders }),
      ]);

      if (blogsRes.status === "fulfilled") {
        const raw = blogsRes.value.data;
        const bList = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        console.log("=== [BLOG FETCH] Fetched blogs list from backend ===", bList);
        setBlogs(bList);
      }

      if (catsRes.status === "fulfilled") {
        const rawCats = catsRes.value.data;
        const cList = Array.isArray(rawCats)
          ? rawCats
          : Array.isArray(rawCats?.data)
          ? rawCats.data
          : [];
        console.log("=== [BLOG CATEGORIES FETCH] Fetched categories ===", cList);
        setCategories(cList);
      }
    } catch (err) {
      console.error("Error fetching blog data:", err);
      showToast("Failed to load blog archives.", "error");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, authHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to compress / optimize uploaded image to lightweight WebP
  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file || file.type === "image/svg+xml" || file.type === "image/gif" || file.size < 350 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const maxWidth = 1600;
          const maxHeight = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimized = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                  type: "image/webp",
                  lastModified: Date.now(),
                });
                resolve(optimized);
              } else {
                resolve(file);
              }
            },
            "image/webp",
            0.85
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Allowed image MIME types and extensions
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"];

  // Handle Image Selection
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = "." + (file.name.split(".").pop() || "").toLowerCase();
    const isAllowed = ALLOWED_IMAGE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isAllowed) {
      showToast("Invalid format. Only JPG, PNG, WEBP, and SVG images are accepted.", "error");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Image size must be less than 10MB.", "error");
      e.target.value = "";
      return;
    }

    const optimized = await compressImage(file);
    setImageFile(optimized);
    setImagePreview(URL.createObjectURL(optimized));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      category_name: "Academic Tips",
      excerpt: "",
      content: "",
      status: "draft",
      is_featured: false,
      allow_comments: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingBlogId(null);
  };

  // Open Edit Mode
  const handleEdit = (blog) => {
    console.log("=== [BLOG EDIT] Editing blog ===", blog);
    setEditingBlogId(blog.id);
    setFormData({
      title: blog.title || "",
      category_name: blog.category?.name || "General",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      status: blog.status || "draft",
      is_featured: Boolean(blog.is_featured),
      allow_comments: blog.allow_comments !== undefined ? Boolean(blog.allow_comments) : true,
      meta_keywords: blog.meta_keywords || "",
    });
    setImagePreview(getBlogImageUrl(blog.featured_image) || null);
    setImageFile(null);
    setActiveTab("editor");
  };

  // Delete Blog
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/staffs/blogs/${id}`, { headers: authHeaders });
      showToast("Blog post deleted successfully.");
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Error deleting blog:", err);
      showToast("Failed to delete blog post.", "error");
    }
  };

  // Save / Publish Blog
  const handleSave = async (targetStatus) => {
    if (!formData.title.trim()) {
      showToast("Please enter a blog post title.", "error");
      return;
    }
    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      showToast("Please write some content for the article.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const postStatus = targetStatus || formData.status;

      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("category_name", formData.category_name.trim());
      payload.append("content", formData.content);
      payload.append("excerpt", formData.excerpt.trim());
      payload.append("status", postStatus);
      payload.append("is_featured", formData.is_featured ? "1" : "0");
      payload.append("allow_comments", formData.allow_comments ? "1" : "0");
      payload.append("meta_keywords", formData.meta_keywords.trim());

      if (imageFile) {
        payload.append("featured_image", imageFile);
      }

      if (editingBlogId) {
        await axios.post(`${API_BASE_URL}/api/staffs/blogs/${editingBlogId}`, payload, {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        });
        showToast("Blog post updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/staffs/blogs`, payload, {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        });
        showToast("Blog post created successfully!");
      }

      resetForm();
      setActiveTab("all");
      fetchData();
    } catch (err) {
      console.error("Error saving blog post:", err);
      const errors = err.response?.data?.errors;
      let msg = err.response?.data?.message || "Failed to save blog post.";
      if (errors && typeof errors === "object") {
        const firstKey = Object.keys(errors)[0];
        if (firstKey && Array.isArray(errors[firstKey]) && errors[firstKey][0]) {
          msg = errors[firstKey][0];
        }
      }
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Blogs
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === "all" || b.status === selectedStatusFilter;
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      b.category?.name === selectedCategoryFilter ||
      b.category?.slug === selectedCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Quill Allowed Formats Suite
  const quillFormats = [
    "header", "font", "size",
    "bold", "italic", "underline", "strike", "blockquote", "code-block",
    "list", "bullet", "indent",
    "script",
    "direction", "align",
    "link", "image", "video",
    "color", "background"
  ];

  // Quill Toolbar & Rich Clipboard Paste Config
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <StaffDashboardLayout pagetitle="Blogs & Editorial Studio" hideHeader={false}>
      <div className="max-w-[1400px] mx-auto space-y-6 select-none">

        {/* ── Toast Notification ────────────────────────────────────────── */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-in slide-in-from-bottom-4 duration-300 ${
              toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            <Icon icon={toast.type === "error" ? "lucide:alert-circle" : "lucide:check-circle-2"} className="w-5 h-5" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* ── Top Header Navigation ────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#1a4a75] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider">
                Publishing Studio
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#09314F] dark:text-white tracking-tight">
              Blog & Vlog Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Draft, design, and publish rich articles and video updates to students and public readers.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/60 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab("all");
                resetForm();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-white dark:bg-[#09314F] text-[#09314F] dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              <Icon icon="lucide:layout-grid" className="w-4 h-4" />
              <span>All Articles ({blogs.length})</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("editor");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "editor" || activeTab === "preview"
                  ? "bg-gradient-to-r from-[#E83831] to-[#FF574D] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              <Icon icon="lucide:pen-tool" className="w-4 h-4" />
              <span>{editingBlogId ? "Edit Article" : "+ Create Post"}</span>
            </button>
          </div>
        </div>

        {/* ── VIEW 1: ALL POSTS DIRECTORY ──────────────────────────────── */}
        {activeTab === "all" && (
          <div className="space-y-6">
            
            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-[#09314F]/40 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-[#1a4a75]">
              {/* Search Box */}
              <div className="relative">
                <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles by title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#06243A] rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A97A]"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#06243A] rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A97A]"
                >
                  <option value="all">All Statuses (Draft & Published)</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#06243A] rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A97A]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.blogs_count || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Articles Grid */}
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading articles...</div>
            ) : filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBlogs.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Featured Image */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {b.featured_image ? (
                        <img
                          src={getBlogImageUrl(b.featured_image)}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <Icon icon="lucide:image" className="w-10 h-10 mb-1 opacity-50" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">No Featured Image</span>
                        </div>
                      )}

                      {/* Status Tag */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                            b.status === "published"
                              ? "bg-emerald-500/90 text-white"
                              : "bg-gray-800/80 text-gray-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#09314F]/80 backdrop-blur-md text-[#C5A97A] text-[10px] font-black uppercase tracking-wider border border-white/10">
                          {b.category?.name || "General"}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-base font-black text-[#09314F] dark:text-white line-clamp-2 mb-2 group-hover:text-[#E83831] transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-medium mb-3 flex-1">
                        {b.excerpt || "No summary excerpt provided."}
                      </p>

                      {/* Meta Keywords / Tags */}
                      {b.meta_keywords && (
                        <div className="flex flex-wrap gap-1 mb-3 h-[18px] overflow-hidden">
                          {b.meta_keywords.split(',').slice(0, 3).map((tag, idx) => {
                            const trimmed = tag.trim();
                            if (!trimmed) return null;
                            return (
                              <span key={idx} className="px-1.5 py-0.5 rounded-md bg-[#09314F]/10 dark:bg-[#09314F]/85 text-[#09314F] dark:text-[#C5A97A] text-[8px] font-black uppercase tracking-wider max-w-[70px] truncate">
                                #{trimmed}
                              </span>
                            );
                          })}
                          {b.meta_keywords.split(',').length > 3 && (
                            <span className="text-[9px] text-gray-400 font-bold self-center">...</span>
                          )}
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-t border-gray-100 dark:border-gray-800/60 pt-3 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-blue-500" />
                          <span>{b.views || 0} Views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-amber-500" />
                          <span>{b.reading_time || 2} min read</span>
                        </div>
                        <div>
                          {b.published_at ? new Date(b.published_at).toLocaleDateString() : "Draft"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(b)}
                          className="py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <a
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors text-center"
                        >
                          <Icon icon="lucide:external-link" className="w-3.5 h-3.5" />
                          <span>Live</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <Icon icon="lucide:file-text" className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">No Articles Found</h3>
                <p className="text-xs text-gray-400 mt-1 mb-5">Click below to start drafting your first blog or vlog article.</p>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("editor");
                  }}
                  className="px-6 py-2.5 bg-[#09314F] dark:bg-[#E83831] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg"
                >
                  + Write Article Now
                </button>
              </div>
            )}

          </div>
        )}

        {/* ── VIEW 2: WYSIWYG EDITOR STUDIO ────────────────────────────── */}
        {(activeTab === "editor" || activeTab === "preview") && (
          <div className="space-y-6">
            
            {/* Top Toolbar Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-[#09314F]/40 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-[#1a4a75]">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#09314F] dark:hover:text-white transition-colors"
              >
                <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                <span>Back to All Articles</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "preview" ? "editor" : "preview")}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon icon={activeTab === "preview" ? "lucide:edit-3" : "lucide:eye"} className="w-4 h-4" />
                  <span>{activeTab === "preview" ? "Back to Editor" : "Live Reader Preview"}</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSave("draft")}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSave("published")}
                  className="px-6 py-2 bg-gradient-to-r from-[#E83831] to-[#FF574D] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:send" className="w-4 h-4" />
                      <span>Publish Live</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* If Preview Tab is active, render simulated reader view */}
            {activeTab === "preview" ? (
              <div className="bg-white dark:bg-[#06243A] rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl max-w-4xl w-full mx-auto space-y-6 overflow-hidden break-words">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E83831]">
                  <span className="uppercase tracking-widest">{formData.category_name || "Category"}</span>
                  <span>•</span>
                  <span className="text-gray-400">Live Article Preview</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#09314F] dark:text-white leading-tight break-words">
                  {formData.title || "Untitled Article"}
                </h1>

                {formData.excerpt && (
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 italic border-l-4 border-[#C5A97A] pl-4 break-words">
                    {formData.excerpt}
                  </p>
                )}

                {imagePreview && (
                  <div className="rounded-2xl overflow-hidden h-[240px] sm:h-[360px] w-full">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Rendered HTML */}
                <div 
                  className="prose dark:prose-invert max-w-full text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base pt-4 break-words overflow-hidden [&_p]:mb-4 [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:h-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_code]:break-all [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:block"
                  dangerouslySetInnerHTML={{ __html: formData.content || "<p>No content written yet.</p>" }}
                />

                {/* Tags (Meta Keywords) */}
                {formData.meta_keywords && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
                        <Icon icon="lucide:tags" className="w-3 h-3" /> Tags:
                      </span>
                      {formData.meta_keywords.split(',').map((tag, index) => {
                        const trimmed = tag.trim();
                        if (!trimmed) return null;
                        return (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 rounded-md bg-[#09314F]/10 dark:bg-[#09314F]/85 text-[#09314F] dark:text-[#C5A97A] text-[9px] font-black uppercase tracking-wider"
                          >
                            #{trimmed}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Two-Column Studio Layout */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Article Editor (Left 2 cols) */}
                <div className="lg:col-span-2 space-y-5 bg-white dark:bg-[#09314F]/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm">
                  {/* Article Title */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Proven Strategies to Score 300+ in JAMB UTME..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#06243A] rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-[#09314F] dark:text-white focus:outline-none focus:border-[#C5A97A]"
                    />
                  </div>

                  {/* Summary / Excerpt */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Short Excerpt (Displayed on Cards & Social Previews)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief 1-2 sentence overview of this article..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#06243A] rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#C5A97A] resize-none"
                    />
                  </div>

                  {/* Tags / Keywords */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                      <span>Tags & Keywords</span>
                      <span className="text-[10px] text-gray-400 font-normal">Comma separated (e.g. jamb, math, study)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. jamb, utme, study tips, mathematics"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#06243A] rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#C5A97A]"
                    />
                  </div>

                  {/* Rich Text Editor */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                      <span>Article Content (Rich Text & Media) *</span>
                      <span className="text-[10px] text-gray-400 font-normal">Supports Headings, Images, Links, Lists</span>
                    </label>

                    <div className="bg-white dark:bg-[#06243A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner">
                      <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write your article here, or paste rich text from Word / Google Docs..."
                        className="h-80 md:h-96 pb-12 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Publishing Options Sidebar (Right 1 col) */}
                <div className="space-y-5">
                  
                  {/* Featured Image Uploader */}
                  <div className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#09314F] dark:text-white flex items-center gap-2">
                        <Icon icon="lucide:image" className="w-4 h-4 text-[#C5A97A]" />
                        Featured Image
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400">Max 10MB</span>
                    </div>

                    <div className="relative rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 h-44 overflow-hidden flex flex-col items-center justify-center text-center p-4 hover:border-[#C5A97A] transition-colors group">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Featured" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg text-xs shadow hover:bg-red-700 transition-colors"
                          >
                            <Icon icon="lucide:x" className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Icon icon="lucide:upload-cloud" className="w-9 h-9 text-gray-400 mx-auto group-hover:scale-110 transition-transform text-[#09314F] dark:text-[#C5A97A]" />
                          <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Click to upload thumbnail</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Drag & drop or browse from device</p>
                          </div>
                          {/* Format badges */}
                          <div className="flex items-center justify-center gap-1 pt-1">
                            {["JPG", "PNG", "WEBP", "SVG"].map((fmt) => (
                              <span key={fmt} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[9px] font-black">
                                {fmt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Accepted formats: <strong className="text-gray-600 dark:text-gray-300">JPG, PNG, WEBP, SVG</strong> only.
                    </p>
                  </div>

                  {/* Category & Metadata */}
                  <div className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#09314F] dark:text-white flex items-center gap-2">
                      <Icon icon="lucide:tag" className="w-4 h-4 text-[#C5A97A]" />
                      Category & Topic
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Academic Tips, Exam Updates, Motivation"
                        value={formData.category_name}
                        onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#06243A] rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#09314F] dark:text-white focus:outline-none focus:border-[#C5A97A]"
                      />
                    </div>

                    {/* Quick Category Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Academic Tips", "JAMB & UTME", "WAEC & NECO", "Success Stories", "Study Guides"].map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setFormData({ ...formData, category_name: cat })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            formData.category_name === cat
                              ? "bg-[#09314F] text-[#C5A97A]"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Publishing Status & Toggles */}
                  <div className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#09314F] dark:text-white flex items-center gap-2">
                      <Icon icon="lucide:settings-2" className="w-4 h-4 text-[#C5A97A]" />
                      Publishing Settings
                    </h3>

                    {/* Status radio */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Publish Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "draft" })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                            formData.status === "draft"
                              ? "bg-gray-800 text-white border-gray-800"
                              : "bg-gray-50 dark:bg-[#06243A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "published" })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                            formData.status === "published"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-gray-50 dark:bg-[#06243A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          Published
                        </button>
                      </div>
                    </div>

                    {/* Featured toggle */}
                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Featured Article</p>
                        <p className="text-[10px] text-gray-400">Pin to home & header spotlight</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded text-[#E83831] focus:ring-[#E83831]"
                      />
                    </label>

                    {/* Comments toggle */}
                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Allow Reader Comments</p>
                        <p className="text-[10px] text-gray-400">Enable student & guest discussion</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.allow_comments}
                        onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                        className="w-4 h-4 rounded text-[#E83831] focus:ring-[#E83831]"
                      />
                    </label>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </StaffDashboardLayout>
  );
}
