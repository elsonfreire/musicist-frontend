export interface TopicResponse {
  id: number;
  title: string;
  category: ForumCategoryType;
  description: string;
  user: {
    id: number;
    username: string;
  };
  createdAt: string;
  commentsCount: number;
}

export interface CommentResponse {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
  };
  topicId: number;
  createdAt: string;
}

interface NewTopicFormData {
  title: string;
  description: string;
  category: ForumCategoryType;
}

export type ForumCategoryType = "tips" | "technical" | "social" | "theory" | "tools";
