export interface TopicResponse {
  id: string;
  title: string;
  category: ForumCategoryType;
  description: string;
  user: {
    id: string;
    username: string;
  };
  createdAt: string;
  commentsCount: number;
}

export interface CommentResponse {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  topicId: string;
  createdAt: string;
}

interface NewTopicFormData {
  title: string;
  description: string;
  category: ForumCategoryType;
}

export type ForumCategoryType = "TIPS" | "TECHNICAL" | "SOCIAL" | "THEORY" | "TOOLS";