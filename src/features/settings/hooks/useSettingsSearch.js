import { useMemo, useState } from "react";

import { naturalSearchMap, settingsGroups, settingsPageMeta } from "../data/settingsNavigation";

const normalize = (value) => String(value || "").trim().toLowerCase();

const useSettingsSearch = () => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const clean = normalize(query);
    const pages = settingsGroups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        group: group.title,
        description: settingsPageMeta[item.id]?.description || "",
      })),
    );

    if (!clean) return pages.slice(0, 7);

    const natural = naturalSearchMap.find((entry) =>
      entry.keywords.some((keyword) => clean.includes(keyword)),
    );

    const scored = pages
      .map((page) => {
        const haystack = normalize(`${page.label} ${page.group} ${page.description}`);
        let score = haystack.includes(clean) ? 4 : 0;
        if (natural?.routeId === page.id) score += 8;
        clean.split(/\s+/).forEach((word) => {
          if (haystack.includes(word)) score += 1;
        });
        return { ...page, score };
      })
      .filter((page) => page.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 8);
  }, [query]);

  return { query, setQuery, results };
};

export default useSettingsSearch;
