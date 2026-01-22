import icon from "../../assets/images/Frame.png";

const TestimonialCard = ({ name, title, image, desc }) => {
    return (
        <>
            <div className="w-[300px] rounded-3xl bg-[#E336291F] p-6 text-center mt-8 relative">
                <div className="flex flex-col items-center justify-center">
                    <img
                        src={image}
                        alt=""
                        className="w-16 h-16 rounded-full -mt-12"
                    />
                    <img src={icon} alt="" className="py-2 max-w-4" />
                    <div className="mb-4">
                        <h2 className="text-[19px] font-semibold mb-2-">{name}</h2>
                        <p className="text-[13.5px] font-medium">{title}</p>
                    </div>
                    <p className="text-[14px] leading-5">
                        {desc}
                    </p>
                </div>
            </div>
        </>
    );
}

export default TestimonialCard;