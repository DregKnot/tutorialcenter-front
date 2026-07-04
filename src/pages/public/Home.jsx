import BenefitSection from "../../components/public/BenefitSection";
import LearningSection from "../../components/public/LearningSection";
import CommunityGrowth from "../../components/public/CommunityGrowth";
import ContactSection from "../../components/public/ContactSection";
import FaqSection from "../../components/public/FaqSection";
import Footer from "../../components/public/Footer";
import Hero from "../../components/public/Hero";
import Navbar from "../../components/public/Navbar";
import ProgramSection from "../../components/public/ProgramSection";
// import StickyButtons from "../../components/public/StickyButtons";
// import TestimonialSection from "../../components/public/TestimonialSection";
import { Helmet } from "react-helmet-async";

const Home = () => {
    return (
        <>
            <Helmet>
                <title>Tutorial Center | Empowering Minds, Acheiving Excellence</title>
                <meta name="description" content="Tutorial Center is an interactive educational platform offering exam preparation, curriculum guides, and learning support for students across Africa." />
                <meta property="og:title" content="Tutorial Center | Empowering Minds" />
                <meta property="og:description" content="Prepare for WAEC, JAMB, and more with our interactive educational platform and foundational programs." />
                <meta property="og:image" content="https://www.tutorialcenter.africa/TC%201.png" />
                <meta property="og:url" content="https://www.tutorialcenter.africa/" />
            </Helmet>
            <Navbar />
            <Hero />
            <BenefitSection />
            <LearningSection />
            <CommunityGrowth />
            <ProgramSection />
            {/* <TestimonialSection /> */}
            <FaqSection />
            <ContactSection />
            <Footer />
        </>
    );
}
 
export default Home;