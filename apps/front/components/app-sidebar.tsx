import type * as React from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { LogoHeader } from "@/components/ui/navbar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { PAGES } from "@/constants/pages"

const navMain = [
  {
    title: "API Reference",
    url: "#",
    items: [
      {
        title: "Games",
        url: PAGES.ADMIN_GAMES,
      },
      {
        title: "Sphericals",
        url: PAGES.ADMIN_SPHERICAL,
      },
    ],
  },
  // {
  //   title: "Getting Started",
  //   url: "#",
  //   items: [
  //     {
  //       title: "Installation",
  //       url: "#",
  //     },
  //     {
  //       title: "Project Structure",
  //       url: "#",
  //     },
  //   ],
  // },
  // {
  //   title: "Building Your Application",
  //   url: "#",
  //   items: [
  //     {
  //       title: "Routing",
  //       url: "#",
  //     },
  //     {
  //       title: "Data Fetching",
  //       url: "#",
  //       isActive: true,
  //     },
  //     {
  //       title: "Rendering",
  //       url: "#",
  //     },
  //     {
  //       title: "Caching",
  //       url: "#",
  //     },
  //     {
  //       title: "Styling",
  //       url: "#",
  //     },
  //     {
  //       title: "Optimizing",
  //       url: "#",
  //     },
  //     {
  //       title: "Configuring",
  //       url: "#",
  //     },
  //     {
  //       title: "Testing",
  //       url: "#",
  //     },
  //     {
  //       title: "Authentication",
  //       url: "#",
  //     },
  //     {
  //       title: "Deploying",
  //       url: "#",
  //     },
  //     {
  //       title: "Upgrading",
  //       url: "#",
  //     },
  //     {
  //       title: "Examples",
  //       url: "#",
  //     },
  //   ],
  // },
  // {
  //   title: "Architecture",
  //   url: "#",
  //   items: [
  //     {
  //       title: "Accessibility",
  //       url: "#",
  //     },
  //     {
  //       title: "Fast Refresh",
  //       url: "#",
  //     },
  //     {
  //       title: "Next.js Compiler",
  //       url: "#",
  //     },
  //     {
  //       title: "Supported Browsers",
  //       url: "#",
  //     },
  //     {
  //       title: "Turbopack",
  //       url: "#",
  //     },
  //   ],
  // },
  // {
  //   title: "Community",
  //   url: "#",
  //   items: [
  //     {
  //       title: "Contribution Guide",
  //       url: "#",
  //     },
  //   ],
  // },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <LogoHeader href={PAGES.ADMIN} className="p-4" />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              >
                <CollapsibleTrigger>
                  {item.title}
                  {" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link href={item.url}>{item.title}</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
