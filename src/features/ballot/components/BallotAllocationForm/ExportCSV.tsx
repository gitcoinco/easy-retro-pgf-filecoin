import { FileDown } from "lucide-react";
import { useCallback } from "react";
import { IconButton } from "~/components/ui/Button";
import { type Vote } from "~/features/ballot/types";
import { format } from "~/utils/csv";
import { useRoundProjects } from "~/hooks/useRoundProjects";
import { config } from "~/config";

export function ExportCSV({ votes }: { votes: Vote[] }) {
  // Fetch projects for votes to get the name
  const { data: projects, isLoading } = useRoundProjects({
    round: config.roundId,
  });
  // const projects = useProjectsById(votes.map((v) => v.projectId));

  const exportCSV = useCallback(async () => {
    if (!projects) return;
    const votesWithProjects = projects.map(
      ({ name, impactCategory, id: projectId }) => ({
        Name: name,
        "FIL Allocated": votes.find((v) => v.projectId === projectId)?.amount,
        Category: impactCategory[0],
        "Project ID": projectId,
      }),
    );

    // Generate CSV file
    const csv = format(votesWithProjects, {
      columns: ["Name", "FIL Allocated", "Category", "Project ID"],
    });
    window.open(`data:text/csv;charset=utf-8,${csv}`);
  }, [projects, votes]);

  return (
    <IconButton
      size="sm"
      icon={FileDown}
      onClick={exportCSV}
      disabled={isLoading}
    >
      Export CSV
    </IconButton>
  );
}
