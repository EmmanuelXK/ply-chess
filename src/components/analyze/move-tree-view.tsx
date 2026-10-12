"use client";

import { useEffect, useRef } from "react";

import { pathsEqual, type AnalysisTree, type MoveNode } from "@/lib/chess/tree";

export function MoveTreeView({
  tree,
  onJump,
}: {
  tree: AnalysisTree;
  onJump: (path: number[]) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathKey = tree.path.join(".");

  useEffect(() => {
    const current = rootRef.current?.querySelector("[data-current='true']");
    current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathKey]);

  return (
    <div className="analyze-tree" data-testid="move-tree" ref={rootRef}>
      {tree.children.length ? (
        <MoveRun
          nodes={tree.children}
          ply={0}
          base={0}
          path={[]}
          active={tree.path}
          numberBlack={false}
          onJump={onJump}
        />
      ) : (
        <p className="analyze-empty">Play a move to start a line.</p>
      )}
    </div>
  );
}

function MoveRun({
  nodes,
  ply,
  base,
  path,
  active,
  numberBlack,
  onJump,
}: {
  nodes: MoveNode[];
  ply: number;
  base: number;
  path: number[];
  active: number[];
  numberBlack: boolean;
  onJump: (path: number[]) => void;
}) {
  const main = nodes[0];
  if (!main) return null;
  const mainPath = [...path, base];
  const alts = nodes.slice(1);
  return (
    <>
      <MoveChip
        san={main.san}
        ply={ply}
        path={mainPath}
        active={pathsEqual(mainPath, active)}
        numberBlack={numberBlack}
        onJump={onJump}
      />
      {alts.map((alt, index) => (
        <span className="analyze-var" key={alt.id}>
          (
          <MoveRun
            nodes={[alt]}
            ply={ply}
            base={base + 1 + index}
            path={path}
            active={active}
            numberBlack
            onJump={onJump}
          />
          )
        </span>
      ))}
      {main.children.length ? (
        <MoveRun
          nodes={main.children}
          ply={ply + 1}
          base={0}
          path={mainPath}
          active={active}
          numberBlack={alts.length > 0}
          onJump={onJump}
        />
      ) : null}
    </>
  );
}

function MoveChip({
  san,
  ply,
  path,
  active,
  numberBlack,
  onJump,
}: {
  san: string;
  ply: number;
  path: number[];
  active: boolean;
  numberBlack: boolean;
  onJump: (path: number[]) => void;
}) {
  const n = Math.floor(ply / 2) + 1;
  const label = ply % 2 === 0 ? `${n}. ${san}` : numberBlack ? `${n}… ${san}` : san;
  return (
    <button
      type="button"
      className={active ? "analyze-move analyze-move-on" : "analyze-move"}
      data-current={active ? "true" : undefined}
      onClick={() => onJump(path)}
    >
      {label}
    </button>
  );
}
