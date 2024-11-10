import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { useSaveBallot } from "~/features/ballot/hooks/useBallot";
import { type BallotCSV, type Vote } from "~/features/ballot/types";
import * as XLSX from "xlsx";

export function ImportXLSX() {
  const form = useFormContext();
  const [votes, setVotes] = useState<Vote[]>([]);
  const save = useSaveBallot();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const importBallotXLSX = (file: File) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      const data = reader.result;
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets.Sheet1;
      if (worksheet) {
        const json: BallotCSV[] = XLSX.utils.sheet_to_json(worksheet);
        const filteredAmountJson = json.filter((row) => row["FIL Allocated"]);
        const mappedJson = filteredAmountJson.map((row) => ({
          projectId: row["Project ID"],
          amount: Number(row["FIL Allocated"]),
        })) as Vote[];
        setVotes(mappedJson);
      }
    };
    reader.onerror = () => console.log(reader.error);
  };

  return (
    <>
      <IconButton
        size="sm"
        icon={FileUp}
        onClick={() => csvInputRef.current?.click()}
      >
        Import XLSX
      </IconButton>

      <input
        ref={csvInputRef}
        type="file"
        accept="*.xlsx"
        className="hidden"
        onChange={(e) => {
          const [file] = e.target.files ?? [];
          if (!file) return;
          importBallotXLSX(file);
        }}
      />
      <Dialog
        size="sm"
        title="Save ballot?"
        isOpen={votes.length > 0}
        onOpenChange={() => setVotes([])}
      >
        <p className="mb-6 leading-6">
          This will replace your ballot with the XLSX data.
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
