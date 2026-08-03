import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import Map from "../../components/public/Map";
import image from "../../assets/images/Contact us.png";
import ContactSection from "../../components/public/ContactSection";
import ScrollReveal from "../../components/public/ScrollReveal";

const Contact = () => {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="relative z-30 w-full h-[373px]">
        <img
          src={image}
          alt="Contact Hero Background"
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] z-0"
        />
        <div className="absolute w-full h-full bg-black opacity-40"></div>

        <div className="relative z-50 w-full h-full flex flex-col items-center justify-center text-center px-4">
          <ScrollReveal direction="up" distance={20}>
            <div className="flex flex-col items-center">
              <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-widest">
                Contact Us
              </h1>
              <p className="text-white text-sm mt-2 max-w-md">
                We are here to help and answer any question you might have. We look forward to hearing from you.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* --- GLOBAL GRADIENT BACKGROUND WRAPPER --- */}
      <div className="bg-gradient-to-r from-[#09314F] to-[#E83831]">
        <div className="bg-white relative -mb-7 z-50 pt-10 pb-16 rounded-b-[40px] overflow-hidden">

          <ContactSection showTitle={false} />

          {/* Map */}
          <div className="Container mt-10">
            <div className="area-wrapper">
              <ScrollReveal delay={0.2} direction="up" distance={30}>
                <Map />
              </ScrollReveal>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;