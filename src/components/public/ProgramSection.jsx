import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ProgramCard from "./ProgramCard.jsx";
import SectionHeading from "./SectionHeading.jsx";
import ScrollReveal from "./ScrollReveal";
import { PROGRAMS_CONFIG, OLEVEL_COURSE_ID } from "../../config/programsConfig";
import jambBanner from "../../assets/images/jamb_banner.jpg";
import waecBanner from "../../assets/images/waec_banner.jpg";
import necoBanner from "../../assets/images/neco_banner.jpg";
import gceBanner from "../../assets/images/gce_banner.jpg";

const ProgramSection = () => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(2);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Adjusts number of visible cards based on screen width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSlidesToShow(1);
            } else {
                setSlidesToShow(2);
            }
        };

        handleResize();

        // Listen for window resize events
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

    const { data: rawCourses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE_URL}/api/courses`);
            return res?.data?.courses || [];
        },
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    });

    const olevelCourse = rawCourses.find(c => Number(c.id) === OLEVEL_COURSE_ID || c.title?.toLowerCase().includes("level") || c.title?.toLowerCase().includes("gce")) 
        || rawCourses.find(c => Number(c.id) === 2 || c.title?.toLowerCase().includes("waec"))
        || rawCourses[0];
    const jambCourse = rawCourses.find(c => Number(c.id) === 1 || c.title?.toLowerCase().includes("jamb") || c.title?.toLowerCase().includes("utme"))
        || rawCourses[0];

    const olevelBasePrice = Number(olevelCourse?.price) || 8000;
    const jambBasePrice = Number(jambCourse?.price) || 5000;

    const programDatas = [
        {
            id: "jamb",
            title: "JAMB",
            slug: "jamb",
            banner: PROGRAMS_CONFIG.jamb?.banner || jambBanner,
            subject: "4 Subjects",
            basePrice: jambBasePrice,
            courseObj: jambCourse,
            path: "/program/jamb",
        },
        {
            id: "waec",
            title: "WAEC",
            slug: "waec",
            banner: PROGRAMS_CONFIG.waec?.banner || waecBanner,
            subject: "8-9 Subjects",
            basePrice: olevelBasePrice,
            courseObj: olevelCourse,
            path: "/program/waec",
        },
        {
            id: "neco",
            title: "NECO",
            slug: "neco",
            banner: PROGRAMS_CONFIG.neco?.banner || necoBanner,
            subject: "8-9 Subjects",
            basePrice: olevelBasePrice,
            courseObj: olevelCourse,
            path: "/program/neco",
        },
        {
            id: "gce",
            title: "GCE",
            slug: "gce",
            banner: PROGRAMS_CONFIG.gce?.banner || gceBanner,
            subject: "8-9 Subjects",
            basePrice: olevelBasePrice,
            courseObj: olevelCourse,
            path: "/program/gce",
        },
    ];

    //next slide function
    const nextSlide = useCallback(() => {
        if (isTransitioning || programDatas.length === 0) return;

        const maxIndex = Math.max(0, programDatas.length - slidesToShow);

        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));

        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning, programDatas.length, slidesToShow]);

    //previous slide function
    const prevSlide = () => {
        if (isTransitioning || programDatas.length === 0) return;

        const maxIndex = Math.max(0, programDatas.length - slidesToShow);

        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

        setTimeout(() => setIsTransitioning(false), 500);
    };

    // Auto slide every 3 seconds
    useEffect(() => {

        // runs nextSlide repeatedly
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(interval);
    }, [nextSlide]);

    // Calculate transform value for sliding effect
    const getTransformValue = () => {
        const cardWidth = 100 / slidesToShow;
        return `translateX(-${currentIndex * cardWidth}%)`;
    };

    return (
        <div id="programs">
            <SectionHeading title={"Our program"} position_right={false} fullWidth={true} />
            <div className="relative w-full">
                <div className="programs Container !overflow-visible">
                    <div className="py-10">
                        <div className="mb-9">
                            <ScrollReveal delay={0.2} direction="up" distance={20}>
                                <p className="text-sm leading-6">
                                    At Tutorial Center, we understand the challenges faced by Nigerian
                                    students preparing for critical exams like JAMB, WAEC, NECO, and
                                    GCE. That's why we've built a platform that not only addresses
                                    these challenges but empowers you to achieve your academic goals
                                    with confidence and ease
                                </p>
                            </ScrollReveal>
                        </div>

                        <ScrollReveal delay={0.4} direction="up" distance={30}>
                            <div className="relative">

                                {/* Slider Container */}
                            <div className="overflow-hidden">
                                {/* Main sliding container with all cards */}
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: getTransformValue() }}
                                >
                                    {programDatas.map((item, index) => {

                                        const basePrice = item.basePrice;
                                        
                                        // Actual Normal Prices (from backend)
                                        const monthly = basePrice;
                                        const quarterly = Math.round(basePrice * 3 * 0.95);
                                        const semiAnnually = Math.round(basePrice * 6 * 0.95);
                                        const annually = Math.round(basePrice * 12 * 0.95);

                                        // Expensive Slashed Prices (calculated from 40,000)
                                        const slashedMonthly = 40000;
                                        const slashedQuarterly = 40000 * 3;
                                        const slashedSemiAnnually = 40000 * 6;
                                        const slashedAnnually = 40000 * 12;

                                        return (
                                            <div
                                                key={item.id || index}
                                                className="flex-shrink-0"
                                                style={{ width: `${100 / slidesToShow}%` }}
                                            >
                                                <ProgramCard
                                                    subject={item.subject}
                                                    title={item.title}
                                                    logo={item.banner}
                                                    month={monthly}
                                                    quarter={quarterly}
                                                    semiAnnual={semiAnnually}
                                                    year={annually}
                                                    slashedMonth={slashedMonthly}
                                                    slashedQuarter={slashedQuarterly}
                                                    slashedSemiAnnual={slashedSemiAnnually}
                                                    slashedYear={slashedAnnually}
                                                    topic1="Comprehensive tutorials"
                                                    topic2="Weekly masterclasses"
                                                    topic3="Mock tests and practice questions"
                                                    topic4="Live Q&A sessions with experts"
                                                    path={item.path}
                                                    state={{ course: item.courseObj }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <button
                                onClick={prevSlide}
                                className="group absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-transparent rounded-lg p-2 hover:bg-primary shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-500 z-10 border border-gray-200 backdrop-blur-sm"
                                aria-label="Previous slide"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary group-hover:text-white transition-all duration-500">
                                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <button
                                onClick={nextSlide}
                                className="group absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-transparent rounded-lg p-2 hover:bg-primary shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-500 z-10 border border-gray-200 backdrop-blur-sm"
                                aria-label="Next slide"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary group-hover:text-white transition-all duration-500">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex justify-center gap-2 mt-6">
                                {programDatas.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (!isTransitioning) {
                                                setIsTransitioning(true);
                                                setCurrentIndex(index);
                                                setTimeout(() => setIsTransitioning(false), 500);
                                            }
                                        }}
                                        className={`h-2 rounded-full transition-all ${currentIndex === index
                                            ? 'w-8 bg-primary'
                                            : 'w-2 bg-gray-300'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProgramSection;