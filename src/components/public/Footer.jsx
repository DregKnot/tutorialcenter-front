import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const Footer = () => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [emailInput, setEmailInput] = useState("");

    const handleSubmit = () => {
        setShowSuccessModal(true);
        setTimeout(() => {
            setEmailInput("");
        }, 100);
    };

    // social links array
    const socialLinks = [
        { path: "https://www.facebook.com/share/17uGJzdYoD/", icon: "mage:facebook" },
        { path: "https://www.tiktok.com/@tutorial_center?_r=1&_t=ZS-97fRYZWF9aC", icon: "ri:tiktok-fill" },
        { path: "https://www.snapchat.com/add/tutorialcentera?share_id=s0fDtHHsg-c&locale=en-US", icon: "ri:snapchat-fill" },
        { path: "", icon: "mingcute:instagram-fill" },
        { path: "https://www.youtube.com/@TutorialCenterAfrica", icon: "line-md:youtube-filled" },
    ];

    return (
        <>
            <footer className="footer py-14- bg-gradient-to-r from-[#09314F] to-[#E83831] text-white">
                <div className="h-12 spacer" />
                <div className="Container">

                    <div className="area-wrapper flex flex-col items-center justify-center text-center">

                        <div className="footer-content mb-9">
                            <div className="sign up mb-6">
                                <h2 className="mb-2 font-semibold lg:text-[28px] leading-[38px] text-sm">
                                    Want product news and updates?{" "}
                                </h2>
                                <p className="text-[12px] lg:text-[18px] text-mainWhite">
                                    Sign up for our newsletter to stay up to date{" "}
                                </p>
                            </div>

                             <div className="form">
                                <form 
                                    action="https://ee6a4a77.sibforms.com/serve/MUIFABoCBsc3mJ6tQrwxP1F3iPLbDVH8lCZ2F4S152Zy0l4f2tXFfUPLMg4dnYsuX0NzAVnq72fwTYncjP4qPcHIwwVshj_i0yCcE2tjCcN6q7UXWi9_Kn06GcmuLElMCb686rNnLGW-GN8KGEynezak3G98AkUyip1-Fp2Az6uRSAeXqM0sNItc15Nxl7xxP1ojhrWkvitHecQyZw==" 
                                    method="POST"
                                    target="brevo_iframe"
                                    onSubmit={handleSubmit}
                                >
                                    <div className="flex flex-col sm:flex-row justify-center gap-5 text-sm">
                                        <input
                                            type="email"
                                            name="EMAIL"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            required
                                            placeholder="Your email address"
                                            className="shadow bg-[#EAEBEC] text-black w-full p-2 rounded-full outline-none"
                                        />
                                        {/* Honeypot field for bot protection */}
                                        <input type="text" name="email_address_check" value="" className="hidden" readOnly />
                                        <input type="hidden" name="locale" value="en" />
                                        <button
                                            type="submit"
                                            className="px-4 text-xs p-2 text-nowrap bg-mainBlue text-mainWhite font-medium rounded-full cursor-pointer hover:opacity-95 transition-opacity"
                                        >
                                            Notify me
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>

                        <div className="socials">
                            <p className="mb-5 text-xs text-left">
                                We care about the protection of your data. Read our{" "}
                                <Link className="underline text-[14px]">Privacy Policy</Link> .{" "}
                            </p>
                            <div className="Social_links flex justify-center items-center gap-3 mb-6">
                                {socialLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.path || "#"}
                                        target={link.path ? "_blank" : undefined}
                                        rel={link.path ? "noopener noreferrer" : undefined}
                                        className="w-9 h-9 flex justify-center items-center rounded-xl bg-white transition-transform hover:scale-110"
                                    >
                                        <Icon
                                            icon={link.icon}
                                            width="24"
                                            height="24"
                                            className="text-ascent"
                                        />
                                    </a>
                                ))}
                            </div>
                            <div className="download_app text-[12px]">
                                <p className="mb-3 ">
                                    Click to download our app. Download Now!
                                </p>
                                <div className="flex flex-row items-center justify-between gap-4">
                                    <Link
                                        to=""
                                        className="w-full flex justify-center items-center gap-2 bg-sencondary py-[6px] rounded-lg"
                                    >
                                        <Icon
                                        icon="ic:twotone-apple"
                                        width="28"
                                        height="28"
                                        style={{ color: "white" }}
                                        />
                                        <span className="text-white  text-[12px]">Apple Store</span>
                                    </Link>
                                    <Link
                                        to=""
                                        className="w-full flex justify-center items-center gap-2 bg-primary py-[6px] rounded-lg"
                                    >
                                        <Icon
                                        icon="mage:playstore"
                                        width="26"
                                        height="26"
                                        style={{ color: "white" }}
                                        />
                                        <span className="text-white text-[12px]">Play Store</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="copyright py-5">
                        <div className="border border-" />
                        <p className="mt-4 text-center text-[12px] sm:text-sm">
                            Copyright © 2025 Tutorial Center | All Rights Reserved
                        </p>
                    </div>
                </div>
            </footer>

            {/* Hidden iframe target for silent form submit */}
            <iframe name="brevo_iframe" title="Hidden Brevo Subscription Frame" style={{ display: "none" }}></iframe>

            {/* Success Notification Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white text-black p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl relative border border-gray-100 flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex justify-center items-center mb-5">
                            <Icon icon="teenyicons:tick-circle-outline" width="36" height="36" className="text-[#E83831]" />
                        </div>
                        <h3 className="text-xl font-black mb-2 text-[#09314F]">Awesome!</h3>
                        <p className="text-sm text-gray-500 font-bold mb-6 leading-relaxed">
                            Thank you for registering for our newsletter!
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-[#09314F] text-white font-black rounded-full hover:bg-[#E83831] transition-colors cursor-pointer text-sm tracking-widest uppercase shadow-md"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Footer;
