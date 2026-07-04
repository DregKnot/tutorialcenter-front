import SectionHeading from "./SectionHeading.jsx";
import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";

const ContactSection = ({ showTitle = true }) => {

    return (
        <>
            <div className="relative w-full h-full top-7 z-50 rounded-b-[40px] bg-white">
                {showTitle && (
                    <div>
                        <SectionHeading
                            title={"contact us"}
                            position_right={true}
                            fullWidth={true}
                        />
                        <div className="h-4 md:h-7" />
                    </div>
                )}
                <div className="w-full">
                    <div className="Container !overflow-visible">
                        <div className="area-wrapper ">
                            <div className="flex max-md:flex-col">

                                <div className="flex-1 py-2 md:py-4 md:pr-7">
                                    <div className="content mb-4 md:mb-8">
                                        <ScrollReveal delay={0.1} direction="up" distance={20}>
                                            <h2 className="text-primary header-title !text-2xl md:!text-[2rem] mb-1 md:mb-2 !leading-tight">
                                                Get in touch
                                            </h2>
                                        </ScrollReveal>
                                        <ScrollReveal delay={0.2} direction="up" distance={20}>
                                            <p className="text-xs md:text-sm leading-snug md:leading-[28px]">
                                                Use our contact form for all information request or contact
                                                us directly using the contact information below. All
                                                information is treated with complete confidentiality and In
                                                accordance with our data protection statement.
                                            </p>
                                        </ScrollReveal>
                                    </div>

                                    <ScrollReveal delay={0.3} direction="up" distance={20}>
                                        <div className="contact-details">
                                            <p className="text-sm font-semibold">
                                                feel free to reach out to us via email or on phone
                                            </p>
                                            <div className="flex sm:flex-row flex-col gap-3 sm:gap-6 mt-3">
                                                <Link
                                                    to="mailto:[EMAIL_ADDRESS]"
                                                    className="text-sencondary font-semibold text-sm"
                                                >
                                                    info@tutorialcenter.gmail
                                                </Link>
                                                <Link
                                                    to=""
                                                    className="text-sencondary font-semibold text-sm"
                                                >
                                                    08029606405
                                                </Link>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                </div>

                                <div className="flex-1 py-2 md:py-4 sm:pl-7 [&_input]:w-full [&_input]:shadow [&_input]:border [&_input]:border-[#94A3B8] [&_input]:rounded-lg [&_input]:p-2 ">
                                    <ScrollReveal delay={0.4} direction="up" distance={30}>
                                        {/* form input */}
                                        <form action="" method="post">
                                            <div className="flex max-[466px]:flex-col gap-4 mb-4">
                                                <input type="text" placeholder="First Name" aria-label="input your firstname" />
                                                <input type="text" placeholder="Last Name" aria-label="input your lastname" />
                                            </div>
                                            <input type="text" placeholder="Email" aria-label="input your email" />
                                            <div className="mt-4">
                                                <textarea
                                                    placeholder="Message"
                                                    rows={3}
                                                    className="shadow w-full rounded-lg p-2 border border-[#94A3B8]"
                                                />
                                            </div>
                                            <div className="flex justify-end mt-5">
                                                <button className="btn-title">Submit</button>
                                            </div>
                                        </form>
                                    </ScrollReveal>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ContactSection;