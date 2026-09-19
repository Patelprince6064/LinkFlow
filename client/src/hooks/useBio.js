import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export const useMyBio = () => {
  return useQuery({
    queryKey: ["bio", "me"],
    queryFn: async () => {
      const res = await api.get("/v1/bio/me");
      return res.data.data;
    },
  });
};

export const useCreateBio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/v1/bio", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio"] });
    },
  });
};

export const useUpdateBio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.patch("/v1/bio", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio"] });
    },
  });
};

export const useDeleteBio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete("/v1/bio");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio"] });
    },
  });
};
