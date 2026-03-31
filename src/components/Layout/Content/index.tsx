import { Sidebar } from "@/components/Layout/Sidebar";
import type { ContentProps } from "@/components/Layout/Content/types";

import { navigationState } from "@/state/NavigationState";
import { observer } from "mobx-react";

export const Content = observer(({ children }: ContentProps) => {
  return (
    <div className={`${navigationState.isSidebarOpen ? "ml-58" : "ml-14"}`}>
      <Sidebar />
      {children}
    </div>
  );
});
