import type { OrderBy, SortOrder } from "~/features/filter/types";
import SortByDropdown from "./SortByDropdown";
import { useFilter } from "~/features/filter/hooks/useFilter";
import { SearchInput } from "./ui/Form";
import { useDebounce } from "react-use";
import { useState } from "react";

export const SortFilter = () => {
  const { orderBy, sortOrder, setFilter } = useFilter();

  const [search, setSearch] = useState("");
  useDebounce(() => setFilter({ search }), 500, [search]);

  const validCombinations = {
    time_random: "time_random",
    name_asc: "name_asc",
    name_desc: "name_desc",
    time_asc: "time_asc",
    time_desc: "time_desc",
  } as const;

  return (
    <div className="mb-2 flex flex-1 flex-col items-end gap-2 sm:flex-row">
      <SearchInput
        className="w-full rounded-full"
        placeholder="Search project names..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <SortByDropdown
        options={[
          "time_random",
          "name_asc",
          "name_desc",
          "time_asc",
          "time_desc",
        ]}
        value={`${orderBy}_${sortOrder}` as keyof typeof validCombinations}
        onChange={async (sort) => {
          const [orderBy, sortOrder] = sort.split("_") as [OrderBy, SortOrder];

          await setFilter({ orderBy, sortOrder }).catch();
        }}
      />
    </div>
  );
};
