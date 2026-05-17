import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LatestPhotoRow from "./LatestPhotoRow";

interface Photo {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
  likes: number | null;
}

const LatestPhotosRow = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from("photos")
        .select("id, title, storage_url, category, likes")
        .order("created_at", { ascending: false })
        .limit(14);
      if (data) setPhotos(data as Photo[]);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  if (loading || photos.length === 0) return null;

  return (<LatestPhotoRow title="Latest Photos" photos={photos} />);
};

export default LatestPhotosRow;