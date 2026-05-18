import { useState, useEffect } from "react";
import { Content } from "@/components/Layout/Content";
import { 
  WhatshotOutlined, 
  AccessTimeOutlined, 
  DeleteOutline, 
  AddOutlined 
} from "@mui/icons-material";
import { useNavigate } from "react-router";

import type { PracticeLog } from "./types";

const instruments: Record<string, string> = {
  "Guitarra": "ELECTRIC_GUITAR",
  "Piano": "PIANO",
  "Baixo": "BASS",
  "Bateria": "DRUMS",
  "Violão": "GUITAR",
  "Violino": "VIOLIN", 
  "Outro": "OTHER"
};

export const Practice = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_REACT_APP_API;

  const [logs, setLogs] = useState<PracticeLog[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0); 
  const [instrument, setInstrument] = useState("Guitarra");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  
  useEffect(() => {
    fetchLogs();
    fetchStreak(); 
  }, []);

  const fetchStreak = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payloadBase64 = token.split('.')[1]; 
      const tokenData = JSON.parse(atob(payloadBase64)); 
      const userId = tokenData.userId;

      const response = await fetch(`${API_URL}/users/${userId}/streak`, {
        headers: { 
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const streakData = await response.json();
        setCurrentStreak(streakData.currentStreak || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar a ofensiva:", error);
    }
  };

  const fetchLogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sessions`, {
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
      });

      if (response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        const formattedLogs = data.map((log: any) => ({
          id: log.id,
          instrument: Object.keys(instruments).find((key) => instruments[key] === log.instrument) || "Other",
          duration: log.durationMinutes || log.duration || 0,
          date: log.date,
          notes: log.notes
        }));
        
        setLogs(formattedLogs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || !instrument) return;
    
    const token = localStorage.getItem("token");
    const payload = {
      instrument: instruments[instrument], 
      durationMinutes: parseInt(duration),
      date: date,
      notes: notes || undefined
    };

    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchLogs();
        fetchStreak(); 
        setDuration("");
        setNotes("");
      }
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  };

  const deleteLog = async (id: number) => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${API_URL}/sessions/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        setLogs(logs.filter((log) => log.id !== id));
        fetchStreak(); 
      }
    } catch (error) {
      console.error("Erro ao deletar sessão:", error);
    }
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const logsThisWeek = logs.filter(log => new Date(log.date) >= sevenDaysAgo);
  const weeklyMinutes = logsThisWeek.reduce((acc, log) => acc + log.duration, 0);
  const avgPerDay = Math.round(weeklyMinutes / 7) || 0;

  return (
    <Content>
      <div  className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2" style={{ width: "calc(100% + 8px)" }}>
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 text-slate-300">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-orange-600">
            Prática Musical
          </h1>

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-slate-800 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <WhatshotOutlined className="text-orange-600 shrink-0" fontSize="medium" />
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-400">Streak</p>
                <p className="text-lg md:text-xl font-display font-bold text-slate-200">{currentStreak}d</p>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <AccessTimeOutlined className="text-orange-500 shrink-0" fontSize="medium" />
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-400">Semana</p>
                <p className="text-lg md:text-xl font-display font-bold text-slate-200">{weeklyMinutes}m</p>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <AccessTimeOutlined className="text-slate-500 shrink-0" fontSize="medium" />
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-400">Média/dia</p>
                <p className="text-lg md:text-xl font-display font-bold text-slate-200">{avgPerDay}m</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">         
            <div className="bg-slate-800 rounded-lg p-4 md:p-6">
              <h2 className="text-base md:text-lg font-display font-semibold mb-4 flex items-center gap-2 text-slate-200">
                <AddOutlined className="text-orange-600" fontSize="small" /> Registrar Sessão
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Instrumento</label>
                  <select 
                    value={instrument} 
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full bg-slate-900 text-slate-300 border-none rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-orange-600"
                  >
                    {Object.keys(instruments).map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Duração (min)</label>
                    <input 
                      type="number" 
                      min={1} 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)} 
                      placeholder="30" 
                      className="w-full bg-slate-900 text-slate-300 border-none rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-orange-600 placeholder:text-slate-600" 
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Data</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="w-full bg-slate-900 text-slate-300 border-none rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-orange-600 [color-scheme:dark]" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Notas (opcional)</label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="O que você praticou..." 
                    rows={2} 
                    className="w-full bg-slate-900 text-slate-300 border-none rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-orange-600 placeholder:text-slate-600 resize-none" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold py-2.5 rounded-md mt-2"
                >
                  Salvar Sessão
                </button>
              </form>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 md:p-6">
              <h2 className="text-base md:text-lg font-display font-semibold mb-4 text-slate-200">Histórico</h2>
              <div className="space-y-2 max-h-80 overflow-auto pr-2">
                {logs.length === 0 ? (
                  <p className="text-slate-400 text-sm">Nenhuma sessão registrada ainda.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-slate-900">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-amber-900 flex items-center justify-center text-orange-500 text-xs md:text-sm font-bold shrink-0">
                          {log.duration}m
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{log.instrument}</p>
                          <p className="text-xs text-slate-400 truncate">{log.date}{log.notes ? ` • ${log.notes}` : ""}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteLog(log.id)} 
                        className="text-slate-500 hover:text-red-500 hover:bg-slate-800 h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-colors"
                      >
                        <DeleteOutline fontSize="small" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Content>
  );
};