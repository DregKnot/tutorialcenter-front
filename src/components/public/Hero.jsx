import { Link } from "react-router-dom";
import logo1 from "../../assets/images/TC 1.png";
import student_image from "../../assets/images/Hero_mobile.png";
import hero_image from "../../assets/images/tutorial_center_split_screen_filled (1).png";
import ScrollReveal from "./ScrollReveal";
// import dotted_box from "../../assets/svg/dots.svg";
// import SignUp from "../../pages/public/SignUp.jsx";

export default function Hero() {
    return (
        <>
            <div className="bg-primary py-2 text-center block max-sm:hidden">
                <p className="text-white text-sm">
                    Click here to join our students in archiving excellence...{" "}
                    <Link to="/register" className="text-ascent font-bold">
                        Apply Now
                    </Link>
                </p>
            </div>

            {/* Hero Section for laptop and above (matches navbar lg breakpoint) */}
            <div className="relative pt-2 pb-10 max-[1023px]:p-0 h-[600px] flex items-center max-lg:hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-600 bg-blend-overlay"
                    style={{ backgroundImage: `url("${hero_image}")` }}
                />
                
                {/* Center Blended Seam Effect */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 bg-gradient-to-r from-transparent via-[#bb9e7f]/40 to-transparent backdrop-blur-[3px] pointer-events-none z-10" />
                
                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-black/30" />

                <div className="Container relative z-10 w-full flex justify-center text-center">
                    <div className="max-w-2xl flex flex-col items-center">
                        <ScrollReveal delay={0.2} direction="up" distance={30}>
                            <h1 className="font-bold text-[40px] mb-3 uppercase text-white">
                                <span className="text-ascent">Ace</span> Your{" "}
                                <span className="text-ascent">Exams</span> , <br /> Secure Your
                                Future!
                            </h1>
                        </ScrollReveal>
                        <ScrollReveal delay={0.4} direction="up" distance={30}>
                            <p className="text-base font-medium leading-7 mb-9 text-white/90">
                                Your Ultimate Guide to{" "}
                                <span className="text-ascent">JAMB, WAEC,</span> <br />{" "}
                                <span className="text-ascent">NECO</span> And{" "}
                                <span className="text-ascent">GCE</span> Success.
                            </p>
                        </ScrollReveal>
                        <ScrollReveal delay={0.6} direction="up" distance={20}>
                            <div className="flex items-center justify-center gap-3 [&_a]:px-10 [&_a]:py-2 [&_a]:rounded-2xl [&_a]:whitespace-nowrap">
                                <Link
                                    to="/training"
                                    className="bg-gradient-to-r from-[#09314F] to-[#E83831] border-[2px] border-solid border-x-[#E83831] border-y-[#09314F] bg-clip-text text-transparent font-bold"
                                >
                                    View Training
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-[#09314F] to-[#E83831] text-white font-bold"
                                >
                                    Apply Now{" "}
                                </Link>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            {/* Hero Section for smaller and large screen */}
            <MobileHero />

            {/* subsidiary */}
            <div className="bg-ascent py-4 px-3">
                <div className="flex items-center justify-center gap-3">
                    <img
                        className="max-w-[75px] max-md:max-w-[50px]"
                        src={logo1}
                        alt="logo"
                    />
                    <p className="text-white font-semibold max-md:text-[12px]">
                        Tutorial Center is subsidiary of Roncloud Technologies
                    </p>
                </div>
            </div>
        </>
    );
}





export const MobileHero = () => {
    return (
        <>
            <div className="max-lg:block hidden w-full">
                <div className=" relative w-full h-[450px]">
                    {/* background image with grey blend */}
                    <div
                        className="w-full h-full bg-cover bg-no-repeat bg-center absolute top-0 left-0 bottom-0 bg-gray-600 bg-blend-overlay"
                        style={{ backgroundImage: `url("${student_image}")` }}
                    />

                    {/* Overlay to ensure text readability */}
                    <div className="bg-black/30 z-10 w-full h-full absolute top-0 left-0 bottom-0" />

                    {/* background content */}
                    <div className="flex-1 absolute top-1/2 -translate-y-1/2 left-0 z-50 px-5">
                        <ScrollReveal delay={0.2} direction="up" distance={30}>
                            <h1 className="font-bold sm:text-[32px] text-2xl text-white  mb-3 uppercase leading-[1.47]">
                                <span className="text-ascent">Ace</span> Your <br />
                                <span className="text-ascent">Exams</span> , Secure <br /> Your
                                Future!
                            </h1>
                        </ScrollReveal>
                        <ScrollReveal delay={0.4} direction="up" distance={30}>
                            <p className="text-sm font-medium leading-7 mb-9 text-white">
                                Your Ultimate Guide to{" "}
                                <span className="text-ascent">JAMB, WAEC,</span> <br />{" "}
                                <span className="text-ascent">NECO</span> And{" "}
                                <span className="text-ascent">GCE</span> Success.
                            </p>
                        </ScrollReveal>
                        <ScrollReveal delay={0.6} direction="up" distance={20}>
                            <div className="[&_a]:px-10 [&_a]:max-sm:px-4 [&_a]:max-[349px]:px-2  [&_a]:py-2 [&_a]:rounded-2xl ">
                                <Link
                                    to="/training"
                                    className="bg-gradient-to-r from-[#09314F] to-[#E83831] border-[2px]  border-solid border-x-[#E83831] border-y-[#09314F] mr-3 bg-clip-text text-transparent "
                                >
                                    View Training
                                </Link>
                                <Link className="bg-gradient-to-r from-[#09314F] to-[#E83831] text-white "
                                    to="/register"
                                >
                                    Apply Now{" "}
                                </Link>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </>
    );
}

