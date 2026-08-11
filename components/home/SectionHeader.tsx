/*
  Shared section rhythm. The index is real ordering information (these sections
  are read top to bottom), so the numbering encodes sequence rather than
  decorating it.
*/
export function SectionHeader({
  index,
  eyebrow,
  title,
}: {
  index: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-10 border-b border-line pb-5">
      <p className="font-mono text-label uppercase text-ink-faint">
        <span className="tabular-nums">{index}</span>
        <span className="mx-3 text-line-bright">/</span>
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-display-sm font-medium text-balance">{title}</h2>
    </div>
  );
}
