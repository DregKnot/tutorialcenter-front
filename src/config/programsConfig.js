import waecBanner from "../assets/images/waec_banner.jpg";
import necoBanner from "../assets/images/neco_banner.jpg";
import gceBanner from "../assets/images/gce_banner.jpg";
import jambBanner from "../assets/images/jamb_banner.jpg";
import waecLogo from "../assets/images/waec_logo.webp";
import jambLogo from "../assets/images/jamb_logo.webp";

/**
 * Static registry of examination programs.
 * All O-Level programs (WAEC, NECO, GCE) map under the hood to Course ID 4 (O'Levels)
 * for pricing and subject curriculum, but display dedicated marketing copy and local banners.
 */
export const OLEVEL_COURSE_ID = 4;
export const JAMB_COURSE_ID = 1;

export const PROGRAMS_CONFIG = {
  jamb: {
    slug: "jamb",
    key: "JAMB",
    title: "JAMB",
    backendCourseId: JAMB_COURSE_ID,
    banner: jambBanner,
    logo: jambLogo,
    badge: "Joint Admissions and Matriculation Board",
    description:
      "Prepare confidently for the Unified Tertiary Matriculation Examination (UTME) with Tutorial Center's comprehensive JAMB Preparation Course. Designed specifically for university, polytechnic, and college of education aspirants, our platform offers rigorous CBT simulation, full syllabus coverage across Arts, Sciences, and Commercial disciplines, thousands of past questions with detailed step-by-step solutions, live masterclasses, and precision speed & accuracy drills to help you maximize your UTME score and gain admission into your dream institution.",
    features: [
      "Official UTME-Standard Computer-Based Test (CBT) Practice",
      "Full Syllabus Coverage across 4 Selected Subjects",
      "Extensive JAMB Past Questions & Detailed Solutions",
      "Performance Analytics, Speed & Accuracy Progress Tracking",
      "Weekly Online Live Masterclasses with Top Tutors",
      "Comprehensive Study Notes & Quick-Revision Summaries",
      "Proven Exam Strategies & Time Management Coaching",
      "Accessible Anytime on Mobile, Tablet & Desktop Devices",
    ],
    whyChoose: [
      "Realistic CBT simulations that mirror the official JAMB exam interface.",
      "Comprehensive syllabus coverage aligned with current JAMB requirements.",
      "Clear, step-by-step explanations to master tricky and high-yield questions.",
      "Personalized tracking to eliminate weak spots and boost speed.",
      "Expert educators dedicated to helping you achieve 300+ in UTME.",
    ],
    closingStatement:
      "Securing a competitive score in JAMB UTME is the key to unlocking your chosen course and university admission. Tutorial Center gives you the tools, confidence, and structured learning needed to achieve academic excellence. Start your JAMB preparation today with Tutorial Center.",
  },
  waec: {
    slug: "waec",
    key: "WAEC",
    title: "WAEC",
    backendCourseId: OLEVEL_COURSE_ID,
    banner: waecBanner,
    logo: waecLogo,
    badge: "West African Senior School Certificate Examination",
    description:
      "Prepare with confidence for the West African Senior School Certificate Examination (WASSCE) using Tutorial Center's comprehensive WAEC Preparation Course. Our technology-driven learning platform is designed to help students excel in all WAEC subjects through structured lessons, realistic CBT practice, past questions with detailed solutions, performance tracking, and interactive online live masterclasses. Whether you are preparing as a school candidate or a private candidate, our course provides the resources, guidance, and practice needed to improve your understanding, strengthen weak areas, and maximize your chances of earning excellent grades. Our intelligent learning system tracks your progress, identifies areas that need improvement, and helps you build confidence before your examination.",
    features: [
      "WAEC Past Questions & Detailed Solutions",
      "Computer-Based Test (CBT) Practice",
      "Subject-by-Subject Revision",
      "Performance Analytics & Progress Tracking",
      "Online Live Masterclasses",
      "Study Notes & Revision Materials",
      "Expert Examination Tips",
      "Accessible Anytime, Anywhere",
    ],
    whyChoose: [
      "Comprehensive preparation aligned with the current WAEC syllabus.",
      "Realistic exam simulations to improve speed and confidence.",
      "Detailed explanations to enhance understanding.",
      "Flexible online learning that fits your schedule.",
      "Expert tutors dedicated to helping you succeed.",
    ],
    closingStatement:
      "Whether your goal is to gain admission into a university, polytechnic, or college of education, Tutorial Center equips you with the knowledge, skills, and confidence to excel in the WAEC examination. Start preparing today and take the next step toward academic success with Tutorial Center.",
  },
  neco: {
    slug: "neco",
    key: "NECO",
    title: "NECO",
    backendCourseId: OLEVEL_COURSE_ID,
    banner: necoBanner,
    logo: waecLogo,
    badge: "National Examinations Council (SSCE)",
    description:
      "Prepare effectively for the National Examinations Council (NECO) Senior Secondary Certificate Examination (SSCE) with Tutorial Center's comprehensive NECO Preparation Course. Our technology-driven learning platform is designed to help students achieve outstanding results through structured lessons, realistic CBT practice, past questions with detailed solutions, performance tracking, and interactive online live masterclasses. Whether you are writing the NECO Internal (School Candidate) or NECO External (Private Candidate) examination, our course provides everything you need to build confidence, strengthen your understanding of key subjects, and perform at your best. With Tutorial Center's intelligent learning system, you can monitor your progress, identify areas that require improvement, and prepare using resources aligned with the latest NECO syllabus.",
    features: [
      "NECO Past Questions & Detailed Solutions",
      "Computer-Based Test (CBT) Practice",
      "Subject-by-Subject Revision",
      "Performance Analytics & Progress Tracking",
      "Online Live Masterclasses",
      "Study Notes & Revision Materials",
      "Expert Examination Tips",
      "Learn Anytime, Anywhere",
    ],
    whyChoose: [
      "Comprehensive preparation based on the current NECO syllabus.",
      "Realistic exam simulations to improve speed, accuracy, and confidence.",
      "Detailed explanations that promote better understanding.",
      "Flexible online learning accessible on mobile, tablet, and desktop devices.",
      "Experienced tutors committed to helping you achieve academic excellence.",
    ],
    closingStatement:
      "Whether your goal is to gain admission into a university, polytechnic, college of education, or advance your academic journey, Tutorial Center provides the tools, guidance, and support you need to succeed in the NECO examination. Start your NECO preparation today and take a confident step toward academic success with Tutorial Center.",
  },
  gce: {
    slug: "gce",
    key: "GCE",
    title: "GCE",
    backendCourseId: OLEVEL_COURSE_ID,
    banner: gceBanner,
    logo: waecLogo,
    badge: "General Certificate Examination",
    description:
      "Prepare confidently for the General Certificate Examination (GCE) with Tutorial Center's comprehensive GCE Preparation Course. Whether you are sitting for the WAEC GCE (First or Second Series) or seeking to improve your previous results, our technology-driven learning platform provides everything you need to succeed. Our course combines realistic Computer-Based Test (CBT) practice, carefully selected past questions with detailed explanations, performance tracking, online live masterclasses, and expert study resources to help you build confidence and achieve excellent grades. Designed for private candidates and individuals seeking a second opportunity to further their education, Tutorial Center offers flexible learning that allows you to study anytime, anywhere, and at your own pace.",
    features: [
      "WAEC GCE Past Questions & Detailed Solutions",
      "Computer-Based Test (CBT) Practice",
      "Subject-by-Subject Revision",
      "Performance Analytics & Progress Tracking",
      "Online Live Masterclasses",
      "Comprehensive Study Notes & Revision Materials",
      "Expert Examination Tips and Strategies",
      "Accessible on Mobile, Tablet, and Desktop Devices",
    ],
    whyChoose: [
      "Comprehensive preparation aligned with the latest WAEC GCE syllabus.",
      "Realistic CBT simulations that mirror the actual examination experience.",
      "Detailed explanations to improve understanding and retention.",
      "Flexible online learning tailored to your schedule.",
      "Expert tutors committed to helping you achieve academic excellence.",
      "Continuous performance monitoring to identify strengths and areas for improvement.",
    ],
    closingStatement:
      "Whether your goal is to improve your O'Level results for university admission, meet admission requirements, or enhance your academic qualifications, Tutorial Center provides the tools, guidance, and support you need to excel in the GCE examination. Start your GCE preparation today and take the next step toward achieving your academic goals with Tutorial Center.",
  },
};

/**
 * Resolves static configuration for a given slug or title.
 */
export const getProgramConfig = (slugOrTitle) => {
  if (!slugOrTitle) return null;
  const normalized = String(slugOrTitle).toLowerCase().replace(/['\s-]+/g, "");
  if (normalized.includes("jamb") || normalized.includes("utme")) return PROGRAMS_CONFIG.jamb;
  if (normalized.includes("waec") || normalized.includes("wassce")) return PROGRAMS_CONFIG.waec;
  if (normalized.includes("neco") || normalized.includes("ssce")) return PROGRAMS_CONFIG.neco;
  if (normalized.includes("gce") || normalized.includes("olevel")) return PROGRAMS_CONFIG.gce;
  return null;
};
