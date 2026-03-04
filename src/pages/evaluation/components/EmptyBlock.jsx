import React from "react";

export default function EmptyBlock({ title = "데이터 없음", desc }) {
  return (
    <div className="empty-card">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="19" stroke="#e2e8f0" strokeWidth="2"/>
        <path d="M14 20h12M20 14v12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  );
}
