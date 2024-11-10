import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Alert } from "~/components/ui/Alert";
import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Spinner } from "~/components/ui/Spinner";
import { AllocationForm } from "~/components/AllocationList";
import { sumBallot, useSaveBallot } from "~/features/ballot/hooks/useBallot";
import { type Vote } from "~/features/ballot/types";
import { formatNumber } from "~/utils/formatNumber";
import { getAppState } from "~/utils/state";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { ImportXLSX } from "./ImportXLSX";
import { ExportCSV } from "./ExportCSV";

export function BallotAllocationForm() {
  const { address, isConnecting } = useAccount();
  const router = useRouter();
  if (!address && !isConnecting) {
    router.push("/").catch(console.log);
  }
  const form = useFormContext<{ votes: Vote[] }>();

  const save = useSaveBallot();

  const votes = form.watch("votes");
  function handleSaveBallot({ votes }: { votes: Vote[] }) {
    save.mutate({ votes });
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Review your ballot</h1>
      <p className="mb-6">
        Once you have reviewed your vote allocation, you can submit your ballot.
      </p>
      {save.error && (
        <Alert
          icon={AlertCircle}
          title={save.error?.message}
          className="mb-4"
          variant="warning"
        ></Alert>
      )}
      <div className="mb-2 justify-between sm:flex">
        <div className="flex gap-2">
          <ImportXLSX />
          <ExportCSV votes={votes} />
        </div>
        {votes.length ? <ClearBallot /> : null}
      </div>
      <div className="relative rounded-2xl border border-gray-300 dark:border-gray-800">
        <div className="p-8">
          <div className="relative flex max-h-[500px] min-h-[360px] flex-col overflow-auto">
            {votes?.length ? (
              <AllocationForm
                disabled={getAppState() === "RESULTS"}
                onSave={handleSaveBallot}
              />
            ) : (
              <EmptyBallot />
            )}
          </div>
        </div>

        <div className="flex h-16 items-center justify-between rounded-b-2xl border-t border-gray-300 px-8 py-4 text-lg font-semibold dark:border-gray-800">
          <div>Total votes in ballot</div>
          <div className="flex items-center gap-2">
            {save.isPending && <Spinner />}
            <TotalAllocation />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClearBallot() {
  const form = useFormContext();
  const [isOpen, setOpen] = useState(false);
  const { mutateAsync, isPending } = useSaveBallot();
  if (["TALLYING", "RESULTS"].includes(getAppState())) return null;
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Remove all projects from ballot
      </Button>

      <Dialog
        title="Are you sure?"
        size="sm"
        isOpen={isOpen}
        onOpenChange={setOpen}
      >
        <p className="mb-6 leading-6">
          This will empty your ballot and remove all the projects you have
          added.
        </p>
        <div className="flex justify-end">
          <Button
            variant="primary"
            disabled={isPending}
            onClick={() =>
              mutateAsync({ votes: [] }).then(() => {
                setOpen(false);
                form.reset({ votes: [] });
              })
            }
          >
            {isPending ? <Spinner /> : "Yes I'm sure"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
const EmptyBallot = () => (
  <div className="flex flex-1 items-center justify-center">
    <div className=" max-w-[360px] space-y-4">
      <h3 className="text-center text-lg font-bold">Your ballot is empty</h3>
      <p className="text-center text-sm text-gray-700">
        Your ballot currently doesn&apos;t have any projects added. Browse
        through the available projects.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button as={Link} href={"/projects"}>
          View projects
        </Button>
      </div>
    </div>
  </div>
);
const TotalAllocation = () => {
  const form = useFormContext<{ votes: Vote[] }>();
  const votes = form.watch("votes") ?? [];
  const sum = sumBallot(votes);

  return <div>{formatNumber(sum)} votes</div>;
};
