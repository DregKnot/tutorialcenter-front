import PenIcon from "../../assets/images/Vector.webp";
import BookIcon from "../../assets/images/emojione_books.webp";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const ProgramCard = ({ subject, title, month, quarter, semiAnnual, year, slashedMonth, slashedQuarter, slashedSemiAnnual, slashedYear, topic1, topic2, topic3, topic4, path, logo, state }) => {
    return (
        <>
            <div className="md:mr-14 mr-5">
                <div className="
                    max-h-full overflow-hidden my-2 bg-white
                    rounded-[24px]
                    border border-gray-100
                    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                    hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
                    transition-all duration-500
                ">
                    <div className="
                        w-full h-[180px]
                        flex justify-center items-center
                        relative overflow-hidden
                        bg-[#FFF0F0]
                    ">
                        <img
                            loading="lazy"
                            src={logo || "/fallback-banner.png"}
                            alt={title}
                            className="
                                w-full h-full object-cover
                                transition-transform duration-300 ease-in-out
                                hover:scale-105
                            "/>
                        <div className="absolute -bottom-6 right-4 bg-sencondary w-10 h-10 rounded-full flex items-center justify-center">
                            <img loading="lazy" className="max-w-4" src={PenIcon} alt="" />
                        </div>
                    </div>
                    <div className="pb-3 px-5 pt-8">
                        <div className="flex gap-2 mb-5">
                            <img loading="lazy" className="max-w-3 object-contain" src={BookIcon} alt="" />
                            <span className="text-sm font-medium text-ascent">{subject}</span>
                        </div>
                        <h2 className="text-base font-semibold mb-4 text-primary">
                            {title}
                        </h2>
                        <div className="flex gap-3 [&_li]:md:text-sm [&_li]:text-[12px] [&_li]:pb-3 mb-6 ">
                            <div className="duration">
                                <p className="text-ascent md:text-lg text-base font-semibold mb-4">
                                    Duration:
                                </p>
                                <ul className="[&_li]:text-nowrap [&_span]:text-ascent [&_span]:font-semibold [&_span]:pl-2 flex flex-col">
                                    <li>
                                        Monthly: {slashedMonth && <span className="line-through text-gray-400 font-normal text-xs !pl-1">₦{Number(slashedMonth).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}<span>₦{Number(month).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </li>
                                    <li>
                                        Quarterly: {slashedQuarter && <span className="line-through text-gray-400 font-normal text-xs !pl-1">₦{Number(slashedQuarter).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}<span>₦{Number(quarter).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </li>
                                    <li>
                                        Semi-Annually: {slashedSemiAnnual && <span className="line-through text-gray-400 font-normal text-xs !pl-1">₦{Number(slashedSemiAnnual).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}<span>₦{Number(semiAnnual).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </li>
                                    <li>
                                        Annualy: {slashedYear && <span className="line-through text-gray-400 font-normal text-xs !pl-1">₦{Number(slashedYear).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}<span>₦{Number(year).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="includes">
                                <p className="md:text-lg text-base text-ascent font-semibold mb-3">
                                    Includes:
                                </p>
                                <ul className="border-l-2 border-sencondary pl-2">
                                    <li>
                                        <span className="ellipsis">{topic1}</span>
                                    </li>
                                    <li>
                                        <span className="ellipsis">{topic2}</span>
                                    </li>
                                    <li>
                                        <span className="ellipsis">{topic3}</span>
                                    </li>
                                    <li className="!pb-0">
                                        <span className="ellipsis">{topic4}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <Link
                            to={path}
                            state={state}
                            className="flex justify-end gap-1 text-sencondary font-semibold text-sm"
                        >
                            <span>Learn More</span>{" "}
                            <Icon
                                icon="lets-icons:arrow-right-light"
                                width="20"
                                height="20"
                                className=""
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProgramCard;