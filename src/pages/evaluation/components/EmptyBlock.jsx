import React from "react";

export default function EmptyBlock({ title = "데이터 없음", desc }) {
  return (
    <div className="empty-card">
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  );
}