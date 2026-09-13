"use client";

import { useMemo, useState } from "react";
import {
  ATLAS_TREE,
  entryById,
  entryMatchesQuery,
  sideDimmed,
  treeLeafCount,
  type AtlasEntry,
  type AtlasSide,
  type AtlasTreeBranch,
  type AtlasTreeFamily,
} from "@/lib/atlas";

export function OpeningTree({
  query,
  side,
  onOpen,
}: {
  query: string;
  side: AtlasSide | "all";
  onOpen: (entry: AtlasEntry) => void;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(["open"]));

  const view = useMemo(() => {
    const q = query.trim();
    return ATLAS_TREE.map((family) => {
      const branches = family.branches
        .map((branch) => {
          const leaves = branch.entryIds
            .map((id) => entryById(id))
            .filter((entry): entry is AtlasEntry => Boolean(entry))
            .filter((entry) => entryMatchesQuery(entry, q));
          return { branch, leaves };
        })
        .filter((row) => row.leaves.length > 0);
      return { family, branches };
    }).filter((row) => row.branches.length > 0);
  }, [query]);

  const searching = query.trim().length > 0;

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!view.length) {
    return <p className="atlas-empty">Nothing on this branch. Clear search or try All.</p>;
  }

  return (
    <div className="uni-tree" role="tree" aria-label="Universal openings">
      {view.map(({ family, branches }) => {
        const expanded = searching || open.has(family.id);
        const familyDim = branches.every(({ leaves }) =>
          leaves.every((leaf) => sideDimmed(leaf, side)),
        );
        return (
          <section
            key={family.id}
            className={`uni-family${familyDim ? " uni-dim" : ""}`}
            role="treeitem"
            aria-expanded={expanded}
          >
            <button
              type="button"
              className="uni-family-btn"
              aria-expanded={expanded}
              onClick={() => toggle(family.id)}
            >
              <span className="uni-chevron" aria-hidden />
              <span className="uni-family-copy">
                <strong>{family.title}</strong>
                <em>{family.moves}</em>
              </span>
              <span className="uni-count">{leafTotal(branches)}</span>
            </button>
            <div className={expanded ? "uni-fold uni-fold-on" : "uni-fold"}>
              <div>
                <p className="uni-family-blurb">{family.blurb}</p>
                <ul className="uni-branch-list">
                  {branches.map(({ branch, leaves }, i) => (
                    <Branch
                      key={branch.id}
                      familyId={family.id}
                      branch={branch}
                      leaves={leaves}
                      last={i === branches.length - 1}
                      forced={searching}
                      open={open}
                      side={side}
                      onToggle={toggle}
                      onOpen={onOpen}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Branch({
  familyId,
  branch,
  leaves,
  last,
  forced,
  open,
  side,
  onToggle,
  onOpen,
}: {
  familyId: string;
  branch: AtlasTreeBranch;
  leaves: AtlasEntry[];
  last: boolean;
  forced: boolean;
  open: Set<string>;
  side: AtlasSide | "all";
  onToggle: (id: string) => void;
  onOpen: (entry: AtlasEntry) => void;
}) {
  const id = `${familyId}/${branch.id}`;
  const expanded = forced || open.has(id);
  const dim = leaves.every((leaf) => sideDimmed(leaf, side));
  return (
    <li
      className={`uni-branch${last ? " uni-last" : ""}${dim ? " uni-dim" : ""}`}
      role="group"
    >
      <button
        type="button"
        className="uni-branch-btn"
        aria-expanded={expanded}
        onClick={() => onToggle(id)}
      >
        <span className="uni-rail" aria-hidden />
        <span className="uni-chevron uni-chevron-sm" aria-hidden />
        <span className="uni-branch-copy">
          <strong>{branch.title}</strong>
          <em>{branch.hint}</em>
        </span>
        <span className="uni-count">{leaves.length}</span>
      </button>
      <div className={expanded ? "uni-fold uni-fold-on" : "uni-fold"}>
        <ul className="uni-leaf-list">
          {leaves.map((entry, i) => (
            <li
              key={entry.id}
              className={`uni-leaf${i === leaves.length - 1 ? " uni-last" : ""}${
                sideDimmed(entry, side) ? " uni-dim" : ""
              }`}
            >
              <button
                type="button"
                className="uni-leaf-btn"
                onClick={() => onOpen(entry)}
              >
                <span className="uni-rail" aria-hidden />
                <span className="uni-leaf-dot" aria-hidden />
                <span className="uni-leaf-copy">
                  <strong>{entry.name}</strong>
                  <em>
                    {entry.routes[0]?.name}
                    {" · "}
                    {entry.attacking}
                  </em>
                </span>
                {entry.trainId ? <span className="uni-train-pip">Train</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function leafTotal(
  branches: { leaves: AtlasEntry[] }[],
) {
  return branches.reduce((n, row) => n + row.leaves.length, 0);
}

export function treeSummary() {
  return ATLAS_TREE.reduce((n, family) => n + treeLeafCount(family), 0);
}
