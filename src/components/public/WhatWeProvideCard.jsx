import vector from "../../assets/images/Vector.webp";
import ScrollReveal from "./ScrollReveal";

const WhatWeProvideCard = ({ item }) => {
    return (
        <ScrollReveal direction="up" distance={30} className="h-full">
            <div
                className="column1 flex flex-col justify-center items-center text-center px-3 py-4 gap-3 bg-[#E336290D] shadow-xl rounded-2xl h-full"
            >
                <div className="">
                    <div className="w-[50px] h-[50px] flex justify-center items-center bg-sencondary rounded-full">
                        <img src={vector} alt="" width={24} height={24} loading="lazy" />
                    </div>
                </div>
                <div className="">
                    <h4 className="font-semibold mb-3 text-sm">{item.title}</h4>
                    <p className=" text-xs leading-5">{item.desc}</p>
                </div>
            </div>
        </ScrollReveal>
    );
}
 
export default WhatWeProvideCard;