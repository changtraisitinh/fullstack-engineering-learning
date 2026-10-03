import type { ReactNode } from 'react';

/**
 * Business-space building blocks (issue #17). Every rule written with these must trace back to a
 * section of the backend DESIGN.md — no invented numbers. `source` names that section/legal basis.
 */
export function Status({ live }: { live: boolean }) {
  return <span className={`biz-status ${live ? 'live' : 'soon'}`}>{live ? 'Đã có' : 'Sắp có'}</span>;
}

export function Feature({
  name,
  live = true,
  what,
  rules,
  source,
}: {
  name: string;
  live?: boolean;
  what: ReactNode;
  rules?: ReactNode[];
  source?: ReactNode;
}) {
  return (
    <div className="biz-feature">
      <h3>
        {name} <Status live={live} />
      </h3>
      <p className="biz-what">{what}</p>
      {rules && rules.length > 0 && (
        <>
          <strong style={{ fontSize: 13 }}>Quy tắc nghiệp vụ</strong>
          <ul>
            {rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}
      {source && <p className="biz-source">Căn cứ: {source}</p>}
    </div>
  );
}
