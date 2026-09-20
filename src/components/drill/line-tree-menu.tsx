"use client";

import { useEffect, useMemo, useState } from "react";
import { openingDossier, repertoireLineTree } from "@/lib/openings";
import type { Opening, Trap } from "@/lib/openings";

export function LineTreeMenu({
  opening,
  trapId,
  ply,
  onClose,
  onPickBranch,
  onOpenBook,
}: {
  opening: Opening;
  trapId: string | null;
  ply: number;
  onClose: () => void;
  onPickBranch: (trap: Trap | null, ply?: number) => void;
  onOpenBook: () => void;
}) {
  const tree = useMemo(() => repertoireLineTree(opening), [opening]);
  const [open, setOpen] = useState<Set<string>>(() =>
    new Set([trapId ?? "spine"]),
  );

  useEffect(() => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.add(trapId ?? "spine");
      return next;
    });
  }, [trapId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="line-menu-root" role="presentation">
      <button
        type="button"
        className="line-menu-scrim"
        aria-label="Close lines"
        onClick={onClose}
      />
      <div
        className="line-menu splash-in"
        role="dialog"
        aria-label="Repertoire branches"
      >
        <div className="line-menu-top">
          <div>
            <p className="line-menu-kicker">Lines</p>
            <h2>{opening.shortName}</h2>
            <p className="line-menu-dossier">{openingDossier(opening)}</p>
          </div>
          <button type="button" className="study-close" onClick={onClose}>
            Close
          </button>
        </div>
        <ul className="line-tree" role="tree">
          {tree.map((branch, i) => {
            const key = branch.id ?? "spine";
            const expanded = open.has(key);
            const current = (branch.id ?? null) === trapId;
            const trap =
              branch.id == null
                ? null
                : (opening.traps.find((t) => t.id === branch.id) ?? null);
            const last = i === tree.length - 1;
            return (
              <li
                key={key}
                className={`line-branch${last ? " line-last" : ""}${
                  current ? " line-branch-on" : ""
                }`}
                role="treeitem"
                aria-expanded={expanded}
                aria-selected={current}
              >
                <div className="line-branch-row">
                  <button
                    type="button"
                    className="line-chevron-btn"
                    aria-label={expanded ? "Collapse branch" : "Expand branch"}
                    aria-expanded={expanded}
                    onClick={() => toggle(key)}
                  >
                    <span className="line-chevron" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="line-branch-btn"
                    onClick={() => onPickBranch(trap)}
                  >
                    <span className="line-branch-copy">
                      <strong>{branch.title}</strong>
                      <em>{branch.hint}</em>
                    </span>
                    {current ? <span className="line-now">Now</span> : null}
                  </button>
                </div>
                <div className={expanded ? "line-fold line-fold-on" : "line-fold"}>
                  <ul className="line-leaf-list" role="group">
                    {branch.leaves.map((leaf, j) => {
                      const onHouse =
                        current &&
                        ply >= leaf.ply &&
                        (j === branch.leaves.length - 1 ||
                          ply < branch.leaves[j + 1]!.ply);
                      return (
                        <li
                          key={`${key}-${leaf.ply}-${leaf.title}`}
                          className={`line-leaf${
                            j === branch.leaves.length - 1 ? " line-last" : ""
                          }${onHouse ? " line-leaf-on" : ""}`}
                        >
                          <button
                            type="button"
                            className="line-leaf-btn"
                            onClick={() => onPickBranch(trap, leaf.ply)}
                          >
                            <span className="line-leaf-dot" aria-hidden />
                            <span className="line-leaf-copy">{leaf.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        <button type="button" className="line-book-link" onClick={onOpenBook}>
          Six pillars
        </button>
      </div>
    </div>
  );
}
