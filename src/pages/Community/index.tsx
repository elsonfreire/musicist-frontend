import { useState, useEffect } from "react";
import { Content } from "@/components/Layout/Content";
import { useNavigate } from "react-router";
import { 
  AutoAwesomeOutlined, 
  PeopleAltOutlined, 
  PersonAddOutlined, 
  CheckOutlined, 
  CloseOutlined
} from "@mui/icons-material";

import type { UserResponse, RecommendationResponse, FriendshipResponse } from "./types";
import { MusicianCard } from "@/components/MusicianCard";

export const Community = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_REACT_APP_API;

  const [activeTab, setActiveTab] = useState<"discover" | "friends" | "requests">("discover");
  
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [friends, setFriends] = useState<UserResponse[]>([]);
  const [incoming, setIncoming] = useState<FriendshipResponse[]>([]);
  const [outgoing, setOutgoing] = useState<FriendshipResponse[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [recsRes, friendsRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/connections/recommendations`, { headers }),
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

  const handleSendRequest = async (targetId: number, targetUser: UserResponse) => {
    const token = localStorage.getItem("token");
    const userId = getCurrentUserId();
    
    if (!token || !userId) return;

    try {
      const response = await fetch(`${API_URL}/users/${userId}/friends/requests/${targetId}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok || response.status === 201) {
        setRecommendations(prev => prev.filter(rec => rec.user.id !== targetId));
        
        const newOutgoingRequest: FriendshipResponse = {
          id: Date.now(),
          requester: { id: userId } as UserResponse, 
          receiver: targetUser,
          status: 'PENDING'
        };
        
        setOutgoing(prev => [...prev, newOutgoingRequest]);
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

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
                      <MusicianCard 
                        key={rec.user.id} 
                        user={rec.user} 
                        score={rec.matchScore}
                        onAddFriend={() => handleSendRequest(rec.user.id, rec.user)}
                      />
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
                              <button onClick={() => handleAcceptRequest(req.id, req.requester)} className="bg-orange-600 hover:bg-orange-700 text-white p-1.5 rounded-md transition-colors">
                                <CheckOutlined fontSize="small" />
                              </button>
                              <button onClick={() => handleRemoveOrCancel(req.requester.id, 'incoming')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-1.5 rounded-md transition-colors">
                                <CloseOutlined fontSize="small" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

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