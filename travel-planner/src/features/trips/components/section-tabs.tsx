"use client";

import type { KeyboardEvent } from "react";
import type { PlanSection } from "../domain/trip";

const sections: Array<{ id: PlanSection; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "travel", label: "Travel" },
  { id: "stay", label: "Stay" },
  { id: "days", label: "Days" },
  { id: "food", label: "Food" },
  { id: "budget", label: "Budget" },
  { id: "checks", label: "Checks" },
];

export function SectionTabs(props: {
  active: PlanSection;
  onChange: (section: PlanSection) => void;
}) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    sectionIndex: number,
  ) {
    const lastIndex = sections.length - 1;
    let nextIndex: number | undefined;

    if (["ArrowDown", "ArrowRight"].includes(event.key)) {
      nextIndex = sectionIndex === lastIndex ? 0 : sectionIndex + 1;
    } else if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
      nextIndex = sectionIndex === 0 ? lastIndex : sectionIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextSection = sections[nextIndex];
    const nextTab = event.currentTarget.parentElement?.children[
      nextIndex
    ] as HTMLButtonElement | undefined;
    nextTab?.focus();
    props.onChange(nextSection.id);
  }

  return (
    <div
      className="section-tabs"
      role="tablist"
      aria-label="Trip sections"
      aria-orientation="vertical"
    >
      {sections.map((section, index) => (
        <button
          className="section-tab"
          key={section.id}
          id={`tab-${section.id}`}
          type="button"
          role="tab"
          aria-selected={props.active === section.id}
          aria-controls={`panel-${section.id}`}
          tabIndex={props.active === section.id ? 0 : -1}
          onClick={() => props.onChange(section.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}
