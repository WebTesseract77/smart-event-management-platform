"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Navbar from "@/components/Navbar";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    isDesktop,
    setIsDesktop,
  ] = useState(false);


  // PUBLIC PAGES
  const isPublicRoute =
    publicRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          route + "/"
        )
    );


  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(min-width: 1280px)"
      );

    const updateDesktop = (
      event: MediaQueryListEvent
    ) => {
      setIsDesktop(
        event.matches
      );
    };

    setIsDesktop(
      mediaQuery.matches
    );

    mediaQuery.addEventListener(
      "change",
      updateDesktop
    );

    return () =>
      mediaQuery.removeEventListener(
        "change",
        updateDesktop
      );
  }, []);


  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);


  // NO SIDEBAR / TOPBAR
  // Login, Register, Verify Email etc.
  if (isPublicRoute) {
    return (
      <>
        <Navbar />

        {children}
      </>
    );
  }


  const wrapperPaddingClass =
    sidebarCollapsed
      ? "xl:pl-[88px]"
      : "xl:pl-[280px]";


  return (
    <div className="
      min-h-screen
      bg-[#FAF8F4]
      text-[#183028]
    ">
      
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={
          setSidebarCollapsed
        }
        onClose={() =>
          setSidebarOpen(false)
        }
      />


      <div
        className={`
          transition-all
          duration-300
          ease-in-out
          ${wrapperPaddingClass}
        `}
      >

        <div className="
          flex
          min-h-screen
          flex-col
        ">

          <Topbar
            onMenuClick={() => {
              if (isDesktop) {
                setSidebarCollapsed(
                  (value) => !value
                );
              } else {
                setSidebarOpen(
                  (value) => !value
                );
              }
            }}
          />


          <main
  className="
    flex-1
    px-3
    sm:px-6
    xl:px-8
    py-5
    lg:py-6
  "
>
            <div
  className="
    mx-auto
    w-full
    max-w-[1280px]
    min-w-0
  "
>
              {children}
            </div>
          </main>

        </div>

      </div>

    </div>
  );
}