import type { Application } from "~/features/applications/types";
import type { Attestation } from "~/utils/fetchAttestations";
import { api } from "~/utils/api";

export function useRoundProjects({ round }: { round: string }) {
  const query = api.projects.roundProjectsWithMetadata.useQuery({
    round,
  });

  return {
    ...query,
    data: query.data as unknown as (Application & Attestation)[] | undefined,
  };
}
