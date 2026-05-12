import type { ForumCategoryType } from "@/pages/Forum/types";

export const MAX_COMMENT_LENGTH = 500;
export const MAX_TITLE_LENGTH = 120;
export const MAX_CONTENT_LENGTH = 2000;

export const FORUM_CATEGORIES: { value: ForumCategoryType; label: string }[] = [
  { value: "TIPS", label: "Dicas" },
  { value: "TECHNICAL", label: "Técnica" },
  { value: "SOCIAL", label: "Social" },
  { value: "THEORY", label: "Teoria" },
  { value: "TOOLS", label: "Ferramentas" },
];

export const categoryLabel: Record<ForumCategoryType, string> = {
  TIPS: "Dicas",
  TECHNICAL: "Técnica",
  SOCIAL: "Social",
  THEORY: "Teoria",
  TOOLS: "Ferramentas",
};

export const categoryStyle: Record<ForumCategoryType, string> = {
  TIPS: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  TECHNICAL: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  SOCIAL: "bg-green-500/20 text-green-400 border border-green-500/30",
  THEORY: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  TOOLS: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
};