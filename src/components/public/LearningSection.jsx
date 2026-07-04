import studyImage from "../../assets/images/Study_that_stays (2).png";
import {
    LightBulbIcon,
    BookOpenIcon,
    ArrowPathIcon,
    MagnifyingGlassCircleIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import ScrollReveal from "./ScrollReveal";

const benefits = [
    {
        icon: LightBulbIcon,
        text: "Maintain concentration for longer study sessions.",
    },
    {
        icon: BookOpenIcon,
        text: "Improve understanding rather than relying solely on memorization.",
    },
    {
        icon: ArrowPathIcon,
        text: "Strengthen long-term retention through regular practice and revision.",
    },
    {
        icon: MagnifyingGlassCircleIcon,
        text: "Identify knowledge gaps before examinations.",
    },
    {
        icon: CheckBadgeIcon,
        text: "Build confidence by mastering concepts step by step.",
    },
];

export default function LearningSection() {
    return (
        <div className="py-14 lg:py-20 w-full bg-[#FAFAFA]">
            <div className="Container">
                <div className="area-wrapper">
                    {/* Section Header */}
                    <ScrollReveal delay={0.1} direction="up" distance={20}>
                        <h2 className="header-title uppercase text-center mb-10 lg:mb-14">
                            Learning That Stays With You
                        </h2>
                    </ScrollReveal>

                    {/* Content: Image (40%) + Text (60%) */}
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                        {/* Left: Image - 40% */}
                        <div className="w-full lg:w-[40%] flex-shrink-0">
                            <ScrollReveal delay={0.2} direction="left" distance={40}>
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                                    <div
                                        className="w-full h-[450px] lg:h-[800px] bg-cover bg-center bg-no-repeat bg-gray-600 bg-blend-overlay transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url("${studyImage}")` }}
                                        aria-label="Student learning with Tutorial Center"
                                        role="img"
                                    />
                                    {/* Subtle overlay shimmer */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09314F]/20 via-transparent to-transparent pointer-events-none z-10" />
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Right: Text Content - 60% */}
                        <div className="w-full lg:w-[60%]">
                            <ScrollReveal delay={0.3} direction="up" distance={20}>
                                <p className="text-sm md:text-[15px] leading-7 text-gray-700 mb-4">
                                    Many students spend countless hours studying, yet still struggle to recall important concepts during examinations. The challenge is often not a lack of effort, but rather ineffective study methods, limited engagement, and difficulty retaining information over time.
                                </p>
                            </ScrollReveal>

                            <ScrollReveal delay={0.4} direction="up" distance={20}>
                                <p className="text-sm md:text-[15px] leading-7 text-gray-700 mb-4">
                                    Research has consistently shown that attention and retention are closely connected. When students lose focus, information is less likely to be processed, understood, and stored in long-term memory. This explains why simply reading notes repeatedly or passively watching lessons often produces disappointing results.
                                </p>
                            </ScrollReveal>

                            <ScrollReveal delay={0.5} direction="up" distance={20}>
                                <p className="text-sm md:text-[15px] leading-7 text-gray-700 font-semibold mb-4">
                                    At Tutorial Center, we have designed our learning experience to address these challenges directly.
                                </p>
                            </ScrollReveal>

                            <ScrollReveal delay={0.6} direction="up" distance={20}>
                                <p className="text-sm md:text-[15px] leading-7 text-gray-700 mb-5">
                                    Our approach combines engaging video lessons, structured practice activities, interactive assessments, and guided revision techniques that actively involve students in the learning process. Instead of memorizing facts mechanically, learners are encouraged to apply concepts, solve problems, test their understanding, and revisit difficult topics through continuous reinforcement.
                                </p>
                            </ScrollReveal>

                            {/* Subtitle */}
                            <ScrollReveal delay={0.7} direction="up" distance={20}>
                                <h3 className="text-base md:text-lg font-bold text-sencondary mb-4">
                                    This active learning approach helps students:
                                </h3>
                            </ScrollReveal>

                            {/* Benefits List with Icons */}
                            <div className="space-y-3 mb-6">
                                {benefits.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <ScrollReveal key={index} delay={0.7 + (index * 0.1)} direction="left" distance={20}>
                                            <div
                                                className="flex items-start gap-3 group/item"
                                            >
                                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#E83831]/10 to-[#09314F]/10 flex items-center justify-center group-hover/item:from-[#E83831]/20 group-hover/item:to-[#09314F]/20 transition-all duration-300">
                                                    <Icon className="w-5 h-5 text-[#E83831]" />
                                                </div>
                                                <p className="text-sm md:text-[15px] leading-6 text-gray-700 pt-1.5">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </ScrollReveal>
                                    );
                                })}
                            </div>

                            {/* Closing Paragraphs */}
                            <ScrollReveal delay={1.2} direction="up" distance={20}>
                                <p className="text-sm md:text-[15px] leading-7 text-gray-700 mb-4">
                                    By transforming learning from a passive activity into an interactive experience, students are better equipped not only to succeed in examinations, but also to develop a deeper and more lasting understanding of what they learn.
                                </p>

                                <p className="text-sm md:text-[15px] leading-7 text-gray-700 font-semibold italic">
                                    Because true academic success is not measured by how long a student studies, but by how much they understand, retain, and confidently apply.
                                </p>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
