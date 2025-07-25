import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Ordens de Serviço",
      path: "/orders", 
      icon: FileText,
    },
    {
      name: "Parâmetros Críticos",
      path: "/parameters",
      icon: AlertTriangle,
    },
    {
      name: "Relatórios",
      path: "/reports",
      icon: BarChart3,
    },
    {
      name: "Indicadores",
      path: "/quality-control",
      icon: BarChart3,
    },
    {
      name: "Usuários",
      path: "/users",
      icon: Users,
    },
    {
      name: "Configurações",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-semibold">OSActive</h2>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-emerald-600 text-white border-r-2 border-emerald-400" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;