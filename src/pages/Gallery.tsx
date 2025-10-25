import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";

const GalleryPage = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Navbar />
      <div className="pt-20">
        <Gallery />
      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;
