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
  Loader2,
  User,
  MessageCircle,
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
import { getUserEmpresas } from "@/actions/userAction";

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
          title: "Falta de Estoque",
          url: "/faltaEstoque",
        },

        {
          title: "Pedidos no ecommerce",
          url: "/orders",
        },

        {
          title: "Notas Fiscais",
          url: "/notas_fiscais",
        },

        {
          title: "Checkout NFe",
          url: "/checkout/nfe",
        },
        {
          title: "Registro de Pacotes",
          url: "/checkout/nfe_registro_cargas",
        },
      ],
    },

    {
      title: "Configuracao",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Produtos Excecao",
          url: "/produto-excecao",
        },

        {
          title: "Configuracao Sistema",
          url: "/configuracao",
        },

        {
          title: "Tabela Preco fixo Kits",
          url: "/produto-preco-kit",
        },
      ],
    },

    {
      title: "Suporte",
      url: "#",
      icon: MessageCircle,
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

let forceUpdate = 0;
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: xuser, isLoading } = useQuery<any>({
    queryKey: ["nav-user", forceUpdate],
    queryFn: async () => await getUser(),
  });

  const { data: empresas, isLoading: isLoadingEmpresas } = useQuery<any>({
    queryKey: ["nav-empresas", isLoading, xuser, xuser?.id],
    queryFn: async () => await getUserEmpresas(xuser?.id),
  });

  if (isLoading || isLoadingEmpresas) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Aguarde...</span>
      </div>
    );
  }

  if (forceUpdate === 0 && xuser?.id) {
    // If forceUpdate is 0 and xuser has an ID, set forceUpdate to
    forceUpdate = xuser?.id || 0; // Ensure force is set to a valid value
  }

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
