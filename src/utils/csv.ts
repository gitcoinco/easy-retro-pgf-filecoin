import { saveAs } from "file-saver";
import Papa, { type UnparseConfig } from "papaparse";
import type { Application } from "~/features/applications/types";
import type { Attestation } from "./fetchAttestations";
import type { RoundId } from "~/config";

export function parse<T>(file: string) {
  return Papa.parse<T>(file, { header: true });
}
export function format(data: unknown[], config: UnparseConfig) {
  return Papa.unparse(data, config);
}

const dataParsers = {
  "ez-rpgf-filecoin-1": (
    app: Application &
      Attestation & { impactMetrics: string[]; fundingSources: string[] },
  ) => ({
    ...app,
    impactCategory: JSON.stringify(app.impactCategory),
    contributionLinks: JSON.stringify(app.contributionLinks),
    impactMetrics: JSON.stringify(app.impactMetrics),
    fundingSources: JSON.stringify(app.fundingSources),
  }),
  "ez-rpgf-filecoin-2": (app: Application & Attestation) => ({
    name: app.name,
    bio: app.bio,
    categoryQuestions: JSON.stringify(app.categoryQuestions),
    contributionDescription: app.contributionDescription,
    contributionLinks: JSON.stringify(app.contributionLinks),
    githubProjectLink: app.githubProjectLink,
    impactCategory: app.impactCategory[0],
    impactDescription: app.impactDescription,
    twitterPost: app.twitterPost,
    websiteUrl: app.websiteUrl,
    impactMetrics: [],
    fundingSources: [],
  }),
};

const columns = {
  "ez-rpgf-filecoin-1": [
    "name",
    "bio",
    "websiteUrl",
    "payoutAddress",
    "contributionDescription",
    "impactDescription",
    "impactCategory",
    "contributionLinks",
    "impactMetrics",
    "fundingSources",
  ],
  "ez-rpgf-filecoin-2": [
    "name",
    "bio",
    "websiteUrl",
    "contributionDescription",
    "impactDescription",
    "impactCategory",
    "contributionLinks",
    "githubProjectLink",
    "categoryQuestions",
  ],
};
export const convertAndDownload = ({
  data,
  round,
}: {
  data: (Application & Attestation)[];
  round: RoundId;
}) => {
  // Manually transform complex data fields before unparsing
  const transformedData = data.map((app) => {
    return dataParsers[round](app);
  });

  // Configuration for unparsing
  const config: Papa.UnparseConfig = {
    quotes: true, // Wrap every field in quotes
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: true,
    columns: columns[round],
  };

  // Convert the transformed data array into a CSV string using Papa.unparse
  const csvString = Papa.unparse(transformedData, config);

  // Create a blob with the CSV data
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "projects.csv");
};
