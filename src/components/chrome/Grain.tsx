/** Film grain over everything. Purely decorative, never intercepts the pointer. */
export function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <div className="grain absolute -inset-[20%]" />
    </div>
  );
}
