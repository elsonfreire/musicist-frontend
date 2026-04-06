import { observer } from "mobx-react";
import { navigationState } from "@/state/NavigationState";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";

export const Header = observer(() => {
  return (
    <div
      className={`h-14 flex items-center justify-between px-4 bg-slate-800  ${`${navigationState.isSidebarOpen ? "ml-56" : "ml-12"}`} font-bold text-lg font-display text-orange-600`}
    >
      <div>
        {" "}
        <MusicNoteOutlinedIcon />
        Musicist
      </div>
      <div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-900 text-primary text-xs font-bold">
          TD
        </span>
      </div>
    </div>
  );
});
