import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

type SweetRow = {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
};

type AlbumRow = {
  id: string;
  title: string;
  subtitle: string | null;
  cover_path: string | null;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? null;

  let albums: AlbumRow[] = [];
  let sweet: SweetRow[] = [];

  if (user) {
    const a = await supabase
      .from("albums")
      .select("id,title,subtitle,cover_path,created_at")
      .order("created_at", { ascending: false });

    albums = (a.data ?? []) as AlbumRow[];

    const s = await supabase
      .from("sweet_messages")
      .select("id,message,is_active,created_at")
      .order("created_at", { ascending: false });

    sweet = (s.data ?? []) as SweetRow[];
  }

  return (
    <AdminClient
      userEmail={userEmail}
      initialAlbums={albums}
      initialSweetMessages={sweet}
    />
  );
}
