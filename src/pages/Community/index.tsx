import { useState, useEffect } from "react";
import { Content } from "@/components/Layout/Content";
import { useNavigate } from "react-router";
import { 
  AutoAwesomeOutlined, 
  PeopleAltOutlined, 
  PersonAddOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  PlaceOutlined, 
  MusicNoteOutlined,
  AccountCircleOutlined,
  LocalFireDepartmentOutlined
} from "@mui/icons-material";

// Importando o novo tipo FriendshipResponse
import type { UserResponse, RecommendationResponse, FriendshipResponse } from "./types";

const levelColors: Record<string, string> = {
  beginner: "bg-green-900/50 text-green-400",
  intermediate: "bg-yellow-900/50 text-yellow-400",
  advanced: "bg-orange-900/50 text-orange-400",
  pro: "bg-red-900/50 text-red-400",
};

export const Community = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_REACT_APP_API;

  const [activeTab, setActiveTab] = useState<"discover" | "friends" | "requests">("discover");
  
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [friends, setFriends] = useState<UserResponse[]>([]);
  // Agora os states guardam a relação inteira (FriendshipResponse) para termos acesso ao friendshipId
  const [incoming, setIncoming] = useState<FriendshipResponse[]>([]);
  const [outgoing, setOutgoing] = useState<FriendshipResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper para pegar o ID do usuário logado a partir do token
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem("token");
    const userId = getCurrentUserId();

    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const headers = { "Authorization": `Bearer ${token}` };

    try {
      setLoading(true);
      // Batendo nas rotas corretas baseadas no seu controller
      const [recsRes, friendsRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/connections/recommendations`, { headers }), // Mantido (presumo que este não mudou)
        fetch(`${API_URL}/users/${userId}/friends`, { headers }),
        fetch(`${API_URL}/users/${userId}/friends/requests`, { headers })
      ]);

      if (recsRes.status === 403 || friendsRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (recsRes.ok) setRecommendations(await recsRes.json());
      if (friendsRes.ok) setFriends(await friendsRes.json());
      
      // Separando as requisições recebidas e enviadas localmente
      if (requestsRes.ok) {
        const allRequests: FriendshipResponse[] = await requestsRes.json();
        setIncoming(allRequests.filter(req => req.receiver.id === userId));
        setOutgoing(allRequests.filter(req => req.requester.id === userId));
      }

    } catch (error) {
      console.error("Erro ao buscar dados da comunidade:", error);
    } finally {
      setLoading(false);
    }
  };

  // Aceitar usa PATCH e o friendshipId
  const handleAcceptRequest = async (friendshipId: number, newFriend: UserResponse) => {
    const token = localStorage.getItem("token");
    const userId = getCurrentUserId();
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}/friends/requests/${friendshipId}/accept`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok || response.status === 204) {
        setIncoming(prev => prev.filter(req => req.id !== friendshipId));
        setFriends(prev => [...prev, newFriend]);
      }
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
    }
  };

  // Recusar, Cancelar ou Remover Amigo usa DELETE e o ID do amigo
  const handleRemoveOrCancel = async (friendId: number, type: 'incoming' | 'outgoing' | 'friend') => {
    const token = localStorage.getItem("token");
    const userId = getCurrentUserId();

    try {
      const response = await fetch(`${API_URL}/users/${userId}/friends/${friendId}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok || response.status === 204) {
        if (type === 'incoming') {
          setIncoming(prev => prev.filter(req => req.requester.id !== friendId));
        } else if (type === 'outgoing') {
          setOutgoing(prev => prev.filter(req => req.receiver.id !== friendId));
        } else {
          setFriends(prev => prev.filter(f => f.id !== friendId));
        }
      }
    } catch (error) {
      console.error("Erro ao remover/cancelar:", error);
    }
  };

  // Componente interno para reuso do Card do Músico
  const MusicianCard = ({ user, score }: { user: UserResponse, score?: number }) => (
    <div className="bg-slate-800 rounded-lg p-4 md:p-5 flex flex-col gap-3 transition-colors hover:bg-slate-800/80 border border-slate-700/50">
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
        {score !== undefined && (
          <div className="flex items-center gap-1 bg-orange-900/30 text-orange-500 px-2 py-1 rounded text-xs font-semibold border border-orange-800/50">
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
  );

  return (
    <Content>
      <div className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2" style={{ width: "calc(100% + 8px)" }}>
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 text-slate-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-orange-600">
                Comunidade
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Conecte-se com músicos que compartilham seus objetivos.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <PeopleAltOutlined fontSize="small" className="text-orange-600" />
              <span className="font-semibold text-slate-200">{friends.length}</span> conexões
            </div>
          </div>

          <div className="flex space-x-1 border-b border-slate-800 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("discover")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'discover' ? 'text-orange-500 border-orange-500' : 'text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-700'}`}
            >
              <AutoAwesomeOutlined fontSize="small" /> Descobrir
            </button>
            <button 
              onClick={() => setActiveTab("friends")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'friends' ? 'text-orange-500 border-orange-500' : 'text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-700'}`}
            >
              <PeopleAltOutlined fontSize="small" /> Amigos
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'requests' ? 'text-orange-500 border-orange-500' : 'text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-700'}`}
            >
              <PersonAddOutlined fontSize="small" /> 
              Solicitações
              {incoming.length > 0 && (
                <span className="ml-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {incoming.length}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm mt-4">Carregando músicos...</p>
          ) : (
            <div className="mt-6">
              
              {activeTab === "discover" && (
                recommendations.length === 0 ? (
                  <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
                    <p className="text-slate-400 text-sm">Não encontramos novos músicos na sua área hoje.</p>
                    <p className="text-slate-500 text-xs mt-1">Experimente adicionar mais interesses ao seu perfil!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {recommendations.map((rec) => (
                      <MusicianCard key={rec.user.id} user={rec.user} score={rec.matchScore} />
                    ))}
                  </div>
                )
              )}

              {activeTab === "friends" && (
                friends.length === 0 ? (
                  <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
                    <p className="text-slate-400 text-sm">Você ainda não tem conexões.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {friends.map((friend) => (
                      <MusicianCard key={friend.id} user={friend} />
                    ))}
                  </div>
                )
              )}

              {activeTab === "requests" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recebidas (incoming usa requester.id) */}
                  <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
                    <h2 className="text-base font-semibold mb-4 text-slate-200">
                      Recebidas ({incoming.length})
                    </h2>
                    <div className="space-y-3">
                      {incoming.length === 0 ? (
                        <p className="text-slate-500 text-sm">Nenhum pedido recebido.</p>
                      ) : (
                        incoming.map(req => (
                          <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="min-w-0 pr-3">
                              <p className="font-semibold text-slate-200 truncate">@{req.requester.username}</p>
                              <p className="text-xs text-slate-400 capitalize">{req.requester.instrument}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {/* Aceitar usa o friendshipId */}
                              <button onClick={() => handleAcceptRequest(req.id, req.requester)} className="bg-orange-600 hover:bg-orange-700 text-white p-1.5 rounded-md transition-colors">
                                <CheckOutlined fontSize="small" />
                              </button>
                              {/* Recusar usa o userId (requester.id) para deletar o vinculo */}
                              <button onClick={() => handleRemoveOrCancel(req.requester.id, 'incoming')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-1.5 rounded-md transition-colors">
                                <CloseOutlined fontSize="small" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Enviadas (outgoing usa receiver.id) */}
                  <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
                    <h2 className="text-base font-semibold mb-4 text-slate-200">
                      Enviadas ({outgoing.length})
                    </h2>
                    <div className="space-y-3">
                      {outgoing.length === 0 ? (
                        <p className="text-slate-500 text-sm">Nenhum pedido pendente.</p>
                      ) : (
                        outgoing.map(req => (
                          <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="min-w-0 pr-3">
                              <p className="font-semibold text-slate-200 truncate">@{req.receiver.username}</p>
                              <p className="text-xs text-slate-500">Aguardando resposta...</p>
                            </div>
                            <button onClick={() => handleRemoveOrCancel(req.receiver.id, 'outgoing')} className="text-slate-400 hover:text-red-400 text-sm px-2 py-1 rounded transition-colors">
                              Cancelar
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </Content>
  );
};