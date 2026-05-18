import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router";
import { Content } from "@/components/Layout/Content";

import type { 
  PracticeStats, 
  KanbanStats, 
  GoalsStats, 
  SessionResponse, 
  GoalResponse, 
  StreakResponse 
} from "./types";

import { 
  LocalFireDepartmentOutlined,
  AccessTimeOutlined,
  CalendarMonthOutlined,
  MusicNoteOutlined,
  TrackChangesOutlined,
  ViewColumnOutlined,
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlineOutlined,
  AutoAwesomeOutlined,
  FlagOutlined,
  MenuBookOutlined,
  EmojiEventsOutlined
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

export const Dashboard = observer(() => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_REACT_APP_API;
  
  const [isLoading, setIsLoading] = useState(true);

  const [practiceStats, setPracticeStats] = useState<PracticeStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalMinutes: 0,
    practiceDays: 0,
    last7Days: [],
  });

  const [kanbanStats, setKanbanStats] = useState<KanbanStats>({
    aprender: 0,
    praticando: 0,
    dominada: 0,
  });

  const [goalsStats, setGoalsStats] = useState<GoalsStats>({
    activeGoals: [],
    weeklyTarget: 3,
    weeklyCompletedCount: 0,
    canGenerateMore: true,
  });

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const tokenData = JSON.parse(atob(payloadBase64));
      return tokenData.userId;
    } catch {
      return null;
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const userId = getCurrentUserId();

    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const headers = { "Authorization": `Bearer ${token}` };
    setIsLoading(true);

    try {
      const [sessionsRes, kanbanRes, goalsRes, streakRes] = await Promise.all([
        fetch(`${API_URL}/sessions`, { headers }),
        fetch(`${API_URL}/repertoire`, { headers }),
        fetch(`${API_URL}/goals`, { headers }),
        fetch(`${API_URL}/users/${userId}/streak`, { headers })
      ]);

      if (sessionsRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const sessions: SessionResponse[] = sessionsRes.ok ? await sessionsRes.json() : [];
      const kanbanMap: Record<string, any[]> = kanbanRes.ok ? await kanbanRes.json() : {};
      const pendingGoals: GoalResponse[] = goalsRes.ok ? await goalsRes.json() : [];
      const streakData: StreakResponse = streakRes.ok ? await streakRes.json() : { currentStreak: 0, longestStreak: 0 };
      const totalMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || s.duration || 0), 0);
      
      const uniqueDays = new Set(sessions.map(s => {
        const dateStr = s.date || s.createdAt;
        return dateStr ? dateStr.split("T")[0] : "";
      })).size;

      const last7 = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateString = d.toISOString().split("T")[0];
        
        const minutesOnDay = sessions
          .filter(s => (s.date || s.createdAt)?.startsWith(dateString))
          .reduce((acc, s) => acc + (s.durationMinutes || s.duration || 0), 0);

        return {
          day: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
          minutes: minutesOnDay
        };
      });

      setPracticeStats({
        currentStreak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        totalMinutes: totalMins,
        practiceDays: uniqueDays,
        last7Days: last7,
      });

      setKanbanStats({
        aprender: kanbanMap['to_learn']?.length || 0,
        praticando: kanbanMap['learning']?.length || 0,
        dominada: kanbanMap['learned']?.length || 0,
      });

      const target = 3;
      const completed = Math.max(0, target - pendingGoals.length);

      setGoalsStats({
        activeGoals: pendingGoals.map(g => ({
          id: g.id,
          title: g.title
        })),
        weeklyTarget: target,
        weeklyCompletedCount: completed,
        canGenerateMore: pendingGoals.length === 0,
      });

    } catch (err) {
      console.error("Erro ao buscar dados da dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateGoalStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/goals/${id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Erro ao atualizar meta", err);
    }
  };

  const handleGenerateGoals = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true); 
    try {
      const res = await fetch(`${API_URL}/goals/reset`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok || res.status === 204) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Erro ao gerar metas", err);
    } finally {
      setIsLoading(false);
    }
  };

  const hours = Math.floor(practiceStats.totalMinutes / 60);
  const mins = practiceStats.totalMinutes % 60;
  const weeklyGoalAchieved = goalsStats.weeklyCompletedCount >= goalsStats.weeklyTarget;
  const progressPercent = Math.min(100, (goalsStats.weeklyCompletedCount / goalsStats.weeklyTarget) * 100);
  const maxMinutes = Math.max(...practiceStats.last7Days.map(d => d.minutes), 1);

  return (
    <Content>
      <div className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2" style={{ width: "calc(100% + 8px)" }}>
        
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 text-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-orange-600">
                Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Acompanhe seu progresso musical
              </p>
            </div>
            <button
              onClick={() => navigate("/practice")}
              className="font-medium bg-orange-600 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors text-white hover:bg-orange-700 h-10 px-4 py-2 w-full sm:w-auto"
            >
              <MusicNoteOutlined fontSize="small" />
              Registrar Prática
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16 text-orange-600">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-slate-800 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                  <LocalFireDepartmentOutlined className="text-orange-600 shrink-0" fontSize="medium" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-slate-400">Streak Atual</p>
                    <p className="text-lg md:text-xl font-display font-bold text-slate-200">{practiceStats.currentStreak}d</p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                  <TrackChangesOutlined className="text-orange-500 shrink-0" fontSize="medium" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-slate-400">Maior Streak</p>
                    <p className="text-lg md:text-xl font-display font-bold text-slate-200">{practiceStats.longestStreak}d</p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                  <AccessTimeOutlined className="text-blue-500 shrink-0" fontSize="medium" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-slate-400">Tempo Total</p>
                    <p className="text-lg md:text-xl font-display font-bold text-slate-200">{hours}h {mins}m</p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                  <CalendarMonthOutlined className="text-green-500 shrink-0" fontSize="medium" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-slate-400">Dias Praticados</p>
                    <p className="text-lg md:text-xl font-display font-bold text-slate-200">{practiceStats.practiceDays}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4 md:p-6 flex flex-col">
                  <h2 className="text-base md:text-lg font-display font-semibold mb-4 text-slate-200">
                    Progresso Semanal
                  </h2>
                  <div className="flex-1 flex items-end justify-between gap-2 mt-4 pt-4 border-t border-slate-700/50 min-h-[160px]">
                    {practiceStats.last7Days.map((data, index) => {
                      const heightPercent = data.minutes > 0 ? Math.max((data.minutes / maxMinutes) * 100, 5) : 0;
                      return (
                        <div key={index} className="flex flex-col items-center justify-end h-full w-full group relative">
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-xs text-white px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none">
                            {data.minutes} min
                          </div>
                          <div className="w-full max-w-[40px] bg-slate-900 rounded-t-md flex items-end justify-center h-full">
                            {data.minutes > 0 && (
                              <div 
                                className="w-full bg-orange-600 rounded-t-md transition-all duration-500 hover:bg-orange-500" 
                                style={{ height: `${heightPercent}%` }} 
                              />
                            )}
                          </div>
                          <span className="text-xs text-slate-400 mt-2 font-medium">{data.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base md:text-lg font-display font-semibold text-slate-200 flex items-center gap-2">
                      <AutoAwesomeOutlined fontSize="small" className="text-orange-600" /> 
                      Metas da Semana
                    </h2>
                    <span className="text-xs text-slate-400">
                      {weeklyGoalAchieved
                        ? `${goalsStats.weeklyCompletedCount} concluídas`
                        : `${goalsStats.weeklyCompletedCount}/${goalsStats.weeklyTarget}`}
                    </span>
                  </div>
                  
                  <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden mb-5">
                    <div
                      className="h-full bg-orange-600 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {weeklyGoalAchieved && (
                    <div className="mb-4 p-2 rounded-md bg-green-500/10 border border-green-500/20 text-xs text-center flex items-center justify-center gap-1 text-green-400">
                      <CheckCircleOutlineOutlined fontSize="small" />
                      Objetivo da semana cumprido!
                    </div>
                  )}

                  <div className="space-y-3">
                    {goalsStats.activeGoals.length === 0 && !goalsStats.canGenerateMore && (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Todas as metas concluídas!
                      </p>
                    )}
                    
                    {goalsStats.canGenerateMore && (
                      <div className="text-center py-2">
                        <p className="text-sm text-slate-400 mb-3">
                          Quer ir além? Gere novas metas usando IA.
                        </p>
                        <button
                          onClick={handleGenerateGoals}
                          className="font-medium border border-orange-600 text-orange-500 bg-transparent hover:bg-orange-600 hover:text-white transition-colors inline-flex items-center justify-center gap-2 rounded-md text-xs h-8 px-4"
                        >
                          Gerar novas metas
                        </button>
                      </div>
                    )}

                    {goalsStats.activeGoals.map((g: any) => (
                      <div key={g.id} className="p-3 rounded-md bg-slate-900 border border-slate-700 hover:border-orange-500/30 transition-colors group">
                        <div className="flex items-start gap-2">
                          <span className="text-orange-500 shrink-0 mt-0.5"><FlagOutlined fontSize="small" /></span>
                          <p className="text-sm text-slate-200 flex-1">{g.title}</p>
                        </div>
                        <div className="flex gap-2 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            className="h-7 px-2 text-xs text-orange-500 hover:bg-orange-600/20 rounded transition-colors flex items-center gap-1"
                            onClick={() => handleUpdateGoalStatus(g.id, "completed")}
                          >
                            <CheckOutlined fontSize="small" /> Concluir
                          </button>
                          <button
                            className="h-7 px-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors flex items-center gap-1"
                            onClick={() => handleUpdateGoalStatus(g.id, "rejected")}
                          >
                            <CloseOutlined fontSize="small" /> Recusar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base md:text-lg font-display font-semibold text-slate-200 flex items-center gap-2">
                    <ViewColumnOutlined fontSize="small" className="text-slate-400" />
                    Seu Repertório Musical
                  </h2>
                  <button 
                    onClick={() => navigate("/repertoire")} 
                    className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
                  >
                    Ver tudo →
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="text-center p-4 rounded-md bg-slate-900 border border-slate-700">
                    <p className="text-xs md:text-sm text-slate-400 mb-1 flex items-center justify-center gap-1"><MenuBookOutlined fontSize="inherit" /> Aprender</p>
                    <p className="text-2xl font-bold text-slate-200">{kanbanStats.aprender}</p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-slate-900 border border-slate-700">
                    <p className="text-xs md:text-sm text-slate-400 mb-1 flex items-center justify-center gap-1"><MusicNoteOutlined fontSize="inherit" /> Praticando</p>
                    <p className="text-2xl font-bold text-slate-200">{kanbanStats.praticando}</p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-slate-900 border border-slate-700">
                    <p className="text-xs md:text-sm text-slate-400 mb-1 flex items-center justify-center gap-1"><EmojiEventsOutlined fontSize="inherit" /> Dominada</p>
                    <p className="text-2xl font-bold text-slate-200">{kanbanStats.dominada}</p>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </Content>
  );
});