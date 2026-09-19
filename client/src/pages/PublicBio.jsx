import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import BioPreview from "../components/BioPreview";

function PublicBio() {
  const { username } = useParams();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["bio", "public", username],
    queryFn: async () => {
      const res = await api.get(`/v1/bio/${username}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (profile?.displayName) {
      document.title = profile.displayName + " — Links";
    }
    return () => {
      document.title = "LinkHub";
    };
  }, [profile?.displayName]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">Profile not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No profile exists for /{username}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BioPreview profile={profile} />
    </div>
  );
}

export default PublicBio;
