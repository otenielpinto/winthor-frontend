"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/hooks/useUser";
import { getUserEmpresas } from "@/actions/actUser";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Vendas",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },

        {
          title: "Pedidos no ecommerce",
          url: "/orders",
        },

        {
          title: "Notas Fiscais",
          url: "/notas_fiscais",
        },
      ],
    },
    {
      title: "Suporte",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Chat",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: xuser, isLoading } = useQuery<any>({
    queryKey: ["nav-user"],
    queryFn: async () => await getUser(),
  });

  const { data: empresas, isLoading: isLoadingEmpresas } = useQuery<any>({
    queryKey: ["nav-empresas", isLoading, xuser, xuser?.id],
    queryFn: async () => await getUserEmpresas(xuser?.id),
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={isLoadingEmpresas ? [] : empresas} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={xuser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
