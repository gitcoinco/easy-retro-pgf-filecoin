import { FileUp } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { parse } from "~/utils/csv";
import { type Distribution } from "../types";
import { toast } from "sonner";

export function ImportCSV({
  onImportDistribution,
}: {
  onImportDistribution: (distribution: Distribution[]) => void;
}) {
  const form = useFormContext();
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const importCSV = useCallback((csvString: string) => {
    try {
      // Parse CSV and build the ballot data (remove name column)
      const { data } = parse<Distribution>(csvString);
      const distribution = data.map(
        ({ projectId, name, amount, githubLink }) => {
          if (isNaN(amount)) throw new Error("Must be a valid CSV file");

          return {
            projectId,
            name,
            githubLink: githubLink,
            amount: isNaN(amount) ? 0 : Number(amount),
          };
        },
      );
      setDistribution(distribution);
    } catch (error) {
      toast.error((error as unknown as Error).message);
    }
  }, []);
  return (
    <div>
      <IconButton icon={FileUp} onClick={() => csvInputRef.current?.click()}>
        Import CSV
      </IconButton>

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const [file] = e.target.files ?? [];
          if (!file) return;
          // CSV parser doesn't seem to work with File
          // Read the CSV contents as string
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => importCSV(String(reader.result));
          reader.onerror = () => {
            throw new Error(reader.error);
          };
        }}
      />
      <Dialog
        isOpen={distribution.length > 0}
        size="sm"
        title="Import distribution?"
        onOpenChange={() => setDistribution([])}
      >
        <p className="mb-6 leading-6">
          This will replace your distribution with the CSV. Refreshing the page
          will reset the distribution.
        </p>
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => {
              // form.reset({ votes: distribution });
              onImportDistribution(distribution);
              setDistribution([]);
            }}
          >
            Yes I'm sure
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
