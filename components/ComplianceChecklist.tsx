import React from "react";

export type ComplianceStatus = "ok" | "warn" | "err";
export type Check = {
  label: string;
  status: ComplianceStatus;
  hint?: string;
};

export function ComplianceChecklist({ checks }: { checks: Check[] }) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Compliance</h3>
        <div className="muted">DV 600?600 JPEG ? 240KB</div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
        {checks.map((c, idx) => (
          <li key={idx} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
            <span className={c.status} style={{ minWidth: 20 }}>
              {c.status === "ok" ? "?" : c.status === "warn" ? "!" : "?"}
            </span>
            <div>
              <div>{c.label}</div>
              {c.hint && <div className="muted" style={{ fontSize: 12 }}>{c.hint}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

