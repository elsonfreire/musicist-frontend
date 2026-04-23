import { 
  AccountCircleOutlined, 
  LocalFireDepartmentOutlined, 
  PlaceOutlined, 
  MusicNoteOutlined, 
  PersonAddOutlined,
  PersonRemoveOutlined 
} from "@mui/icons-material";
import type { UserResponse } from "@/pages/Community/types"; 

const levelColors: Record<string, string> = {
  beginner: "bg-green-900/50 text-green-400",
  intermediate: "bg-yellow-900/50 text-yellow-400",
  advanced: "bg-orange-900/50 text-orange-400",
  pro: "bg-red-900/50 text-red-400",
};

const getScoreStyles = (score: number) => {
  if (score >= 8) {
    return "bg-orange-500/20 text-orange-500 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.15)]";
  }
  if (score >= 4) {
    return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
  }
  return "bg-slate-800 text-slate-400 border-slate-700";
};

interface MusicianCardProps {
  user: UserResponse;
  score?: number;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
}

export const MusicianCard = ({ user, score, onAddFriend, onRemoveFriend }: MusicianCardProps) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 md:p-5 flex flex-col justify-between h-full transition-colors hover:bg-slate-800/80 border border-slate-700/50">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-900 flex items-center justify-center text-orange-600 shrink-0 border border-slate-700">
              <AccountCircleOutlined fontSize="medium" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-slate-200 truncate">@{user.username}</h3>
              <p className="text-sm text-slate-400 capitalize truncate">{user.instrument}</p>
            </div>
          </div>
          
          {/* 2. Aplicando a função dinâmica de cores aqui na tag do Score! */}
          {score !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-all ${getScoreStyles(score)}`}>
              <LocalFireDepartmentOutlined fontSize="small" sx={{ fontSize: 14 }} />
              {score}/10
            </div>
          )}
          
        </div>

        {user.bio && (
          <p className="text-sm text-slate-400 line-clamp-2 mt-1">{user.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {user.city && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
              <PlaceOutlined sx={{ fontSize: 12 }} className="text-orange-600" /> {user.city}
            </span>
          )}
          {user.favoriteGenre && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
              <MusicNoteOutlined sx={{ fontSize: 12 }} className="text-orange-600" /> {user.favoriteGenre}
            </span>
          )}
          {user.level && (
            <span className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-slate-700 ${levelColors[user.level.toLowerCase()] || 'bg-slate-900 text-slate-300'}`}>
              {user.level}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {onAddFriend && (
          <button 
            onClick={onAddFriend}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-600 text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500 transition-colors py-2 rounded-md text-sm font-semibold"
          >
            <PersonAddOutlined fontSize="small" /> Adicionar
          </button>
        )}

        {onRemoveFriend && (
          <button 
            onClick={onRemoveFriend}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-900/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 transition-colors py-2 rounded-md text-sm font-semibold"
          >
            <PersonRemoveOutlined fontSize="small" /> Desfazer Amizade
          </button>
        )}
      </div>
    </div>
  );
};