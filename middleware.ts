import { withAuth } from "next-auth/middleware";

// Any route under /admin/write (and further admin tools you add later)
// requires a valid session — and lib/auth.ts's signIn callback already
// guarantees that session can only belong to the whitelisted email.
export default withAuth({
  pages: {
    signIn: "/admin",
  },
});

export const config = {
  matcher: [
    "/admin/write/:path*",
    "/admin/categories/:path*",
    "/admin/categories",
    "/admin/edit/:path*",
  ],
};
