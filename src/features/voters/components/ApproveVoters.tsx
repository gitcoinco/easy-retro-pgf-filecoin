import { z } from "zod";
import { useMemo, useState } from "react";
import { UserRoundPlus } from "lucide-react";
import { Form, FormControl, Textarea } from "~/components/ui/Form";
import { useFormContext } from "react-hook-form";
import dynamic from "next/dynamic";
import { type Address, isAddress, getAddress } from "viem";
import { toast } from "sonner";

import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { useApproveVoters } from "../hooks/useApproveVoters";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { EthAddressSchema } from "~/features/distribute/types";
import {
  ethAddressFromDelegated,
  validateAddressString,
} from "@glif/filecoin-address";
import { EnsureCorrectNetwork } from "~/components/EnsureCorrectNetwork";

function parseAddresses(addresses: string) {
  return (
    addresses
      .split(",")
      .map((addr) => addr.trim() as Address)
      .map((addr) => {
        if (isAddress(addr)) return getAddress(addr);
        if (validateAddressString(addr)) return ethAddressFromDelegated(addr);
      })
      .filter(Boolean)
      // Remove duplicates
      .filter((addr, i, self) => self.indexOf(addr) === i)
  );
}

function ApproveVoters() {
  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const [isOpen, setOpen] = useState(false);
  const approve = useApproveVoters({
    onSuccess: () => {
      toast.success("Voters approved successfully!");
      setOpen(false);
    },
    onError: (err: { reason?: string; data?: { message: string } }) =>
      toast.error("Voter approve error", {
        description: err.reason ?? err.data?.message,
      }),
  });

  return (
    <div>
      <IconButton
        icon={UserRoundPlus}
        variant="primary"
        disabled={!isAdmin || !isCorrectNetwork}
        onClick={() => setOpen(true)}
      >
        {!isCorrectNetwork
          ? `Connect to ${correctNetwork.name}`
          : isAdmin
            ? `Add voters`
            : "You must be an admin"}
      </IconButton>

      <Dialog isOpen={isOpen} onOpenChange={setOpen} title={`Approve voters`}>
        <p className="pb-4 leading-relaxed">
          Add voters who will be allowed to vote in the round.
        </p>
        <p className="pb-4 leading-relaxed">
          Enter all the addresses as a comma-separated list below. Duplicates
          and invalid addresses will automatically be removed.
        </p>
        <Form
          schema={z.object({
            voters: EthAddressSchema,
          })}
          onSubmit={(values) => {
            const voters = parseAddresses(values.voters) as Address[];
            console.log("Approve voters", { voters });
            approve.mutate(voters);
          }}
        >
          <div className="mb-2"></div>
          <FormControl name="voters">
            <Textarea
              placeholder="Comma-separated list of addresses to approve"
              rows={8}
            />
          </FormControl>
          <div className="flex items-center justify-end">
            <ApproveButton isLoading={approve.isPending} isAdmin={isAdmin} />
          </div>
        </Form>
      </Dialog>
    </div>
  );
}

function ApproveButton({ isLoading = false, isAdmin = false }) {
  const form = useFormContext<{ voters: string }>();
  const voters = form.watch("voters");

  const selectedCount = useMemo(
    () => parseAddresses(voters ?? "").length,
    [voters],
  );

  return (
    <EnsureCorrectNetwork>
      <Button
        suppressHydrationWarning
        icon={UserRoundPlus}
        disabled={!selectedCount || !isAdmin || isLoading}
        variant="primary"
        type="submit"
      >
        {isAdmin ? `Approve ${selectedCount} voters` : "You must be an admin"}
      </Button>
    </EnsureCorrectNetwork>
  );
}

export default dynamic(() => Promise.resolve(ApproveVoters), { ssr: false });
