import Navbar from "@/components/Navbar";
import { PhotoSlideshow } from "@/components/PhotoSlideshow";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Navbar />
      <PhotoSlideshow />
      <Footer />
    </div>
  );
};

export default Index;
