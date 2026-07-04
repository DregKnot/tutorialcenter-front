import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ProgramCard from "./ProgramCard.jsx";
import SectionHeading from "./SectionHeading.jsx";
import ScrollReveal from "./ScrollReveal";
// import jamb from "../../assets/images/jamb_logo.png";
// import waec from "../../assets/images/waec_logo.png";

const ProgramSection = () => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(2);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [programDatas, setProgramDatas] = useState([]);

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

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/courses`);

                console.log("API RESPONSE:", res.data);

                const fetched = res?.data?.courses || [];
                setProgramDatas(fetched);
            } catch (err) {
                console.error("Failed to fetch programs:", err);
            }
        };

        fetchPrograms();
    }, [API_BASE_URL]);



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

                                        const basePrice = item.price || 0;

                                        const monthly = basePrice;
                                        const quarterly = Math.round(basePrice * 3 * 0.95);
                                        const annually = Math.round(basePrice * 12 * 0.95);

                                        const bannerUrl = item.banner
                                            ? `${API_BASE_URL}/storage/${item.banner}`
                                            : null;

                                        return (
                                            <div
                                                key={index}
                                                className="flex-shrink-0"
                                                style={{ width: `${100 / slidesToShow}%` }}
                                            >
                                                <ProgramCard
                                                    subject={item.title?.toLowerCase().includes("jamb") ? "4 Subjects" : "8-9 Subjects"}
                                                    title={item.title}
                                                    logo={bannerUrl}
                                                    month={monthly}
                                                    quarter={quarterly}
                                                    year={annually}
                                                    topic1="Comprehensive tutorials"
                                                    topic2="Weekly masterclasses"
                                                    topic3="Mock tests and practice questions"
                                                    topic4="Live Q&A sessions with experts"
                                                    path="/training"
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