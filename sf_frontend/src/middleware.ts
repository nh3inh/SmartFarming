import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Kiểm tra nếu người dùng vào trang gốc "/"
  if (request.nextUrl.pathname === '/') {
    // Chuyển hướng sang "/home"
    return NextResponse.redirect(new URL('/home', request.url))
  }
}

// Cấu hình để middleware chỉ chạy trên các đường dẫn cần thiết
export const config = {
  matcher: [
    /*
     * Match tất cả các request ngoại trừ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}