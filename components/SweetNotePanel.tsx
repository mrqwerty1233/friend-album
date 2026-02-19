import { createClient } from "@/lib/supabase/server";
import RandomSweetMessage from "@/components/RandomSweetMessage";
import SurpriseMessageButton from "@/components/SurpriseMessageButton";

const FALLBACK = [
  "You make ordinary days feel like magic.",
  "You’re my favorite place to be.",
  "Thank you for being you.",
  "You’re the best part of my day.",
];

export default async function SweetNotePanel() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sweet_messages")
    .select("message")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const messages =
    (data ?? [])
      .map((r) => r.message)
      .filter((m): m is string => typeof m === "string" && m.trim().length > 0);

  const finalMessages = messages.length ? messages : FALLBACK;

  return (
    <div className="space-y-3">
      <RandomSweetMessage messages={finalMessages} />
      <div className="flex justify-end">
        <SurpriseMessageButton messages={finalMessages} />
      </div>

      {error ? (
        <div className="text-xs text-white/40">Sweet messages load error: {error.message}</div>
      ) : null}
    </div>
  );
}
