"use client";

import { useMemo, useState } from "react";

export default function SurpriseMessageButton({ messages }: { messages: string[] }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState("");

  const pool = useMemo(
    () => (messages.length ? messages : ["You’re the best part of my day."]),
    [messages]
  );

  function pickOne() {
    const msg = pool[Math.floor(Math.random() * pool.length)];
    setPicked(msg);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={pickOne}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
      >
        Surprise me ✨
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0716] p-5 shadow-xl">
            <div className="text-xs tracking-widest text-white/60">A LITTLE NOTE</div>
            <div className="mt-2 text-white/90">{picked}</div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={pickOne}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
              >
                Another
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
