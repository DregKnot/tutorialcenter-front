import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const Footer = () => {

    // social links array
    const socialLinks = [
        { path: "", icon: "mage:facebook" },
        { path: "", icon: "ri:twitter-fill" },
        { path: "", icon: "mingcute:instagram-fill" },
        { path: "", icon: "ri:linkedin-fill" },
        { path: "", icon: "line-md:youtube-filled" },
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
                                <form action="" method="post">
                                    <div className="flex flex-col sm:flex-row justify-center gap-5 text-sm">
                                        <input
                                            type="text"
                                            placeholder="Your email address"
                                            className="shadow bg-[#EAEBEC] text-black w-full p-2 rounded-full"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 text-xs p-2 text-nowrap bg-mainBlue text-mainWhite font-medium rounded-full"
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
                                    <Link
                                        key={i}
                                        to={link.path}
                                        className="w-9 h-9 flex justify-center items-center rounded-xl bg-white "
                                    >
                                        <Icon
                                            icon={link.icon}
                                            width="24"
                                            height="24"
                                            className="text-ascent"
                                        />
                                    </Link>
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
        </>
    );
}

export default Footer;
