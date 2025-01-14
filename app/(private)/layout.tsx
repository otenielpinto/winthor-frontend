import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ReactNode } from "react";
import { Suspense } from "react";

interface PrivateLayoutProps {
  children: ReactNode;
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <>
      <aside>
        <Suspense>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-1 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                </div>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Suspense>{children}</Suspense>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </Suspense>
      </aside>
    </>
  );
}

//olhar o projeto desenvolvido com Daniel sobre os elementos de uma pagina template com o projeto onFood ;

{
  {
    /* <div className="flex h-screen flex-col lg:flex-row">
</div> */
  }

  /* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

<div className="grid auto-rows-min gap-4 md:grid-cols-3">
  <div className="aspect-video rounded-xl bg-muted/50" />
  <div className="aspect-video rounded-xl bg-muted/50" />
  <div className="aspect-video rounded-xl bg-muted/50" />
</div>
<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
</div> */
}
