"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SweetMessagesPanel from "./SweetMessagesPanel";

type SweetRow = { id: string; message: string; is_active: boolean; created_at: string };

type AlbumRow = {
  id: string;
  title: string;
  subtitle: string | null;
  cover_path: string | null;
  created_at?: string;
};

type Props = {
  userEmail?: string | null;
  initialAlbums?: AlbumRow[];
  initialSweetMessages?: SweetRow[];
};

function uid() {
  // crypto.randomUUID exists in modern browsers
  // fallback for older environments
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

export default function AdminClient({
  userEmail = null,
  initialAlbums = [],
  initialSweetMessages = [],
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [sessionEmail, setSessionEmail] = useState<string | null>(userEmail);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<string>("");

  // auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // albums
  const [albums, setAlbums] = useState<AlbumRow[]>(initialAlbums);

  // create album
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // upload photos
  const [albumId, setAlbumId] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const em = data.session?.user?.email ?? null;
      setSessionEmail(em);
      setReady(true);

      // load albums for dropdown
      if (em) await refreshAlbums();
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const em = session?.user?.email ?? null;
      setSessionEmail(em);
      if (em) refreshAlbums();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshAlbums() {
    setStatus("Refreshing albums…");
    const { data, error } = await supabase
      .from("albums")
      .select("id,title,subtitle,cover_path,created_at")
      .order("created_at", { ascending: false });

    if (error) return setStatus(`Albums refresh failed: ${error.message}`);
    setAlbums((data ?? []) as AlbumRow[]);
    setStatus("OK");
  }

  async function signIn() {
    setStatus("Signing in…");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) return setStatus(error.message);

    setSessionEmail(data.user?.email ?? null);
    setStatus("Signed in.");
    await refreshAlbums();
  }

  async function signOut() {
    setStatus("Signing out…");
    const { error } = await supabase.auth.signOut();
    if (error) return setStatus(error.message);
    setSessionEmail(null);
    setStatus("Signed out.");
  }

  async function createAlbum() {
    const t = title.trim();
    if (!t) return setStatus("Title is required.");

    setStatus("Creating album…");

    const { data: album, error: insertErr } = await supabase
      .from("albums")
      .insert({
        title: t,
        subtitle: subtitle.trim() ? subtitle.trim() : null,
        cover_path: null,
      })
      .select("id,title,subtitle,cover_path,created_at")
      .single();

    if (insertErr || !album) return setStatus(insertErr?.message ?? "Album insert failed.");

    // upload cover (optional)
    if (coverFile) {
      setStatus("Uploading cover…");
      const ext = coverFile.name.split(".").pop() || "jpg";
      const path = `covers/${album.id}/${uid()}.${ext}`;

      const up = await supabase.storage.from("albums").upload(path, coverFile, {
        cacheControl: "3600",
        upsert: false,
      });

      if (up.error) return setStatus(`Cover upload failed: ${up.error.message}`);

      const upd = await supabase.from("albums").update({ cover_path: path }).eq("id", album.id);
      if (upd.error) return setStatus(`Cover save failed: ${upd.error.message}`);
    }

    setTitle("");
    setSubtitle("");
    setCoverFile(null);

    await refreshAlbums();
    setStatus("Album created.");
  }

  async function uploadPhotos() {
    if (!albumId) return setStatus("Select an album first.");
    if (!photos || photos.length === 0) return setStatus("Choose photo files first.");

    setStatus(`Uploading ${photos.length} photo(s)…`);

    // 1) upload to storage
    const uploadedPaths: string[] = [];

    for (const file of Array.from(photos)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `photos/${albumId}/${uid()}.${ext}`;

      const up = await supabase.storage.from("albums").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (up.error) return setStatus(`Upload failed: ${up.error.message}`);
      uploadedPaths.push(path);
    }

    // 2) insert photo rows
    // If your column is not named "note", remove note or rename to your column name.
    const rows = uploadedPaths.map((path) => ({
      album_id: albumId,
      path,
      ...(note.trim() ? { note: note.trim() } : {}),
    }));

    const ins = await supabase.from("photos").insert(rows);
    if (ins.error) return setStatus(`DB insert failed: ${ins.error.message}`);

    setPhotos(null);
    setNote("");
    setStatus("Upload complete.");
    await refreshAlbums();
  }

  if (!ready) return null;

  // Not signed in UI
  if (!sessionEmail) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-1 text-sm text-white/70">Sign in to create albums and upload photos.</p>
        </div>

        <div className="max-w-lg rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />

            <button
              onClick={signIn}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Sign in
            </button>

            {status ? <div className="text-xs text-white/60">{status}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  // Signed in UI
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-1 text-sm text-white/70">Signed in as: {sessionEmail}</p>
        </div>

        <button
          onClick={signOut}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
        >
          Sign out
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Create album */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="font-semibold text-white">Create Album</div>

          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Album title"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle (optional)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-white/70"
            />

            <button
              onClick={createAlbum}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Create
            </button>
          </div>
        </div>

        {/* Upload photos */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="font-semibold text-white">Upload Photos</div>

          <div className="mt-4 space-y-3">
            <select
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Select an album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(e.target.files)}
              className="w-full text-sm text-white/70"
            />

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (applies to uploaded photos)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={uploadPhotos}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
              >
                Upload
              </button>
              <button
                onClick={refreshAlbums}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sweet messages manager */}
      <SweetMessagesPanel initial={initialSweetMessages} />

      {status ? <div className="text-xs text-white/60">{status}</div> : null}
    </div>
  );
}
