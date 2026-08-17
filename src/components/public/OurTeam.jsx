import ProfileCard from "./ProfileCard.jsx";
import { AllTeams } from "../../data/data.js";
import SectionHeading from "./SectionHeading.jsx";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal.jsx";

const OurTeam = () => {
    // List of team departments
    const [listallTeams, setListAllTeams] = useState([
        {
            developers: "Leadership",
            open: true,
        },
        {
            developers: "Development",
            open: false,
        },
        {
            developers: "Education",
            open: false,
        },
        {
            developers: "Marketing",
            open: false,
        },
        {
            developers: "Advisory",
            open: false,
        },
    ]);

    // Handle team category toggle
    const handleTeamState = (index) => {
        setListAllTeams((prev) =>
            prev.map((item, i) => ({
                ...item,
                open: i === index,
            }))
        );
    };

    // Active category
    const activeCategoryObj = listallTeams.find((item) => item.open);
    const activeCategory = activeCategoryObj ? activeCategoryObj.developers.toLowerCase() : "leadership";

    // Filter team members based on active category
    const filteredTeam = AllTeams.filter(
        (item) => item.category?.toLowerCase() === activeCategory
    );

    return (
        <>
            <SectionHeading title="Meet the team" position_right={false} fullWidth={true} />
            <div className="Container py-12 lg:py-16">
                <div className="area-wrapper">
                    
                    {/* Team category tabs */}
                    <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-4 border-b border-gray-200 pb-2">
                        {listallTeams.map((items, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`${
                                    items.open
                                        ? "border-b-2 border-[#E83831] text-[#09314F] font-black"
                                        : "text-gray-400 hover:text-gray-600 font-semibold"
                                } px-4 py-2 text-sm sm:text-base uppercase tracking-wider transition-all duration-200`}
                                onClick={() => handleTeamState(i)}
                            >
                                {items.developers}
                            </button>
                        ))}
                    </div>
                    
                    <div className="text-xs sm:text-sm mt-4 text-center text-gray-500 max-w-xl mx-auto">
                        <span>
                            Meet the dedicated educators, innovators, and leaders driving academic excellence across Africa.
                        </span>
                    </div>
                    
                    {/* Static Team Grid Display (No Slider) */}
                    {filteredTeam.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
                            {filteredTeam.map((member, i) => (
                                <ScrollReveal key={`${member.name}-${i}`} delay={0.05 * (i % 6)} direction="up" distance={20}>
                                    <div className="w-full max-w-[360px] mx-auto">
                                        <ProfileCard
                                            name={member.name}
                                            title={member.role}
                                            avatarUrl={member.avatarUrl || ""}
                                            linkedinUrl={member.linkedinUrl || ""}
                                        />
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-14 text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-sm font-medium">No team members listed in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OurTeam;