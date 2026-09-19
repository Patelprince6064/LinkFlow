import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const LINKS_KEY = ["links"];

export const useLinks = ({ page = 1, limit = 10, search = "", isActive } = {}) => {
  return useQuery({
    queryKey: [...LINKS_KEY, { page, limit, search, isActive }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      if (search) params.set("search", search);
      if (isActive !== undefined) params.set("isActive", isActive);
      const response = await api.get(`/v1/links?${params.toString()}`);
      return response.data.data;
    },
  });
};

export const useLink = (id) => {
  return useQuery({
    queryKey: [...LINKS_KEY, id],
    queryFn: async () => {
      const response = await api.get(`/v1/links/${id}`);
      return response.data.data.link;
    },
    enabled: !!id,
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/v1/links", data);
      return response.data.data.link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_KEY });
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.patch(`/v1/links/${id}`, data);
      return response.data.data.link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_KEY });
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/v1/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_KEY });
    },
  });
};
