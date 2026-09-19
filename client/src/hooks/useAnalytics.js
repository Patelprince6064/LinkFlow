import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const buildParams = ({ startDate, endDate, ...rest } = {}) => {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, v);
  });
  return params.toString();
};

export const useAnalyticsOverview = ({ startDate, endDate } = {}) => {
  return useQuery({
    queryKey: ["analytics", "overview", { startDate, endDate }],
    queryFn: async () => {
      const res = await api.get(`/v1/analytics/overview?${buildParams({ startDate, endDate })}`);
      return res.data.data;
    },
  });
};

export const useClicksOverTime = ({ startDate, endDate } = {}) => {
  return useQuery({
    queryKey: ["analytics", "clicks-over-time", { startDate, endDate }],
    queryFn: async () => {
      const res = await api.get(`/v1/analytics/clicks-over-time?${buildParams({ startDate, endDate, interval: "day" })}`);
      return res.data.data;
    },
  });
};

export const useTopReferrers = ({ startDate, endDate, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ["analytics", "referrers", { startDate, endDate, limit }],
    queryFn: async () => {
      const res = await api.get(`/v1/analytics/referrers?${buildParams({ startDate, endDate, limit })}`);
      return res.data.data;
    },
  });
};

export const useDeviceDistribution = ({ startDate, endDate } = {}) => {
  return useQuery({
    queryKey: ["analytics", "devices", { startDate, endDate }],
    queryFn: async () => {
      const res = await api.get(`/v1/analytics/devices?${buildParams({ startDate, endDate })}`);
      return res.data.data;
    },
  });
};

export const useLinkAnalytics = (linkId, { startDate, endDate } = {}) => {
  return useQuery({
    queryKey: ["analytics", "link", linkId, { startDate, endDate }],
    queryFn: async () => {
      const res = await api.get(`/v1/analytics/links/${linkId}?${buildParams({ startDate, endDate })}`);
      return res.data.data;
    },
    enabled: !!linkId,
  });
};
