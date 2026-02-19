"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = { id: string; message: string; is_active: boolean; created_at: string };

export default function SweetMessagesPanel({ initial }: { initial: Row[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>(initial);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string>("");

  async function refresh() {
    setStatus("Refreshing…");
    const { data, error } = await supabase
      .from("sweet_messages")
      .select("id,message,is_active,created_at")
      .order("created_at", { ascending: false });

    if (error) return setStatus(error.message);
    setRows((data ?? []) as Row[]);
    setStatus("OK");
  }

  async function add() {
    const msg = text.trim();
    if (!msg) return;

    setStatus("Adding…");
    const { data, error } = await supabase
      .from("sweet_messages")
      .insert({ message: msg, is_active: true })
      .select("id,message,is_active,created_at")
      .single();

    if (error) return setStatus(error.message);
    setRows((prev) => [data as Row, ...prev]);
    setText("");
    setStatus("Added.");
  }

  async function toggle(row: Row) {
    setStatus("Updating…");
    const { error } = await supabase
      .from("sweet_messages")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);

    if (error) return setStatus(error.message);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: !r.is_active } : r)));
    setStatus("OK");
  }

  async function remove(row: Row) {
    setStatus("Deleting…");
    const { error } = await supabase.from("sweet_messages").delete().eq("id", row.id);
    if (error) return setStatus(error.message);
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setStatus("Deleted.");
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-white">Sweet Messages</div>
          <div className="text-xs text-white/60">Shown on landing + Surprise button</div>
        </div>
        <button
          onClick={refresh}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a sweet message…"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
        />
        <button
          onClick={add}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Add
        </button>
      </div>

      {status ? <div className="mt-2 text-xs text-white/60">{status}</div> : null}

      <div className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <div className="text-sm text-white/70">No messages yet.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <div>
                <div className="text-sm text-white/90">{r.message}</div>
                <div className="mt-1 text-xs text-white/50">
                  {r.is_active ? "Active" : "Disabled"}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggle(r)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85 hover:bg-white/10"
                >
                  {r.is_active ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => remove(r)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85 hover:bg-white/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
