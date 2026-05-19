import { useForm } from "react-hook-form";
import { Content } from "@/components/Layout/Content";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { CircularProgress } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { userState } from "@/state/UserState";
import { observer } from "mobx-react";
import type { CommentResponse, NewTopicFormData, TopicResponse } from "@/pages/Forum/types";
import { authHeaders, formatTopicTime, getInitials } from "./utils";
import { categoryLabel, categoryStyle, FORUM_CATEGORIES, MAX_COMMENT_LENGTH, MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "./constants";

const API = import.meta.env.VITE_REACT_APP_API;

export const Forum = observer(() => {
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentResponse[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register: registerTopic,
    handleSubmit: handleSubmitTopic,
    reset: resetTopic,
    watch: watchTopic,
    formState: { errors: topicErrors },
  } = useForm<NewTopicFormData>({ defaultValues: { category: "TIPS" } });

  const titleValue = watchTopic("title") || "";
  const contentValue = watchTopic("description") || "";

  const fetchTopics = useCallback(async () => {
    setIsLoadingTopics(true);
    try {
      const res = await fetch(`${API}/forum/topics`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erro ao buscar tópicos");
      const data: TopicResponse[] = await res.json();
      setTopics(
        data.map((t) => ({ ...t, commentsCount: t.commentsCount ?? 0 })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTopics(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const fetchComments = async (topicId: string) => {
    if (commentsMap[topicId]) return;
    setLoadingComments((prev) => ({ ...prev, [topicId]: true }));
    try {
      const res = await fetch(`${API}/forum/topics/${topicId}/comments`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erro ao buscar comentários");
      const data: CommentResponse[] = await res.json();
      setCommentsMap((prev) => ({ ...prev, [topicId]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [topicId]: false }));
    }
  };

  const toggleExpand = (topicId: string) => {
    setExpandedId((curr) => {
      const next = curr === topicId ? null : topicId;
      if (next !== null) fetchComments(next);
      return next;
    });
  };

  const handleCreateTopic = async (data: NewTopicFormData) => {
    if (!userState) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${API}/forum/topics`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description.trim(),
          category: data.category,
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar tópico");
      const created: TopicResponse = await res.json();
      setTopics((prev) => [created, ...prev]);
      resetTopic();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!userState) return;
    try {
      const res = await fetch(`${API}/forum/topics/${topicId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erro ao excluir tópico");
      setTopics((prev) => prev.filter((t) => t.id !== topicId));
      if (expandedId === topicId) setExpandedId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitComment = async (topicId: string) => {
    if (!userState) return;
    const text = (commentDrafts[topicId] || "").trim();
    if (!text || text.length > MAX_COMMENT_LENGTH) return;

    setSubmittingComment((prev) => ({ ...prev, [topicId]: true }));
    try {
      const res = await fetch(`${API}/forum/topics/${topicId}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error("Erro ao enviar comentário");
      const created: CommentResponse = await res.json();
      setCommentsMap((prev) => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), created],
      }));
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId ? { ...t, commentsCount: t.commentsCount + 1 } : t,
        ),
      );
      setCommentDrafts((prev) => ({ ...prev, [topicId]: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [topicId]: false }));
    }
  };

  return (
    <Content>
      <div className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-white text-2xl flex items-center gap-2">
              <ForumOutlinedIcon />
              Fórum
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Discuta, aprenda e compartilhe com a comunidade
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="font-medium bg-orange-500 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors text-black hover:bg-orange-500/80 h-10 px-4 py-2 w-full sm:w-auto"
          >
            <AddOutlinedIcon fontSize="small" />
            Novo Tópico
          </button>
        </div>

        {isLoadingTopics ? (
          <div className="flex justify-center items-center py-16 text-orange-500">
            <CircularProgress color="inherit" />
          </div>
        ) : topics.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-16">
            Nenhum tópico ainda. Seja o primeiro a publicar!
          </p>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => {
              const isExpanded = expandedId === topic.id;
              const comments = commentsMap[topic.id] || [];
              const isLoadingCmt = loadingComments[topic.id];
              const draftValue = commentDrafts[topic.id] || "";
              const isOwner = userState.user?.id === topic.user.id;

              return (
                <div
                  key={topic.id}
                  className="bg-slate-800 border border-[rgb(45,57,83)] rounded-md p-4 md:p-5 text-white transition-colors hover:border-orange-500/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                      {getInitials(topic.user.username)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryStyle[topic.category] ?? "bg-slate-600/30 text-slate-400 border border-slate-600/30"}`}
                        >
                          {categoryLabel[topic.category] ?? topic.category}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <AccessTimeOutlinedIcon sx={{ fontSize: 12 }} />
                          {formatTopicTime(topic.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm md:text-base leading-snug">
                        {topic.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-2 whitespace-pre-wrap">
                        {topic.description}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[10px] text-slate-400">
                          {topic.user.username}
                        </span>

                        <button
                          onClick={() => toggleExpand(topic.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            isExpanded
                              ? "text-orange-400"
                              : "text-slate-400 hover:text-orange-400"
                          }`}
                        >
                          <ChatBubbleOutlineOutlinedIcon
                            sx={{ fontSize: 14 }}
                          />
                        </button>

                        {isOwner && (
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors ml-auto"
                            title="Excluir tópico"
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                          </button>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[rgb(45,57,83)] space-y-3">
                          {isLoadingCmt ? (
                            <div className="flex justify-center py-4 text-orange-500">
                              <CircularProgress color="inherit" size={20} />
                            </div>
                          ) : comments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              Nenhum comentário ainda. Seja o primeiro!
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {comments.map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-start gap-2.5"
                                >
                                  <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                                    {getInitials(c.author.username)}
                                  </div>
                                  <div className="flex-1 min-w-0 bg-slate-700/50 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-semibold">
                                        {c.author.username}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {formatTopicTime(c.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs md:text-sm mt-0.5 wrap-break-word whitespace-pre-wrap text-slate-300">
                                      {c.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {userState.user && (
                            <div className="flex items-start gap-2.5 pt-1">
                              <div className="h-7 w-7 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] font-semibold text-orange-400 shrink-0">
                                {getInitials(userState.user.username)}
                              </div>
                              <div className="flex-1 space-y-2">
                                <textarea
                                  value={draftValue}
                                  onChange={(e) =>
                                    setCommentDrafts((prev) => ({
                                      ...prev,
                                      [topic.id]: e.target.value.slice(
                                        0,
                                        MAX_COMMENT_LENGTH,
                                      ),
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      (e.metaKey || e.ctrlKey)
                                    ) {
                                      e.preventDefault();
                                      handleSubmitComment(topic.id);
                                    }
                                  }}
                                  placeholder="Escreva um comentário..."
                                  rows={2}
                                  className="w-full p-2 border border-[rgb(45,57,83)] rounded-md text-sm bg-slate-900 text-white resize-none focus:outline-none focus:border-orange-500/50"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400">
                                    {draftValue.length}/{MAX_COMMENT_LENGTH}
                                  </span>
                                  {submittingComment[topic.id] ? (
                                    <div className="text-orange-500">
                                      <CircularProgress
                                        color="inherit"
                                        size={18}
                                      />
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleSubmitComment(topic.id)
                                      }
                                      disabled={!draftValue.trim()}
                                      className="font-medium bg-orange-500 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs cursor-pointer transition-colors text-black hover:bg-orange-500/80 h-8 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <SendOutlinedIcon sx={{ fontSize: 14 }} />
                                      Comentar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-800 border border-[rgb(45,57,83)] rounded-md p-6 text-white w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Criar novo tópico</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitTopic(handleCreateTopic)}
              className="space-y-4"
            >
              <div>
                <label className="font-medium flex mb-2 items-center gap-0.5 text-sm">
                  Título
                </label>
                <input
                  {...registerTopic("title", { required: "Informe um título" })}
                  maxLength={MAX_TITLE_LENGTH}
                  placeholder="Ex: Como improvisar sobre acordes maj7?"
                  className="w-full h-9 px-3 border border-[rgb(45,57,83)] rounded-md text-sm bg-slate-900 text-white focus:outline-none focus:border-orange-500/50"
                />
                <div className="flex items-center justify-between mt-1">
                  {topicErrors.title && (
                    <span className="text-[10px] text-red-400">
                      {topicErrors.title.message}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {titleValue.length}/{MAX_TITLE_LENGTH}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-medium flex mb-2 items-center gap-0.5 text-sm">
                  Categoria
                </label>
                <select
                  {...registerTopic("category")}
                  className="w-full h-9 px-3 border border-[rgb(45,57,83)] rounded-md text-sm bg-slate-900 text-white focus:outline-none focus:border-orange-500/50"
                >
                  {FORUM_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium flex mb-2 items-center gap-0.5 text-sm">
                  Descrição
                </label>
                <textarea
                  {...registerTopic("description", {
                    required: "Informe uma descrição",
                  })}
                  maxLength={MAX_CONTENT_LENGTH}
                  placeholder="Conte mais sobre o assunto..."
                  rows={5}
                  className="w-full p-2.5 border border-[rgb(45,57,83)] rounded-md text-sm bg-slate-900 text-white resize-none focus:outline-none focus:border-orange-500/50"
                />
                <div className="flex items-center justify-between mt-1">
                  {topicErrors.description && (
                    <span className="text-[10px] text-red-400">
                      {topicErrors.description.message}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {contentValue.length}/{MAX_CONTENT_LENGTH}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors border border-[rgb(45,57,83)] text-slate-300 hover:bg-slate-700 h-10 px-4 py-2"
                >
                  Cancelar
                </button>
                {isCreating ? (
                  <div className="flex items-center justify-center text-orange-500 w-24">
                    <CircularProgress color="inherit" size={22} />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="font-medium bg-orange-500 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors text-black hover:bg-orange-500/80 h-10 px-4 py-2"
                  >
                    Publicar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </Content>
  );
});