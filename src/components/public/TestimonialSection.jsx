import { Link } from "react-router-dom";
import TestimonialCard from "./TestimonialCard";
import SectionHeading from "./SectionHeading";

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
      <SectionHeading title={"testimonial"} position_right={true} />
      <div className="Container">
        <div className="area-wrapper !py-16">
          <div className="flex flex-col gap-20 md:flex-row md:gap-4 items-center justify-center">
            <div className="blockContent flex-1">
              <h4 className="font-bold semi-title text-[#020D14] mb-6">
                Check out what our clients <br /> are saying about us
              </h4>
              <p className="text-[#020D14] text-sm font-medium mb-6">
                So what are you waiting for join us now
              </p>
              <Link to="/register" className="btn-title">
                Get Started{" "}
              </Link>
            </div>
            <div className="lg:flex gap-2 flex-1 ">
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
    </>
  );
}

export default TestimonialSection;
