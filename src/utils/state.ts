import { isAfter, isBefore } from "date-fns";
import { config, getEndsAt, roundsMap } from "~/config";
import { useFilter } from "~/features/filter/hooks/useFilter";

type AppState =
  | "NOT_STARTED"
  | "APPLICATION"
  | "REVIEWING"
  | "VOTING"
  | "RESULTS"
  | "TALLYING";
export const getAppState = (): AppState => {
  const now = new Date();
  if (isBefore(now, config.startsAt)) return "NOT_STARTED";
  if (isAfter(config.registrationEndsAt, now) && isBefore(config.startsAt, now))
    return "APPLICATION";
  if (isAfter(config.reviewEndsAt, now)) return "REVIEWING";
  if (isAfter(config.votingEndsAt, now)) return "VOTING";
  if (isBefore(now, config.resultsAt)) return "TALLYING";
  return "RESULTS";
};

export const useAppState = (): AppState => {
  const { round } = useFilter();
  if (!roundsMap[round]) return getAppState();
  const endsAt = getEndsAt(roundsMap[round]);
  const now = new Date();
  if (endsAt && isAfter(now, endsAt)) return "RESULTS";
  return getAppState();
};
