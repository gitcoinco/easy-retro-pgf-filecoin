import { useMutation } from "@tanstack/react-query";
import { config, eas } from "~/config";
import { useUploadMetadata } from "~/hooks/useMetadata";
import { useAttest, useCreateAttestation } from "~/hooks/useEAS";
import type { Application, ApplicationVerification, Profile } from "../types";
import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";

export function useCreateApplication({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (err: TransactionError) => void;
}) {
  const attestation = useCreateAttestation();
  const attest = useAttest();
  const upload = useUploadMetadata();

  const mutation = useMutation({
    onSuccess,
    onError,
    mutationFn: async (values: {
      application: Application;
      applicationVerification: ApplicationVerification;
      profile: Profile;
    }) => {
      if (!config.roundId) throw new Error("Round ID must be defined");
      console.log("Uploading profile and application metadata");
      return Promise.all([
        upload.mutateAsync(values.application).then(({ url: metadataPtr }) => {
          console.log("Creating application attestation data");
          return attestation.mutateAsync({
            schemaUID: eas.schemas.metadata,
            values: {
              name: values.application.name,
              metadataType: 0, // "http"
              metadataPtr,
              type: "application",
              round: config.roundId,
            },
          });
        }),
        upload
          .mutateAsync(values.applicationVerification)
          .then(({ url: metadataPtr }) => {
            console.log("Creating application verification attestation data");
            return attestation.mutateAsync({
              schemaUID: eas.schemas.metadata,
              values: {
                name: values.applicationVerification.projectLegalName,
                metadataType: 0, // "http"
                metadataPtr,
                type: "applicationVerification",
                round: config.roundId,
              },
            });
          }),
        upload.mutateAsync(values.profile).then(({ url: metadataPtr }) => {
          console.log("Creating profile attestation data");
          return attestation.mutateAsync({
            schemaUID: eas.schemas.metadata,
            values: {
              name: values.profile.name,
              metadataType: 0, // "http"
              metadataPtr,
              type: "profile",
              round: config.roundId,
            },
          });
        }),
      ]).then((attestations) => {
        console.log("Creating onchain attestations", attestations, values);
        return attest.mutateAsync(
          attestations.map((att) => ({ ...att, data: [att.data] })),
        );
      });
    },
  });

  return {
    ...mutation,
    error: attest.error || upload.error || mutation.error,
    isAttesting: attest.isPending,
    isUploading: upload.isPending,
  };
}
