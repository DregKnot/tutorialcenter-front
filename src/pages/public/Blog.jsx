import React from "react";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import BlogHero from "../../assets/images/Blogs.webp";
import handCup from "../../assets/images/handCup.webp";
import ScrollReveal from "../../components/public/ScrollReveal";

// ── Placeholder blog data (coming soon — replace with real API later) ──
const FEATURED = {
  image: handCup,
  category: "Coming Soon",
  tag: "Update",
  title: "Exciting Updates Are On The Way.",
  excerpt:
    "We are currently working on bringing you insightful articles and updates. Check back soon for our first featured post!",
  author: "Admin",
  date: "Coming Soon",
};

const POSTS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  image: handCup,
  category: "Coming Soon",
  tag: "Blog",
  title: "Article Coming Soon...",
  excerpt:
    "Our blog section is currently under construction. Stay tuned for educational resources, news, and tips.",
  author: "Admin",
  date: "Coming Soon",
}));

// ── Reusable Blog Card ──
const BlogCard = ({ post, featured = false }) => (
  <article
    className={`bg-white/80 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col opacity-50 grayscale pointer-events-none select-none h-full ${
      featured ? "md:flex-row gap-0" : ""
    }`}
  >
    {/* Image */}
    <div
      className={`overflow-hidden flex-shrink-0 relative ${
        featured
          ? "w-full md:w-[42%] h-56 md:h-auto"
          : "w-full h-44"
      }`}
    >
      <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
         <span className="text-white font-black uppercase tracking-widest border-2 border-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">Coming Soon</span>
      </div>
      <img
        src={post.image}
        alt={post.title}
        loading="lazy"
        className="w-full h-full object-cover blur-[2px]"
      />
    </div>

    {/* Content */}
    <div className={`flex flex-col justify-center p-5 ${featured ? "md:p-8 flex-1" : ""}`}>
      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          {post.category}
        </span>
        <span className="text-[11px] font-bold text-[#09314F] bg-[#EBF0F5] px-2 py-0.5 rounded opacity-70">
          {post.tag}
        </span>
      </div>

      {/* Title */}
      <h2
        className={`font-black text-gray-400 leading-tight mb-3 uppercase tracking-tight ${
          featured ? "text-2xl md:text-3xl" : "text-[14px]"
        }`}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      <p
        className={`text-gray-400 leading-relaxed mb-5 ${
          featured ? "text-sm md:text-base" : "text-[12px] line-clamp-3"
        }`}
      >
        {post.excerpt}
      </p>

      {/* Author */}
      <div className="flex items-center gap-2 mt-auto opacity-50">
        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-[10px] font-black flex-shrink-0">
          A
        </div>
        <div>
          <p className="text-[11px] font-black text-gray-400">{post.author}</p>
          <p className="text-[10px] text-gray-300">{post.date}</p>
        </div>
      </div>
    </div>
  </article>
);

const Blog = () => {
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <div className="relative z-30 w-full h-[373px]">
        <img
          src={BlogHero}
          alt="Blog Hero Background"
          loading="eager"
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute w-full h-full bg-black opacity-40" />
        <div className="w-full h-full flex flex-col items-center justify-center relative z-50 gap-2">
          <ScrollReveal direction="up" distance={20}>
            <div className="flex flex-col items-center gap-2">
              <h1 className="uppercase text-white text-3xl md:text-4xl font-black tracking-widest">
                Blog
              </h1>
              <p className="text-white/70 text-sm font-medium tracking-wide">
                Coming soon...
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── GRADIENT WRAPPER (matches Career page pattern) ── */}
      <div className="bg-gradient-to-r from-[#09314F] to-[#E83831]">

        {/* ── FEATURED POST + GRID SECTION ── */}
        <section className="w-full bg-white relative -mb-7 z-50 rounded-b-[40px] overflow-hidden pb-24 font-sans">
          <div className="Container py-14">

            {/* Featured Post */}
            <ScrollReveal delay={0.1} direction="up" distance={30}>
              <div className="mb-10">
                <BlogCard post={FEATURED} featured />
              </div>
            </ScrollReveal>

            {/* Divider */}
            <hr className="border-gray-100 mb-10" />

            {/* Blog Grid — 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {POSTS.map((post, idx) => (
                <ScrollReveal key={post.id} delay={0.05 * (idx % 3)} direction="up" distance={20} className="h-full">
                  <BlogCard post={post} />
                </ScrollReveal>
              ))}
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default Blog;
