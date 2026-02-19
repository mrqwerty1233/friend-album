"use client";

function dayKeyLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function RandomSweetMessage({ messages }: { messages: string[] }) {
  const key = dayKeyLocal();
  const idx = messages.length ? hashString(key) % messages.length : 0;
  const message = messages[idx] ?? "You’re the best part of my day.";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="text-xs tracking-widest text-white/60">TODAY&apos;S SWEET NOTE</div>
      <div className="mt-2 text-white/90">{message}</div>
    </div>
  );
}
