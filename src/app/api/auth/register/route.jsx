import supabaseAdmin from "@/lib/supabase-admin";
import supabasePublic from "@/lib/supabase-public";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, nama, email, password } = body;

    // 1. Validasi input field wajib
    if (!username || !nama || !email || !password) {
      return Response.json(
        { success: false, message: "Semua field wajib diisi!" },
        { status: 400 }
      );
    }

    // 2. Daftarkan ke Supabase Auth (auth.users)
    const { data: authData, error: authError } = await supabasePublic.auth.signUp({
      email: email,
      password: password,
    });

    if (authError || !authData.user) {
      return Response.json(
        { success: false, message: authError?.message || "Gagal membuat akun auth" },
        { status: 400 }
      );
    }

    // 3. Masukkan data ke tabel public.profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          username: username,
          nama: nama,
          email: email,
          role: "customer",
        },
      ]);

    if (profileError) {
      // Rollback user auth jika pembuatan profile gagal agar data tidak inkonsisten
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return Response.json(
        { success: false, message: "Gagal membuat profile: " + profileError.message },
        { status: 400 }
      );
    }

    return Response.json(
      { success: true, message: "Registrasi berhasil!" },
      { status: 201 }
    );

  } catch (error) {
    return Response.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}