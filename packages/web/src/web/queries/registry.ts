import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export const useStreets = () => useQuery(orpc.streets.list.queryOptions());
export const useBuildings = () => useQuery(orpc.buildings.list.queryOptions());
export const useFamilies = () => useQuery(orpc.families.list.queryOptions());
export const useMembers = () => useQuery(orpc.members.list.queryOptions());
export const useAgents = () => useQuery(orpc.agents.list.queryOptions());
export const useSettings = () => useQuery(orpc.settings.get.queryOptions({ staleTime: 60_000 }));
export const useStats = () => useQuery(orpc.stats.overview.queryOptions());

export function useCreateStreet() {
  const inv = useInvalidateAll();
  return useMutation(orpc.streets.create.mutationOptions({ onSuccess: inv }));
}
export function useUpdateStreet() {
  const inv = useInvalidateAll();
  return useMutation(orpc.streets.update.mutationOptions({ onSuccess: inv }));
}
export function useRemoveStreet() {
  const inv = useInvalidateAll();
  return useMutation(orpc.streets.remove.mutationOptions({ onSuccess: inv }));
}
export function useCreateBuilding() {
  const inv = useInvalidateAll();
  return useMutation(orpc.buildings.create.mutationOptions({ onSuccess: inv }));
}
export function useUpdateBuilding() {
  const inv = useInvalidateAll();
  return useMutation(orpc.buildings.update.mutationOptions({ onSuccess: inv }));
}
export function useRemoveBuilding() {
  const inv = useInvalidateAll();
  return useMutation(orpc.buildings.remove.mutationOptions({ onSuccess: inv }));
}
export function useCreateFamily() {
  const inv = useInvalidateAll();
  return useMutation(orpc.families.create.mutationOptions({ onSuccess: inv }));
}
export function useUpdateFamily() {
  const inv = useInvalidateAll();
  return useMutation(orpc.families.update.mutationOptions({ onSuccess: inv }));
}
export function useRemoveFamily() {
  const inv = useInvalidateAll();
  return useMutation(orpc.families.remove.mutationOptions({ onSuccess: inv }));
}
export function useCreateMember() {
  const inv = useInvalidateAll();
  return useMutation(orpc.members.create.mutationOptions({ onSuccess: inv }));
}
export function useUpdateMember() {
  const inv = useInvalidateAll();
  return useMutation(orpc.members.update.mutationOptions({ onSuccess: inv }));
}
export function useRemoveMember() {
  const inv = useInvalidateAll();
  return useMutation(orpc.members.remove.mutationOptions({ onSuccess: inv }));
}
export function useCreateAgent() {
  const inv = useInvalidateAll();
  return useMutation(orpc.agents.create.mutationOptions({ onSuccess: inv }));
}
export function useUpdateAgent() {
  const inv = useInvalidateAll();
  return useMutation(orpc.agents.update.mutationOptions({ onSuccess: inv }));
}
export function useRemoveAgent() {
  const inv = useInvalidateAll();
  return useMutation(orpc.agents.remove.mutationOptions({ onSuccess: inv }));
}
export function useSaveSettings() {
  const inv = useInvalidateAll();
  return useMutation(orpc.settings.save.mutationOptions({ onSuccess: inv }));
}
export function useSeedDemo() {
  const inv = useInvalidateAll();
  return useMutation(orpc.admin.seedDemo.mutationOptions({ onSuccess: inv }));
}
export function useResetAll() {
  const inv = useInvalidateAll();
  return useMutation(orpc.admin.resetAll.mutationOptions({ onSuccess: inv }));
}
