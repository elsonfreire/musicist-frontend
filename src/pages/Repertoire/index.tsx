import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Content } from "@/components/Layout/Content";
import type { Song, Status, Difficulty } from "./types";
import { 
  AddOutlined, 
  DeleteOutlineOutlined, 
  DragIndicatorOutlined,
  CloseOutlined,
  LibraryMusicOutlined,
  MenuBookOutlined,
  MusicNoteOutlined,
  EmojiEventsOutlined
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

const API_URL = import.meta.env.VITE_REACT_APP_API;


const COLUMNS: { id: Status; label: string; icon: React.ReactNode }[] = [
  { id: "TO_LEARN", label: "Aprender", icon: <MenuBookOutlined fontSize="small" /> },
  { id: "LEARNING", label: "Praticando", icon: <MusicNoteOutlined fontSize="small" /> },
  { id: "LEARNED", label: "Dominada", icon: <EmojiEventsOutlined fontSize="small" /> },
];

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "bg-green-500/20 text-green-400 border border-green-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  HARD: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const difficultyLabels: Record<Difficulty, string> = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
};

export const Repertoire = observer(() => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [songsMap, setSongsMap] = useState<Record<Status, Song[]>>({
    TO_LEARN: [],
    LEARNING: [],
    LEARNED: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("MEDIUM");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  const fetchRepertoire = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/repertoire`, { headers: authHeaders() });
      if (res.ok) {
        const data: Record<string, Song[]> = await res.json();
        setSongsMap({
          TO_LEARN: data["TO_LEARN"] || [],
          LEARNING: data["LEARNING"] || [],
          LEARNED: data["LEARNED"] || [],
        });
      }
    } catch (err) {
      console.error("Erro ao buscar repertório", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepertoire();
  }, []);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim()) return;

    setIsCreating(true);
    try {
      const payload = {
        title: newTitle.trim(),
        artist: newArtist.trim(),
        difficulty: newDifficulty,
        status: "TO_LEARN" as Status 
      };

      const res = await fetch(`${API_URL}/repertoire`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdSong: Song = await res.json();
        setSongsMap(prev => ({
          ...prev,
          TO_LEARN: [createdSong, ...prev.TO_LEARN]
        }));
        setNewTitle("");
        setNewArtist("");
        setNewDifficulty("MEDIUM");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Erro ao adicionar música", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSong = async (id: string, columnId: Status) => {
    setSongsMap(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(s => s.id !== id)
    }));

    try {
      await fetch(`${API_URL}/repertoire/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });
    } catch (err) {
      console.error("Erro ao deletar", err);
      fetchRepertoire(); 
    }
  };

const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceCol = source.droppableId as Status;
    const destCol = destination.droppableId as Status;

    if (sourceCol === destCol && source.index === destination.index) return;

    const startList = Array.from(songsMap[sourceCol]);
    const [movedSong] = startList.splice(source.index, 1);
    
    if (sourceCol === destCol) {
      startList.splice(destination.index, 0, movedSong);
      setSongsMap(prev => ({ ...prev, [sourceCol]: startList }));
    } else {
      const finishList = Array.from(songsMap[destCol]);
      movedSong.status = destCol; 
      finishList.splice(destination.index, 0, movedSong);
      
      setSongsMap(prev => ({
        ...prev,
        [sourceCol]: startList,
        [destCol]: finishList
      }));

      try {
        await fetch(`${API_URL}/repertoire/${draggableId}/status`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status: destCol })
        });
      } catch (err) {
        console.error("Erro ao mover card", err);
        fetchRepertoire(); 
      }
    }
  };

  return (
    <Content>
      <div className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2" style={{ width: "calc(100% + 8px)" }}>
        <div className="max-w-6xl mx-auto space-y-6 text-slate-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/20">
                <LibraryMusicOutlined className="text-white" fontSize="medium" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-100">
                  Seu Repertório Musical
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Organize e acompanhe as músicas que você está aprendendo
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="font-medium bg-orange-600 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors text-white hover:bg-orange-700 h-10 px-4 py-2 w-full sm:w-auto shadow-md"
            >
              <AddOutlined fontSize="small" />
              Adicionar Música
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-orange-600">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {COLUMNS.map((col) => {
                  const cards = songsMap[col.id] || [];
                  return (
                    <div key={col.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex flex-col h-full min-h-[500px]">
                      
                      <div className="flex items-center gap-2 mb-4 px-1">
                        <span className="text-orange-500 flex items-center">{col.icon}</span>
                        <h2 className="font-display font-semibold text-slate-200">{col.label}</h2>
                        <span className="ml-auto bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded-full">
                          {cards.length}
                        </span>
                      </div>

                      <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 rounded-lg transition-colors p-2 -mx-2 ${
                              snapshot.isDraggingOver ? "bg-orange-500/10 border-orange-500/30 border border-dashed" : ""
                            }`}
                          >
                            {cards.map((card, index) => (
                              <Draggable key={card.id} draggableId={card.id} index={index}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    className={`mb-3 bg-slate-800 border border-slate-700 rounded-lg p-3 group transition-shadow ${
                                      snap.isDragging ? "shadow-lg shadow-orange-900/40 rotate-2 z-50 border-orange-500/50" : "hover:border-slate-500"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div 
                                        {...prov.dragHandleProps} 
                                        className="mt-0.5 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing"
                                      >
                                        <DragIndicatorOutlined sx={{ fontSize: 18 }} />
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-200 truncate" title={card.title}>
                                          {card.title}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5" title={card.artist}>
                                          {card.artist}
                                        </p>
                                        <div className="mt-3">
                                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${difficultyStyles[card.difficulty]}`}>
                                            {difficultyLabels[card.difficulty]}
                                          </span>
                                        </div>
                                      </div>

                                      <button 
                                        onClick={() => handleDeleteSong(card.id, col.id)}
                                        className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 p-1"
                                        title="Excluir música"
                                      >
                                        <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-slate-200 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-semibold">Nova Música</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <CloseOutlined fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">Título da música</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Stairway to Heaven"
                  className="w-full h-10 px-3 border border-slate-700 rounded-md text-sm bg-slate-900 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">Artista / Banda</label>
                <input
                  required
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  placeholder="Ex: Led Zeppelin"
                  className="w-full h-10 px-3 border border-slate-700 rounded-md text-sm bg-slate-900 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">Dificuldade</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                  className="w-full h-10 px-3 border border-slate-700 rounded-md text-sm bg-slate-900 text-white focus:outline-none focus:border-orange-500/50"
                >
                  <option value="EASY">🟢 Fácil</option>
                  <option value="MEDIUM">🟡 Médio</option>
                  <option value="HARD">🔴 Difícil</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full font-medium bg-orange-600 inline-flex items-center justify-center gap-2 rounded-md text-sm cursor-pointer transition-colors text-white hover:bg-orange-700 h-10 disabled:opacity-50"
                >
                  {isCreating ? <CircularProgress color="inherit" size={20} /> : "Adicionar ao Repertório"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Content>
  );
});