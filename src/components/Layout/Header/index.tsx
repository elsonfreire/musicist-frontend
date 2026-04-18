import { observer } from "mobx-react";
import { navigationState } from "@/state/NavigationState";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import Popover from "@mui/material/Popover";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Divider } from "@mui/material";
import { userState } from "@/state/UserState";

export const Header = observer(() => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "header-popover" : undefined;

  useEffect(() => {
    userState.fetchUser();
  }, []);

  return (
    <div
      className={`h-14 flex items-center justify-between px-4 bg-slate-800  ${`${navigationState.isSidebarOpen ? "ml-56" : "ml-12"}`} font-bold text-lg font-display text-orange-600`}
    >
      <div>
        {" "}
        <MusicNoteOutlinedIcon />
        Musicist
      </div>
      <button
        className="cursor-pointer"
        aria-describedby={id}
        onClick={handleClick}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5a3b3b] text-orange-400 text-primary text-xs font-bold">
          {userState.user?.username.slice(0, 2).toUpperCase() || ""}
        </span>
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="flex flex-col bg-[#151a37] p-1 border border-[rgb(45,57,83)] roundend">
          <button
            className="text-white cursor-pointer px-2 py-1.5 flex justify-center items-center gap-1.5 hover:opacity-80"
            onClick={() => navigate("/edit-user")}
          >
            <AccountCircleOutlinedIcon fontSize="small" /> Meu perfil
          </button>
          <Divider className="w-full bg-[rgb(45,57,83)]" />
          <button
            className="text-red-500 cursor-pointer px-2 py-1.5 flex justify-start items-center gap-1.5 hover:opacity-80"
            onClick={() => navigate("/")}
          >
            <LogoutOutlinedIcon fontSize="small" /> Sair
          </button>
        </div>
      </Popover>
    </div>
  );
});
