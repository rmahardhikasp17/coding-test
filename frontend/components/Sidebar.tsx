import { NavLink } from "react-router-dom";
import { Users, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Users", href: "/users", icon: Users },
  { name: "Products", href: "/products", icon: Package },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
