export function SideDock() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/#projects" },
    { label: "Capabilities", href: "/capabilities" },
    { label: "README", href: "/readme" },
    { label: "Contact", href: "/start-a-project" },
  ];

  return (
    <nav
      aria-label="Application dock"
      className="fixed left-2 top-1/2 hidden -translate-y-1/2 flex-col gap-4 rounded-full border border-white/10 bg-[--color-graphite]/80 px-2 py-4 md:flex"
    >
      {items.map((item) => (
        <a key={item.label} href={item.href} title={item.label} className="text-xs">
          {item.label[0]}
        </a>
      ))}
    </nav>
  );
}
