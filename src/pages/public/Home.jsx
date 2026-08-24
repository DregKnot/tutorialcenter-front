import React, { Suspense, lazy, memo } from 'react';
import Navbar from "../../components/public/Navbar";
import Hero from "../../components/public/Hero";
import ViewportDefer from "../../components/common/ViewportDefer";
import { Helmet } from "react-helmet-async";
import SectionSkeleton from "../../components/common/SectionSkeleton";

// Lazy-loaded and Memoized below-the-fold components
const CountdownSection = memo(lazy(() => import("../../components/public/CountdownSection")));
const BenefitSection = memo(lazy(() => import("../../components/public/BenefitSection")));
const LearningSection = memo(lazy(() => import("../../components/public/LearningSection")));
const CommunityGrowth = memo(lazy(() => import("../../components/public/CommunityGrowth")));
const ProgramSection = memo(lazy(() => import("../../components/public/ProgramSection")));
const FaqSection = memo(lazy(() => import("../../components/public/FaqSection")));
const BlogSection = memo(lazy(() => import("../../components/public/BlogSection")));
const ContactSection = memo(lazy(() => import("../../components/public/ContactSection")));
const Footer = memo(lazy(() => import("../../components/public/Footer")));

const Home = memo(() => {
    return (
        <>
            <Helmet>
                <title>Tutorial Center | Digital Tutorial Center, Exam preparation platform for O'levels and JAMB</title>
                <meta name="description" content="Tutorial Center is the leading digital tutorial center offering comprehensive online lessons for O-levels, JAMB, WAEC, NECO, GCE, and more. Join our online tutoring center to achieve academic excellence across Africa." />
                <meta property="og:title" content="Tutorial Center | Digital Tutorial Center for O'levels and JAMB" />
                <meta property="og:description" content="Tutorial Center is the leading digital tutorial center offering comprehensive online lessons for O-levels, JAMB, WAEC, NECO, GCE, and more. Join our online tutoring center to achieve academic excellence across Africa." />
                <meta property="og:image" content="https://www.tutorialcenter.africa/TC%201.png" />
                <meta property="og:url" content="https://www.tutorialcenter.africa/" />
            </Helmet>
            <Navbar />
            <Hero />
            
            <Suspense fallback={<SectionSkeleton />}>
                <CountdownSection />
                
                <ViewportDefer fallback={<SectionSkeleton />} minHeight="300px" rootMargin="350px">
                    <BenefitSection />
                </ViewportDefer>

                <ViewportDefer fallback={<SectionSkeleton />} minHeight="350px" rootMargin="350px">
                    <LearningSection />
                </ViewportDefer>

                <ViewportDefer fallback={<SectionSkeleton />} minHeight="300px" rootMargin="350px">
                    <CommunityGrowth />
                </ViewportDefer>

                <ViewportDefer fallback={<SectionSkeleton />} minHeight="400px" rootMargin="350px">
                    <ProgramSection />
                </ViewportDefer>

                <ViewportDefer fallback={<SectionSkeleton />} minHeight="350px" rootMargin="350px">
                    <BlogSection />
                </ViewportDefer>

                <ViewportDefer fallback={<SectionSkeleton />} minHeight="300px" rootMargin="350px">
                    <FaqSection />
                </ViewportDefer>

                <ViewportDefer fallback={<SectionSkeleton />} minHeight="300px" rootMargin="350px">
                    <ContactSection />
                </ViewportDefer>

                <ViewportDefer fallback={<div className="h-[200px] w-full animate-pulse bg-gray-100 dark:bg-gray-800" />} minHeight="200px" rootMargin="200px">
                    <Footer />
                </ViewportDefer>
            </Suspense>
        </>
    );
});
 
export default Home;