import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? `${(user.firstName?.[0] ?? user.email[0]).toUpperCase()}`
    : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            MO Marketplace
          </Link>

          <nav className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">Products</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/products/new">
                  <Button size="sm">+ New Product</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" className="rounded-full" />}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
                      {user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
