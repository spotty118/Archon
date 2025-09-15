import { BookOpen, Settings } from "lucide-react";
import type React from "react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../features/ui/primitives/tooltip";
// TEMPORARY: Use old SettingsContext until settings are migrated
import { useSettings } from "../../hooks/useSettings";
import { cn } from "../../lib/utils";

interface NavigationItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  enabled?: boolean;
}

interface NavigationProps {
  className?: string;
}

/**
 * Modern navigation component using Radix UI patterns
 * No fixed positioning - parent controls layout
 */
export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  const { projectsEnabled } = useSettings();

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    {
      path: "/",
      icon: <BookOpen className="h-5 w-5" />,
      label: "Knowledge Base",
      enabled: true,
    },
    {
      path: "/mcp",
      icon: (
        <svg
          fill="currentColor"
          fillRule="evenodd"
          height="20"
          width="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="MCP Server Icon"
        >
          <path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z" />
          <path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z" />
        </svg>
      ),
      label: "MCP Server",
      enabled: true,
    },
    {
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      enabled: true,
    },
  ];

  const isProjectsActive = location.pathname.startsWith("/projects");

  return (
    <nav
      className={cn(
        "flex flex-col items-center gap-6 py-6 px-3",
        "rounded-xl w-[72px] glass-card",
        className,
      )}
    >
      {/* Logo - Always visible, conditionally clickable for Projects */}
      <Tooltip>
        <TooltipTrigger asChild>
          {projectsEnabled ? (
            <Link
              to="/projects"
              className={cn(
                "relative p-2 rounded-lg",
                "flex items-center justify-center",
                "hover:bg-blue-500/10",
                isProjectsActive && [
                  "bg-blue-500/20",
                ],
              )}
            >
              <img
                src="/logo-neon.png"
                alt="Archon"
                className="w-8 h-8"
              />
            </Link>
          ) : (
            <div className="p-2 rounded-lg opacity-50 cursor-not-allowed">
              <img src="/logo-neon.png" alt="Archon" className="w-8 h-8 grayscale" />
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{projectsEnabled ? "Project Management" : "Projects Disabled"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Separator */}
      <div className="w-8 h-px bg-gray-300 dark:bg-gray-700" />

      {/* Navigation Items */}
      <nav className="flex flex-col gap-4">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isEnabled = item.enabled !== false;

          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={isEnabled ? item.path : "#"}
                  className={cn(
                    "relative p-3 rounded-lg",
                    "flex items-center justify-center",
                    isActive
                      ? [
                          "bg-blue-500/20",
                          "text-blue-600 dark:text-blue-400",
                        ]
                      : [
                          "text-gray-500 dark:text-zinc-500",
                          "hover:text-blue-600 dark:hover:text-blue-400",
                          "hover:bg-blue-500/10",
                        ],
                    !isEnabled && "opacity-50 cursor-not-allowed pointer-events-none",
                  )}
                  onClick={(e) => {
                    if (!isEnabled) {
                      e.preventDefault();
                    }
                  }}
                >
                  {item.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </nav>
  );
}
