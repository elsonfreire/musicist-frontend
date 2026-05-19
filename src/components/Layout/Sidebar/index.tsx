import { Divider, Drawer } from "@mui/material";
import {
  DashboardOutlined,
  DoubleArrowRounded,
  MusicNoteOutlined,
  PeopleAltOutlined,
  ChatBubbleOutlineOutlined,
  TrackChangesOutlined, 
  LibraryMusicOutlined,
} from "@mui/icons-material";
import { observer } from "mobx-react";
import { NavLink } from "react-router";
import { navigationState } from "@/state/NavigationState";

export const Sidebar = observer(() => {
  const isDrawerOpen = navigationState.isSidebarOpen;

  const toggleDrawer = () => {
    navigationState.setIsSidebarOpen(!isDrawerOpen);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        "& .MuiDrawer-paper": {
          borderRight: "none",
        },
      }}
      slotProps={{
        paper: {
          className: `transition-all duration-300 ${isDrawerOpen ? "w-56" : "w-12"}`,
        },
      }}
    >
      <div className="flex flex-col justify-between overflow-x-hidden h-full bg-slate-900 px-2 pt-14">
        <nav className="mt-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center w-full py-2 rounded-md text-slate-300 hover:bg-slate-800 ${isDrawerOpen ? "gap-3 px-3 justify-start" : "justify-center px-3 gap-2"} ${isActive && "bg-orange-600 text-white"}`
            }
          >
            <DashboardOutlined className="text-slate-300" fontSize="small" />
            {isDrawerOpen && <span className="text-sm">Dashboard</span>}
          </NavLink>
          <NavLink
            to="/practice"
            className={({ isActive }) =>
              `flex items-center w-full py-2 rounded-md text-slate-300 hover:bg-slate-800 ${isDrawerOpen ? "gap-3 px-3 justify-start" : "justify-center px-3 gap-2"} ${isActive && "bg-orange-600 text-white"}`
            }
          >
            <MusicNoteOutlined className="text-slate-300" fontSize="small" />
            {isDrawerOpen && <span className="text-sm">Prática</span>}
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `flex items-center w-full py-2 rounded-md text-slate-300 hover:bg-slate-800 ${isDrawerOpen ? "gap-3 px-3 justify-start" : "justify-center px-3 gap-2"} ${isActive && "bg-orange-600 text-white"}`
            }
          >
            <TrackChangesOutlined className="text-slate-300" fontSize="small" />
            {isDrawerOpen && <span className="text-sm">Metas</span>}
          </NavLink>
                      <NavLink
              to="/repertoire"
              className={({ isActive }) =>
                `flex items-center w-full py-2 rounded-md text-slate-300 hover:bg-slate-800 ${isDrawerOpen ? "gap-3 px-3 justify-start" : "justify-center px-3 gap-2"} ${isActive && "bg-orange-600 text-white"}`
              }
          >
            <LibraryMusicOutlined className="text-slate-300" fontSize="small" />
            {isDrawerOpen && <span className="text-sm">Repertório</span>}
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) =>
              `flex items-center w-full py-2 rounded-md text-slate-300 hover:bg-slate-800 ${isDrawerOpen ? "gap-3 px-3 justify-start" : "justify-center px-3 gap-2"} ${isActive && "bg-orange-600 text-white"}`
            }
          >
            <PeopleAltOutlined className="text-slate-300" fontSize="small" />
            {isDrawerOpen && <span className="text-sm">Comunidade</span>}
          </NavLink>
          <NavLink
            to="/forum"
            className={({ isActive }) =>
              `flex items-center w-full py-2 rounded-md text-slate-300 hover:bg-slate-800 ${isDrawerOpen ? "gap-3 px-3 justify-start" : "justify-center px-3 gap-2"} ${isActive && "bg-orange-600 text-white"}`
            }
          >
            <ChatBubbleOutlineOutlined className="text-slate-300" fontSize="small" />
            {isDrawerOpen && <span className="text-sm">Fórum</span>}
          </NavLink>
        </nav>
        {isDrawerOpen && <Divider className="text-slate-300" />}
        <div
          className="flex cursor-pointer text-slate-300 mb-4"
          onClick={toggleDrawer}
          title={isDrawerOpen ? "Fechar menu" : "Abrir menu"}
        >
          <DoubleArrowRounded
            className={`transition-transform duration-300 ease-out ${isDrawerOpen ? "rotate-180" : "rotate-0"}`}
          />
          {isDrawerOpen && <p className="ml-3 text-sm">Fechar menu</p>}
        </div>
      </div>
    </Drawer>
  );
});