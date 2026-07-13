import icon from "../../assets/images/Group 1000001505.png";

const SectionHeading = ({ title, position_right, fullWidth = false, onClick }) => {
    return (
        <div 
            className={`relative ${fullWidth ? "w-full left-0 right-0" : "xl:max-w-[1300px] mx-auto w-full"} mb-10 md:mb-20 transition-all duration-300 ${onClick ? "cursor-pointer" : ""}`}
            onClick={onClick}
        >
            <div className="bg-primary py-3 relative z-10 w-full">
                <div className={`${fullWidth ? "w-full" : "xl:max-w-[1200px] mx-auto"} px-5 lg:px-8 2xl:px-9`}>
                    <h2 className="semi-title text-center text-white uppercase tracking-wider">{title}</h2>
                </div>
            </div>
            
            {/* Hanging Medallion - the SVG already contains the full design */}
            <img 
                src={icon} 
                alt="Tutorial center" 
                className={`absolute top-[calc(100%-8px)] ${position_right ? "right-2 md:right-10" : "left-2 md:left-10"} w-[80px] lg:w-[100px] z-0 transition-all`} 
            />
        </div>
    );
}

export default SectionHeading;