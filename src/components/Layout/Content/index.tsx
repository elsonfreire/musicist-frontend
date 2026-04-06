import { Sidebar } from "@/components/Layout/Sidebar";
import type { ContentProps } from "@/components/Layout/Content/types";

import { navigationState } from "@/state/NavigationState";
import { observer } from "mobx-react";
import { Header } from "@/components/Layout/Header";

export const Content = observer(({ children }: ContentProps) => {
  return (
    <>
      <Header />
      <div className={`${navigationState.isSidebarOpen ? "ml-58" : "ml-14"} mt-2`}>
        <Sidebar />
        {children}
      </div>
    </>
  );
});
