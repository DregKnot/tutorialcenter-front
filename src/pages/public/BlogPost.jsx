import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import Navbar from "../../components/public/Navbar.jsx";
import Footer from "../../components/public/Footer.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getBlogImageUrl } from "../../utils/imageUrl";

export default function BlogPost() {
  const { slug } = useParams();
  const { user } = useAuth(); // If student is logged in

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  // New Comment Form State
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentToast, setCommentToast] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/blogs/${slug}`);
      const data = res.data?.data || res.data;
      console.log("=== [BLOG ARTICLE FETCH] Fetched single article ===", data);
      setBlog(data);
      setRelated(res.data?.related || []);
      setComments(data?.comments || []);
    } catch (err) {
      console.error("Error loading blog article:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, slug]);

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [fetchArticle]);

  // Submit Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem("token") || localStorage.getItem("student_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        comment: commentText.trim(),
        guest_name: user?.firstname ? `${user.firstname} ${user.surname || ''}` : guestName || "Guest Reader",
        guest_email: user?.email || guestEmail,
      };

      const res = await axios.post(`${API_BASE_URL}/api/blogs/${blog.id}/comments`, payload, { headers });

      setCommentToast({ message: "Thank you! Your comment has been posted.", type: "success" });
      setCommentText("");
      setGuestName("");
      setGuestEmail("");

      if (res.data?.data) {
        setComments((prev) => [res.data.data, ...prev]);
      }
    } catch (err) {
      console.error("Comment submission error:", err);
      setCommentToast({ message: "Failed to post comment. Please try again.", type: "error" });
    } finally {
      setSubmittingComment(false);
      setTimeout(() => setCommentToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#031525] text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full space-y-10">
        
        {/* Toast */}
        {commentToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2">
            <Icon icon="lucide:check-circle" className="w-4 h-4" />
            <span>{commentToast.message}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#E83831] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm font-bold">Loading publication...</p>
          </div>
        ) : !blog ? (
          <div className="py-24 text-center space-y-4 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
            <Icon icon="lucide:alert-circle" className="w-16 h-16 text-gray-400 mx-auto" />
            <h2 className="text-2xl font-black">Article Not Found</h2>
            <p className="text-gray-500 text-sm">The article you are looking for does not exist or has been archived.</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#09314F] text-white rounded-xl font-bold text-xs"
            >
              <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              <span>Return to Blog Directory</span>
            </Link>
          </div>
        ) : (
          <article className="space-y-8">
            
            {/* Breadcrumb & Category */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-400">
              <Link to="/" className="hover:text-[#09314F] dark:hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-[#09314F] dark:hover:text-white transition-colors">Blog</Link>
              <span>/</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#09314F]/10 dark:bg-[#C5A97A]/10 text-[#09314F] dark:text-[#C5A97A] font-black uppercase text-[10px]">
                {blog.category?.name || "General"}
              </span>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09314F] dark:text-white leading-[1.15] tracking-tight">
              {blog.title}
            </h1>

            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#09314F] to-[#E83831] text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {blog.author?.firstname?.[0] || "T"}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {blog.author ? `${blog.author.firstname} ${blog.author.surname || ''}` : "Tutorial Center Editorial"}
                  </h4>
                  <p className="text-[11px] text-gray-400 capitalize">{blog.author?.role || "Staff Writer"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-[#C5A97A]" />
                  {blog.published_at ? new Date(blog.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-[#E83831]" />
                  {blog.reading_time || 2} min read
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-blue-500" />
                  {blog.views || 0} Views
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {blog.featured_image && (
              <div className="rounded-3xl overflow-hidden shadow-xl h-[280px] sm:h-[400px] md:h-[480px] w-full bg-gray-100 dark:bg-gray-800">
                <img
                  src={getBlogImageUrl(blog.featured_image)}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Excerpt Summary */}
            {blog.excerpt && (
              <div className="p-6 rounded-2xl bg-gray-100/70 dark:bg-gray-800/40 border-l-4 border-[#C5A97A] text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 italic leading-relaxed">
                {blog.excerpt}
              </div>
            )}

            {/* Rich Content Body */}
            <div
              className="prose dark:prose-invert prose-lg max-w-full text-gray-800 dark:text-gray-200 leading-relaxed pt-2 break-words overflow-hidden [&_img]:max-w-full [&_img]:rounded-2xl [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_code]:break-all [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:block space-y-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* ── COMMENTS & DISCUSSION SECTION ──────────────────────── */}
            {blog.allow_comments && (
              <section className="pt-10 border-t border-gray-200 dark:border-gray-800 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#09314F] dark:text-white flex items-center gap-2">
                    <Icon icon="lucide:message-square" className="w-5 h-5 text-[#E83831]" />
                    Discussion & Comments ({comments.length})
                  </h3>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="bg-white dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Leave a Reply</h4>

                  {!user && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:border-[#C5A97A]"
                      />
                      <input
                        type="email"
                        placeholder="Your Email (Optional)"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:border-[#C5A97A]"
                      />
                    </div>
                  )}

                  <textarea
                    rows={3}
                    placeholder="Share your thoughts or questions about this article..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A97A] resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-6 py-2.5 bg-[#09314F] dark:bg-[#E83831] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingComment ? (
                        <>
                          <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="lucide:send" className="w-4 h-4" />
                          <span>Post Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Existing Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="p-5 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#09314F] dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-[10px]">
                              {(c.guest_name || "G")[0]}
                            </span>
                            {c.guest_name || "Verified Student"}
                          </span>
                          <span className="text-gray-400 text-[10px]">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 pl-8 leading-relaxed">
                          {c.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    No comments yet. Be the first to start the discussion!
                  </div>
                )}
              </section>
            )}

            {/* ── RELATED ARTICLES ───────────────────────────────────── */}
            {related.length > 0 && (
              <section className="pt-10 border-t border-gray-200 dark:border-gray-800 space-y-6">
                <h3 className="text-xl font-black text-[#09314F] dark:text-white">
                  Related Publications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/blog/${rel.slug}`}
                      className="p-4 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 hover:border-[#C5A97A]/40 transition-all flex flex-col group overflow-hidden"
                    >
                      {rel.featured_image && (
                        <div className="h-28 w-full rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-700">
                          <img
                            src={getBlogImageUrl(rel.featured_image)}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <h5 className="text-xs font-black text-[#09314F] dark:text-white line-clamp-2 mb-2 group-hover:text-[#E83831] transition-colors">
                        {rel.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 font-bold mt-auto">
                        {rel.reading_time || 2} min read
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </article>
        )}

      </main>

      <Footer />
    </div>
  );
}
