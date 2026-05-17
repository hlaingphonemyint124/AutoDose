import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";

const GalleryPage = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title="Photo Gallery — JDM Car Photography"
        description="Browse AUTODOSE's curated JDM car photography gallery featuring iconic Japanese sports cars and lifestyle shots."
      />
      <Navbar />
      <div className="pt-20">
        <Gallery />
      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;
