import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router";
import { Content } from "@/components/Layout/Content";

import type { GoalResponse, GoalsState } from "./types";

import { 
  TrackChangesOutlined,
  CheckOutlined, 
  CloseOutlined, 
  CheckCircleOutlineOutlined,
  AutoAwesomeOutlined
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

const API_URL = import.meta.env.VITE_REACT_APP_API;

export const Goals = observer(() => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<GoalsState>({
    activeGoals: [],
    completedGoals: [],
    weeklyTarget: 3,
    weeklyCompletedCount: 0,
  });

  const fetchGoalsData = async (silent = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { "Authorization": `Bearer ${token}` };
    if (!silent) setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/goals`, { headers });
      
      if (res.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (res.ok) {
        const pendingGoals: GoalResponse[] = await res.json();
        const target = 3;
        const computedCompleted = Math.max(0, target - pendingGoals.length);

        setState(prev => ({
          ...prev,
          activeGoals: pendingGoals,
          weeklyCompletedCount: prev.completedGoals.length > 0 ? prev.weeklyCompletedCount : computedCompleted
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar metas:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "COMPLETED" | "REJECTED") => {
    const token = localStorage.getItem("token");
    const goalToMove = state.activeGoals.find(g => g.id === id);
    if (!goalToMove) return;

    setState(prev => {
      const filteredActive = prev.activeGoals.filter(g => g.id !== id);
      const newCompletedList = newStatus === "COMPLETED" 
        ? [...prev.completedGoals, { ...goalToMove, status: newStatus }]
        : prev.completedGoals;

      return {
        ...prev,
        activeGoals: filteredActive,
        completedGoals: newCompletedList,
        weeklyCompletedCount: Math.min(prev.weeklyTarget, prev.weeklyCompletedCount + (newStatus === "COMPLETED" ? 1 : 0))
      };
    });

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
        fetchGoalsData(true);
      }
    } catch (err) {
      console.error("Erro ao atualizar status da meta:", err);
      fetchGoalsData();
    }
  };

  const progressPercent = Math.min(100, (state.weeklyCompletedCount / state.weeklyTarget) * 100);
  const weeklyGoalAchieved = state.weeklyCompletedCount >= state.weeklyTarget;

  return (
    <Content>
      <div className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2" style={{ width: "calc(100% + 8px)" }}>
        <div className="max-w-3xl mx-auto space-y-6 text-slate-300">
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/20">
              <TrackChangesOutlined className="text-white" fontSize="medium" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-100">
                Metas da Semana
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Sugestões personalizadas do Gemini para impulsionar sua evolução
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16 text-orange-600">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <>
              <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 md:p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base md:text-lg font-display font-semibold text-slate-200">
                    Seu progresso
                  </h2>
                  <span className="text-sm font-medium text-slate-400">
                    {state.weeklyCompletedCount}/{state.weeklyTarget}
                  </span>
                </div>
                
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {weeklyGoalAchieved && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-center flex items-center justify-center gap-2 text-green-400 animate-fade-in">
                    <CheckCircleOutlineOutlined className="text-green-400" fontSize="small" />
                    Objetivo da semana cumprido! Parabéns!
                  </div>
                )}

                <div className="space-y-3">
                  {state.activeGoals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
                      <AutoAwesomeOutlined className="text-orange-500/50 animate-pulse" />
                      <p className="text-xs italic text-center max-w-sm">
                        O Gemini está gerando novos desafios baseados no seu instrumento e nível...
                      </p>
                    </div>
                  )}

                  {state.activeGoals.map((g) => (
                    <div
                      key={g.id}
                      className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/40 hover:border-orange-500/30 transition-colors flex flex-col justify-between md:flex-row md:items-center gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-orange-500 shrink-0 mt-0.5">
                          <TrackChangesOutlined fontSize="small" />
                        </span>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                          {g.title}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 shrink-0 self-end md:self-center opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleUpdateStatus(g.id, "COMPLETED")}
                          className="h-8 px-3 rounded-md text-xs font-semibold bg-orange-600/10 text-orange-500 border border-orange-500/20 hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckOutlined sx={{ fontSize: 14 }} />
                          Concluir
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(g.id, "REJECTED")}
                          className="h-8 px-3 rounded-md text-xs font-semibold bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CloseOutlined sx={{ fontSize: 14 }} />
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {state.completedGoals.length > 0 && (
                <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 md:p-6 shadow-md animate-fade-in">
                  <h2 className="text-base md:text-lg font-display font-semibold mb-4 text-slate-200">
                    Concluídas esta semana
                  </h2>
                  <div className="space-y-2">
                    {state.completedGoals.map((g) => (
                      <div
                        key={g.id}
                        className="p-3 rounded-lg bg-slate-900/30 border border-slate-700/30 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-slate-500 shrink-0">
                            <CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />
                          </span>
                          <p className="text-sm line-through text-slate-500 truncate font-medium">
                            {g.title}
                          </p>
                        </div>
                        <span className="text-xs text-green-500 font-semibold shrink-0 bg-green-500/10 px-2 py-0.5 rounded-full">
                          +1 Meta
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Content>
  );
});