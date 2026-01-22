import { useEffect, useMemo, useState } from "react";
import image from "../../assets/images/handshake.png"
import CommunityGrowthLayout from "./CommunityGrowthLayout";

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
                imgPath:
                image,
            },
            {
                title: "Join our growing community",
                semititle: "Attend classes with your pairs",
                desc: "We invite you to enroll in our online Master Class, where you can immerse yourself in advanced learning and gain valuable insights from our tutors.",
                Sdesc: "Be present for your future!",
                btnTitle: "Apply Now",
                btnPath: "/register",
                imgPath:
                image,
            },
        ]

    ), []) 

    const [currentSlide, setCurrentSlide] = useState(0);
    const autoSlideInterval = 4000;

    useEffect(() => {
        
        const interval = setInterval(() => {
            nextSlide();
        }, autoSlideInterval);

        return () => clearInterval(interval);
    }, [currentSlide]);

    // next slide
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slideDatas.length);
    };

    return (
        <div className="w-full max-w-[1300px] overflow-hidden mx-auto">
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
                    />
                ))}
            </div>
        </div>
    );
}
