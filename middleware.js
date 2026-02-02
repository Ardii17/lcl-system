import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Cek User yang sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. ATURAN JIKA BELUM LOGIN
  // Jika user belum login dan mencoba akses halaman dashboard, tendang ke login
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. ATURAN ROLE (JIKA SUDAH LOGIN)
  if (user) {
    const userRole = user.user_metadata?.role;

    // Jika user adalah 'customer' tapi coba masuk '/dashboard/admin'
    if (
      request.nextUrl.pathname.startsWith("/dashboard/admin") &&
      userRole !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }

    // Jika user adalah 'admin' tapi coba masuk '/dashboard/customer'
    if (
      request.nextUrl.pathname.startsWith("/dashboard/customer") &&
      userRole !== "customer"
    ) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }

    // Jika user sudah login tapi coba buka halaman login/register, arahkan ke dashboard masing-masing
    if (
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register"
    ) {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      } else {
        return NextResponse.redirect(
          new URL("/dashboard/customer", request.url),
        );
      }
    }
  }

  return response;
}

// Tentukan halaman mana saja yang kena efek middleware ini
export const config = {
  matcher: [
    "/dashboard/:path*", // Semua halaman dashboard
    "/login", // Halaman login
    "/register", // Halaman register
  ],
};
