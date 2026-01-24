import checkers from "../../assets/images/checkers.png";
import { Icon } from "@iconify/react/dist/iconify.js";

const TeamCard = ({ name, role }) => {

    return (
        <div
            style={{ backgroundImage: `url(${checkers})` }}
            className="px-4 py-5 rounded-3xl bg-slate-500"
        >
        <div className="h-56"></div>
        <div className="flex justify-between items-center px-4 py-2 bg-mainWhite rounded-2xl">
            <div className="bio">
                <p className="text-base font-semibold uppercase">{name}</p>
                <span className="text-xs uppercase">{role}</span>
            </div>
            <Icon icon="skill-icons:linkedin" width="24" height="24" />
        </div>
        </div>
    );
};

export default TeamCard;