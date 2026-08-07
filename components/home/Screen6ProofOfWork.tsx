export function Screen6ProofOfWork() {
  const lines = [
    "Built a multi-agent AI orchestrator with a live dashboard",
    "Shipped a 3D-driven jewelry e-commerce storefront",
    "Building a cross-office diamond inventory system with document extraction",
    "Developed a native macOS desktop companion app",
  ];

  return (
    <section className="py-16">
      <h2 className="mb-4 font-mono text-sm text-[--color-text-dim]">RECENT OUTPUT</h2>
      <ul className="space-y-2 font-mono text-sm">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
