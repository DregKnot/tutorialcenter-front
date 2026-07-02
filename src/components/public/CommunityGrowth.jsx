import { useCallback, useEffect, useMemo, useState } from "react";
import image from "../../assets/images/handshake.png"
import officeImage from "../../assets/images/work_with_us.jpg"
import CommunityGrowthLayout from "./CommunityGrowthLayout.jsx";

export default function CommunityGrowth() {

    // all slider datas
    const slideDatas = useMemo(() => (
        [
            {
                title: "Join our growing community",
                semititle: "Attend classes with your pairs",
                desc: "We invite you to enroll in our online Master Class, where you can immerse yourself in advanced learning and gain valuable insights from our tutors.",
                Sdesc: "Be present for your future!",
                btnTitle: "Apply Now",
                btnPath: "/register",
                imgPath: image,
            },
            {
                title: "Work with us",
                semititle: "Join our team of educators & professionals",
                desc: "We are always looking for passionate tutors, content creators, and administrators to join our mission of empowering Nigerian students.",
                Sdesc: "Grow your career while building the future!",
                btnTitle: "Apply Now",
                btnPath: "/career",
                imgPath: officeImage,
                isAccentTheme: true,
            },
        ]

    ), []) 

    const [currentSlide, setCurrentSlide] = useState(0);
    const autoSlideInterval = 4000;

    // next slide
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slideDatas.length);
    }, [slideDatas.length]);

    useEffect(() => {
        
        const interval = setInterval(() => {
            nextSlide();
        }, autoSlideInterval);

        return () => clearInterval(interval);
    }, [nextSlide, autoSlideInterval]);

    return (
        <div className="w-full overflow-hidden">
            <div
                className="flex w-full transition-transform ease-custom duration-500"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slideDatas.map((item, i) => (
                    <CommunityGrowthLayout
                        key={i}
                        title={item.title}
                        semititle={item.semititle}
                        desc={item.desc}
                        Sdesc={item.Sdesc}
                        btnTitle={item.btnTitle}
                        btnPath={item.btnPath}
                        imgPath={item.imgPath}
                        bgColor={item.isAccentTheme ? "bg-[#e83831]" : "bg-[#09314F]"}
                        overlayGradient={item.isAccentTheme ? "from-[#e83831] via-[#e83831]/40" : "from-[#09314F] via-[#09314F]/40"}
                        btnBgColor={item.isAccentTheme ? "bg-[#09314F]" : "bg-sencondary"}
                        semititleColor={item.isAccentTheme ? "text-[#09314F]" : "text-ascent"}
                        SdescColor={item.isAccentTheme ? "text-[#09314F]" : "text-ascent"}
                    />
                ))}
            </div>
        </div>
    );
}
