import { Link } from "react-router-dom";
import TestimonialCard from "./TestimonialCard.jsx";
import SectionHeading from "./SectionHeading.jsx";

//Testimonial data
const data = [
  {
    name: "Chizoba Tina",
    title: "Guardian/Parent",
    image:
      "https://brightstarschools.org/files/_cache/07c4dc8799aea6795eba751059b484db.jpeg",
    desc: '"The online platform was a game-changer for my children. The personalized support and flexible schedule helped them succeed in their exams beyond expectations."',
  },
  {
    name: "Chizoba Tina",
    title: "Student",
    image:
      "https://brightstarschools.org/files/_cache/07c4dc8799aea6795eba751059b484db.jpeg",
    desc: '"Thanks to the online learning platform, I passed my exams with flying colors. The well-structured lessons and interactive sessions made learning enjoyable and effective."',
  },
];

const TestimonialSection = () => {
  return (
    <>
      <SectionHeading title={"testimonial"} position_right={true} fullWidth={true} />
      <div className="w-full">
        <div className="Container !overflow-visible">
          <div className="area-wrapper !py-4 lg:!py-16">
            <div className="flex flex-col gap-6 md:flex-row md:gap-8 items-center justify-center">
              <div className="blockContent flex-1 text-center md:text-left">
                <h4 className="font-bold semi-title !text-2xl md:!text-[2.5rem] text-[#020D14] mb-2 md:mb-4 !leading-tight md:!leading-[1.2]">
                  Check out what our clients <br className="hidden md:block" /> are saying about us
                </h4>
                <p className="text-[#020D14] text-xs md:text-sm font-medium mb-6 md:mb-8 uppercase tracking-wide">
                  So what are you waiting for join us now
                </p>
                <Link to="/register" className="btn-title">
                  Get Started
                </Link>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 w-full items-center">
                {data.map((item, index) => (
                  <TestimonialCard
                    key={index}
                    name={item.name}
                    title={item.title}
                    image={item.image}
                    desc={item.desc}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TestimonialSection;
