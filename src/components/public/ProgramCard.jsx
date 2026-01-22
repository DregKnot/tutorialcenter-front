import PenIcon from "../../assets/images/Vector.png";
import BookIcon from "../../assets/images/emojione_books.png";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const ProgramCard = ({subject, title, month, quarter, year, topic1, topic2, topic3, topic4, path, logo}) => {
    return (
        <>
            <div className="md:mr-14 mr-5">
                <div className="max-h-full overflow-hidden shadow-custom-1 rounded-2xl my-2">
                    <div className="w-full h-[180px] py-2 flex justify-center relative bg-[#A9C1D3]">
                        <img src={logo} alt="an image of JAMB" className="h-full" />
                        <div className="absolute -bottom-6 right-4 bg-sencondary w-10 h-10 rounded-full flex items-center justify-center">
                            <img className="max-w-4" src={PenIcon} alt="" />
                        </div>
                    </div>
                    <div className="pb-3 px-5 pt-8">
                        <div className="flex gap-2 mb-5">
                            <img className="max-w-3 object-contain" src={BookIcon} alt="" />
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
                                <ul className="[&_li]:text-nowrap [&_span]:text-ascent [&_span]:font-semibold [&_span]:pl-3 flex flex-col">
                                    <li>
                                        Monthly: <span>₦{month}</span>
                                    </li>
                                    <li>
                                        Quarterly: <span>₦{quarter}</span>
                                    </li>
                                    <li>
                                        Annualy: <span>₦{year}</span>
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