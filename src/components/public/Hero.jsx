import { Link } from "react-router-dom";
import logo1 from "../../assets/images/TC 1.png";
import student_image from "../../assets/images/Hero_mobile.png";
import hero_image from "../../assets/images/Hero.png";
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
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${hero_image})` }}
                />
                
                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-transparent" />

                <div className="Container relative z-10 w-full">
                    <div className="max-w-2xl">
                        <h1 className="font-bold text-[40px] mb-3 uppercase">
                            <span className="text-ascent">Ace</span> Your{" "}
                            <span className="text-ascent">Exams</span> , <br /> Secure Your
                            Future!
                        </h1>
                        <p className="text-base font-medium leading-7 mb-9">
                            Your Ultimate Guide to{" "}
                            <span className="text-ascent">JAMB, WAEC,</span> <br />{" "}
                            <span className="text-ascent">NECO</span> And{" "}
                            <span className="text-ascent">GCE</span> Success.
                        </p>
                        <div className="flex items-center gap-3 [&_a]:px-10 [&_a]:py-2 [&_a]:rounded-2xl [&_a]:whitespace-nowrap">
                            <Link
                                to="/training"
                                className="bg-gradient-to-r from-[#09314F] to-[#E83831] border-[2px] border-solid border-x-[#E83831] border-y-[#09314F] bg-clip-text text-transparent"
                            >
                                View Training
                            </Link>
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-[#09314F] to-[#E83831] text-white"
                            >
                                Apply Now{" "}
                            </Link>
                        </div>
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
                    {/* background color cover */}
                    <div className="bg-[rgba(0,0,0,0.288)] z-10 w-full h-full absolute top-0 left-0 bottom-0" />

                    {/* background image */}
                    <div
                        className="w-full h-full bg-cover bg-no-repeat bg-center absolute top-0 left-0 bottom-0"
                        style={{ backgroundImage: `url(${student_image})` }}
                    />

                    {/* background content */}
                    <div className="flex-1 absolute top-8 left-0 z-50 px-7">
                        <h1 className="font-bold sm:text-[32px] text-2xl text-white  mb-3 uppercase leading-[1.47]">
                            <span className="text-ascent">Ace</span> Your <br />
                            <span className="text-ascent">Exams</span> , Secure <br /> Your
                            Future!
                        </h1>
                        <p className="text-sm font-medium leading-7 mb-9 text-white">
                            Your Ultimate Guide to{" "}
                            <span className="text-ascent">JAMB, WAEC,</span> <br />{" "}
                            <span className="text-ascent">NECO</span> And{" "}
                            <span className="text-ascent">GCE</span> Success.
                        </p>
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
                    </div>
                </div>
            </div>
        </>
    );
}

