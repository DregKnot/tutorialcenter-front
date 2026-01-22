import icon from "../../assets/svg/tc_icon.svg";

const SectionHeading = ({ title, position_right }) => {

    return (
        <>
            <div className="bg-primary py-3 relative xl:max-w-[1300px] w-full mx-auto 2xl:px-9 lg:px-8 px-5 mb-20">
                <h1 className="semi-title text-center text-white uppercase">{title}</h1>

                <img src={icon} alt="" className={`absolute bottom-0 translate-y-20 ${position_right ? "right-10 md:right-20" : "left-10 md:left-20"} w-[100px]`} />
            </div>
        </>
    );
}
 
export default SectionHeading;