"use client";

import { useId, useRef, useState } from "react";

export interface TrialTab {
  /** Stable slug used to build the tab/panel ids. */
  id: string;
  label: string;
  panel: React.ReactNode;
}

/**
 * Underlined tab strip for the trial detail panel.
 *
 * Holds the active-tab state and nothing else — every panel is supplied by the
 * caller, so data fetching stays where it already lives. All panels stay
 * mounted (inactive ones are `hidden`) so switching tabs never re-runs a
 * caller's effects and find-in-page still reaches the content.
 */
export default function TrialTabs({
  tabs,
  label = "Trial details",
}: {
  tabs: TrialTab[];
  label?: string;
}) {
  const uid = useId();
  const [selected, setSelected] = useState(tabs[0]?.id ?? "");
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (tabs.length === 0) return null;

  const active = tabs.some((t) => t.id === selected) ? selected : tabs[0].id;

  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  function move(index: number) {
    const next = tabs[index];
    if (!next) return;
    setSelected(next.id);
    btnRefs.current[next.id]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    let target: number | null = null;
    if (event.key === "ArrowRight") target = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") target = index === 0 ? last : index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = last;
    if (target === null) return;
    event.preventDefault();
    move(target);
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {tabs.map((tab, i) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              className="v4-tab"
              aria-selected={isActive}
              aria-controls={panelId(tab.id)}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => {
                btnRefs.current[tab.id] = el;
              }}
              onClick={() => setSelected(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={panelId(tab.id)}
            aria-labelledby={tabId(tab.id)}
            hidden={!isActive}
            tabIndex={0}
            style={{ display: isActive ? "block" : "none", paddingTop: 24, outlineOffset: 4 }}
          >
            {tab.panel}
          </div>
        );
      })}
    </div>
  );
}
