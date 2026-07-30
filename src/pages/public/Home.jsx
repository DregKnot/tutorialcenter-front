import BenefitSection from "../../components/public/BenefitSection";
import LearningSection from "../../components/public/LearningSection";
import CommunityGrowth from "../../components/public/CommunityGrowth";
import ContactSection from "../../components/public/ContactSection";
import FaqSection from "../../components/public/FaqSection";
import Footer from "../../components/public/Footer";
import Hero from "../../components/public/Hero";
import CountdownSection from "../../components/public/CountdownSection";
import Navbar from "../../components/public/Navbar";
import ProgramSection from "../../components/public/ProgramSection";
// import StickyButtons from "../../components/public/StickyButtons";
// import TestimonialSection from "../../components/public/TestimonialSection";
import { Helmet } from "react-helmet-async";

const Home = () => {
    return (
        <>
            <Helmet>
                <title>Tutorial Center | Digital Tutorial Center, Exam preparation platform for O'levels and JAMB</title>
                <meta name="description" content="Tutorial Center is the leading digital tutorial center offering comprehensive online lessons for O-levels, JAMB, WAEC, NECO, GCE, and more. Join our online tutoring center to achieve academic excellence across Africa." />
                <meta property="og:title" content="Tutorial Center | Digital Tutorial Center for O'levels and JAMB" />
                <meta property="og:description" content="Tutorial Center is the leading digital tutorial center offering comprehensive online lessons for O-levels, JAMB, WAEC, NECO, GCE, and more. Join our online tutoring center to achieve academic excellence across Africa." />
                <meta property="og:image" content="https://www.tutorialcenter.africa/TC%201.png" />
                <meta property="og:url" content="https://www.tutorialcenter.africa/" />
            </Helmet>
            <Navbar />
            <Hero />
            <CountdownSection />
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