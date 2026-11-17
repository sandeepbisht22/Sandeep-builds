/**
 * Illustrated stand-ins for each app until real screenshots arrive: drawn in HTML so they
 * stay crisp at any size and follow the site's palette.
 */

const LINE_WIDTHS = ["w-[92%]", "w-[78%]", "w-[86%]", "w-[70%]", "w-[95%]", "w-[82%]"];

function Lines({ count, highlight = -1 }: { count: number; highlight?: number }) {
  return (
    <div className="flex flex-col gap-[0.55em]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`block h-[0.42em] rounded-full ${LINE_WIDTHS[i % LINE_WIDTHS.length]} ${i === highlight ? "bg-lamp/70" : "bg-ink/15"}`}
        />
      ))}
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative mx-auto aspect-[9/18.5] w-[62%] rounded-[2.4em] border-[0.55em] border-[#0d0d12] bg-paper p-[1.2em] text-ink shadow-[0_30px_60px_rgb(3_4_12/0.5)]">
      <span className="absolute left-1/2 top-[0.6em] h-[0.6em] w-[30%] -translate-x-1/2 rounded-full bg-[#0d0d12]" />
      <p className="mt-[1.4em] text-[0.8em] font-bold">Chapter 3</p>
      <div className="mt-[0.8em]">
        <Lines count={6} highlight={3} />
      </div>
      <div className="mt-[0.9em] rounded-[0.7em] bg-ink p-[0.7em] text-[0.62em] leading-snug text-paper">
        <b className="text-lamp">serendipity</b>
        <br />
        finding something good without looking for it
      </div>
      <div className="mt-[0.9em]">
        <Lines count={4} />
      </div>
      <span className="absolute bottom-[1.2em] left-[1.2em] right-[1.2em] rounded-full bg-lamp py-[0.5em] text-center text-[0.62em] font-bold">
        Share with my notes
      </span>
    </div>
  );
}

function WindowMock() {
  const notes = [
    { color: "bg-[#f7d774]", text: "What does Tauri use to draw the UI?", place: "-right-[6%] bottom-0 -rotate-3" },
    { color: "bg-[#f6a6c1]", text: "Name three states in the North-East.", place: "right-[24%] bottom-[22%] rotate-2" },
  ];
  return (
    <div className="relative pb-[2.4em]">
      <div className="overflow-hidden rounded-[0.9em] border border-white/10 bg-[#161829] shadow-[0_30px_60px_rgb(3_4_12/0.5)]">
        <div className="flex items-center gap-[0.4em] bg-[#1e2136] px-[0.8em] py-[0.6em]">
          {["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"].map((c) => (
            <span key={c} className={`h-[0.6em] w-[0.6em] rounded-full ${c}`} />
          ))}
          <span className="ml-[0.6em] text-[0.7em] font-semibold text-paper">Tutor</span>
        </div>
        <div className="grid grid-cols-[38%_1fr] gap-[0.8em] p-[0.9em] text-[0.68em] text-paper">
          <div className="flex flex-col gap-[0.5em]">
            {["Rust ownership", "React effects", "North-East states", "SQL joins"].map((n, i) => (
              <span key={n} className={`rounded-[0.5em] px-[0.6em] py-[0.45em] ${i === 1 ? "bg-lamp text-ink" : "bg-white/6"}`}>
                {n}
              </span>
            ))}
          </div>
          <div className="rounded-[0.6em] bg-white/5 p-[0.8em]">
            <p className="font-bold">React effects</p>
            <div className="mt-[0.6em] opacity-60 [&_span]:bg-paper/25">
              <Lines count={5} />
            </div>
          </div>
        </div>
      </div>
      {notes.map((note) => (
        <div
          key={note.text}
          className={`absolute w-[44%] rounded-[0.3em] p-[0.7em] text-[0.62em] font-bold leading-snug text-ink shadow-[0_12px_24px_rgb(3_4_12/0.45)] ${note.color} ${note.place}`}
        >
          {note.text}
          <span className="mt-[0.5em] block w-fit rounded-full bg-ink px-[0.7em] py-[0.25em] text-[0.9em] text-paper">Answer</span>
        </div>
      ))}
    </div>
  );
}

function BrowserMock() {
  const states = ["Uttarakhand", "Kerala", "Rajasthan", "Assam", "Punjab", "Goa"];
  return (
    <div className="overflow-hidden rounded-[0.9em] border border-white/10 bg-paper text-ink shadow-[0_30px_60px_rgb(3_4_12/0.5)]">
      <div className="flex items-center gap-[0.6em] bg-[#e4dccb] px-[0.8em] py-[0.55em]">
        <span className="h-[0.55em] w-[0.55em] rounded-full bg-ink/25" />
        <span className="flex-1 rounded-full bg-paper px-[0.8em] py-[0.25em] text-[0.62em] text-ink/60">Way in India</span>
      </div>
      <div className="p-[1em]">
        <p className="text-[1.3em] font-black leading-none">Uttarakhand</p>
        <div className="mt-[0.7em] flex flex-wrap gap-[0.35em] text-[0.6em] font-semibold">
          {["Roots", "Culture", "Local knowledge", "Plan a trip"].map((tab, i) => (
            <span key={tab} className={`rounded-full px-[0.8em] py-[0.3em] ${i === 0 ? "bg-ink text-paper" : "bg-ink/10"}`}>
              {tab}
            </span>
          ))}
        </div>
        <div className="mt-[0.9em] grid grid-cols-3 gap-[0.4em]">
          {states.map((state, i) => (
            <span
              key={state}
              className={`rounded-[0.4em] px-[0.5em] pb-[0.5em] pt-[1.6em] text-[0.55em] font-bold ${i === 0 ? "bg-lamp" : "bg-ink/8"}`}
            >
              {state}
            </span>
          ))}
        </div>
        <div className="mt-[0.8em] rounded-[0.6em] bg-ink p-[0.7em] text-[0.62em] text-paper">
          <b>3 days in the Kumaon hills</b>
          <span className="block opacity-60">Plan this trip</span>
        </div>
      </div>
    </div>
  );
}

interface DeviceMockProps {
  slug: string;
  className?: string;
}

export function DeviceMock({ slug, className = "" }: DeviceMockProps) {
  return (
    <div className={`text-[15px] ${className}`} aria-hidden>
      {slug === "book-reader" && <PhoneMock />}
      {slug === "tutor" && <WindowMock />}
      {slug === "way-in-india" && <BrowserMock />}
    </div>
  );
}
