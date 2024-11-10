import { FileUp } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { useSaveBallot } from "~/features/ballot/hooks/useBallot";
import { type BallotCSV, type Vote } from "~/features/ballot/types";
import { parse } from "~/utils/csv";

export function ImportCSV() {
  const form = useFormContext();
  const [votes, setVotes] = useState<Vote[]>([]);
  const save = useSaveBallot();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const importCSV = useCallback((csvString: string) => {
    // Parse CSV and build the ballot data (remove name column)
    const { data } = parse<BallotCSV>(csvString);
    const filteredData = data.filter((project) => project["FIL Allocated"]);
    const votes = filteredData.map(
      ({ "Project ID": projectId, "FIL Allocated": amount }) => ({
        projectId,
        amount: Number(amount),
      }),
    );
    setVotes(votes);
  }, []);

  return (
    <>
      <IconButton
        size="sm"
        icon={FileUp}
        onClick={() => csvInputRef.current?.click()}
      >
        Import CSV
      </IconButton>

      <input
        ref={csvInputRef}
        type="file"
        accept="*.csv"
        className="hidden"
        onChange={(e) => {
          const [file] = e.target.files ?? [];
          if (!file) return;
          // CSV parser doesn't seem to work with File
          // Read the CSV contents as string
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => importCSV(String(reader.result));
          reader.onerror = () => console.log(reader.error);
        }}
      />
      <Dialog
        size="sm"
        title="Save ballot?"
        isOpen={votes.length > 0}
        onOpenChange={() => setVotes([])}
      >
        <p className="mb-6 leading-6">
          This will replace your ballot with the CSV.
        </p>
        <div className="flex justify-end">
          <Button
            variant="primary"
            disabled={save.isPending}
            onClick={() => {
              save
                .mutateAsync({ votes })
                .then(() => form.reset({ votes }))
                .catch(console.log);
              setVotes([]);
            }}
          >
            Yes I'm sure
          </Button>
        </div>
      </Dialog>
    </>
  );
}
