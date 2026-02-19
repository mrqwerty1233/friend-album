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

type PhotoRow = {
  id: string;
  album_id: string;
  storage_path: string;
  note: string | null;
  created_at: string;
};

type Props = {
  userEmail?: string | null;
  initialAlbums?: AlbumRow[];
  initialSweetMessages?: SweetRow[];
};

function uid() {
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
  const [busyAlbumId, setBusyAlbumId] = useState<string | null>(null);

  // create album
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverInputKey, setCoverInputKey] = useState(0);

  // upload photos
  const [albumId, setAlbumId] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [note, setNote] = useState("");
  const [photoInputKey, setPhotoInputKey] = useState(0);

  // manage photos
  const [manageAlbumId, setManageAlbumId] = useState("");
  const [albumPhotos, setAlbumPhotos] = useState<PhotoRow[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const em = data.session?.user?.email ?? null;
      setSessionEmail(em);
      setReady(true);

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

  async function loadPhotosForAlbum(id: string) {
    if (!id) {
      setAlbumPhotos([]);
      return;
    }
    setPhotosLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select("id,album_id,storage_path,note,created_at")
      .eq("album_id", id)
      .order("created_at", { ascending: false });

    setPhotosLoading(false);
    if (error) {
      setStatus(`Load photos failed: ${error.message}`);
      setAlbumPhotos([]);
      return;
    }
    setAlbumPhotos((data ?? []) as PhotoRow[]);
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
    setCoverInputKey((k) => k + 1);

    await refreshAlbums();
    setStatus("Album created.");
  }

  async function uploadPhotos() {
    if (!albumId) return setStatus("Select an album first.");
    if (!photos || photos.length === 0) return setStatus("Choose photo files first.");

    setStatus(`Uploading ${photos.length} photo(s)…`);

    const uploadedPaths: string[] = [];

    for (const file of Array.from(photos)) {
      const ext = file.name.split(".").pop() || "jpg";
      const storage_path = `photos/${albumId}/${uid()}.${ext}`;

      const up = await supabase.storage.from("albums").upload(storage_path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (up.error) return setStatus(`Upload failed: ${up.error.message}`);
      uploadedPaths.push(storage_path);
    }

    const rows = uploadedPaths.map((storage_path) => ({
      album_id: albumId,
      storage_path, // ✅ matches your schema
      note: note.trim() ? note.trim() : null,
    }));

    const ins = await supabase.from("photos").insert(rows);
    if (ins.error) return setStatus(`DB insert failed: ${ins.error.message}`);

    setPhotos(null);
    setNote("");
    setPhotoInputKey((k) => k + 1);

    setStatus("Upload complete.");
    await refreshAlbums();
  }

  async function deletePhoto(p: PhotoRow) {
    const ok = confirm("Delete this photo? This cannot be undone.");
    if (!ok) return;

    setBusyPhotoId(p.id);
    setStatus("Deleting photo…");

    // 1) remove file from Storage (ignore missing-file error)
    const rm = await supabase.storage.from("albums").remove([p.storage_path]);
    if (rm.error) {
      setBusyPhotoId(null);
      return setStatus(`Storage delete failed: ${rm.error.message}`);
    }

    // 2) delete DB row
    const del = await supabase.from("photos").delete().eq("id", p.id);
    if (del.error) {
      setBusyPhotoId(null);
      return setStatus(`DB delete failed: ${del.error.message}`);
    }

    setBusyPhotoId(null);
    setStatus("Photo deleted.");
    await loadPhotosForAlbum(manageAlbumId);
    await refreshAlbums();
  }

  async function deleteAlbum(a: AlbumRow) {
    const ok = confirm(
      `Delete album "${a.title}"?\n\nThis will delete the album, its cover, and ALL photos inside it.`
    );
    if (!ok) return;

    setBusyAlbumId(a.id);
    setStatus("Deleting album…");

    // 1) fetch photos in album (to remove storage objects)
    const { data: photosInAlbum, error: photosErr } = await supabase
      .from("photos")
      .select("id,storage_path")
      .eq("album_id", a.id);

    if (photosErr) {
      setBusyAlbumId(null);
      return setStatus(`Failed to load album photos: ${photosErr.message}`);
    }

    const pathsToRemove = [
      ...(photosInAlbum ?? []).map((r) => r.storage_path).filter(Boolean),
      ...(a.cover_path ? [a.cover_path] : []),
    ];

    // 2) remove storage files (best effort)
    if (pathsToRemove.length) {
      const rm = await supabase.storage.from("albums").remove(pathsToRemove);
      if (rm.error) {
        setBusyAlbumId(null);
        return setStatus(`Storage delete failed: ${rm.error.message}`);
      }
    }

    // 3) delete photo rows
    const delPhotos = await supabase.from("photos").delete().eq("album_id", a.id);
    if (delPhotos.error) {
      setBusyAlbumId(null);
      return setStatus(`Failed to delete photos rows: ${delPhotos.error.message}`);
    }

    // 4) delete album row
    const delAlbum = await supabase.from("albums").delete().eq("id", a.id);
    if (delAlbum.error) {
      setBusyAlbumId(null);
      return setStatus(`Failed to delete album row: ${delAlbum.error.message}`);
    }

    // clean up selection if needed
    if (albumId === a.id) setAlbumId("");
    if (manageAlbumId === a.id) {
      setManageAlbumId("");
      setAlbumPhotos([]);
    }

    setBusyAlbumId(null);
    setStatus("Album deleted.");
    await refreshAlbums();
  }

  function publicUrl(path: string) {
    return supabase.storage.from("albums").getPublicUrl(path).data.publicUrl;
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

      {/* Top actions */}
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
              key={coverInputKey}
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
              key={photoInputKey}
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

      {/* Manage albums (delete) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-white">Manage Albums</div>
            <div className="mt-1 text-xs text-white/60">Delete album will also delete all photos inside it.</div>
          </div>

          <button
            onClick={refreshAlbums}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
          {albums.length === 0 ? (
            <div className="p-4 text-sm text-white/70">No albums yet.</div>
          ) : (
            albums.map((a) => {
              const cover = a.cover_path ? publicUrl(a.cover_path) : null;

              return (
                <div key={a.id} className="flex items-center gap-3 bg-black/20 p-3">
                  <div className="h-12 w-16 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{a.title}</div>
                    {a.subtitle ? <div className="truncate text-xs text-white/60">{a.subtitle}</div> : null}
                    <div className="mt-1 text-[11px] text-white/40">{a.id}</div>
                  </div>

                  <button
                    onClick={() => deleteAlbum(a)}
                    disabled={busyAlbumId === a.id}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {busyAlbumId === a.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Manage photos (delete) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-white">Manage Photos</div>
            <div className="mt-1 text-xs text-white/60">Select an album to view photos and delete them.</div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={manageAlbumId}
              onChange={async (e) => {
                const v = e.target.value;
                setManageAlbumId(v);
                await loadPhotosForAlbum(v);
              }}
              className="min-w-[240px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Select album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => loadPhotosForAlbum(manageAlbumId)}
              disabled={!manageAlbumId}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4">
          {!manageAlbumId ? (
            <div className="text-sm text-white/70">Pick an album to see its photos.</div>
          ) : photosLoading ? (
            <div className="text-sm text-white/70">Loading photos…</div>
          ) : albumPhotos.length === 0 ? (
            <div className="text-sm text-white/70">No photos in this album yet.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {albumPhotos.map((p) => {
                const url = publicUrl(p.storage_path);
                return (
                  <div key={p.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <div className="aspect-[4/3] w-full bg-white/5">
                      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>

                    <div className="space-y-2 p-3">
                      {p.note ? <div className="text-xs text-white/70">{p.note}</div> : null}
                      <div className="truncate text-[11px] text-white/40">{p.storage_path}</div>

                      <button
                        onClick={() => deletePhoto(p)}
                        disabled={busyPhotoId === p.id}
                        className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {busyPhotoId === p.id ? "Deleting…" : "Delete photo"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sweet messages manager */}
      <SweetMessagesPanel initial={initialSweetMessages} />

      {status ? <div className="text-xs text-white/60">{status}</div> : null}
    </div>
  );
}
