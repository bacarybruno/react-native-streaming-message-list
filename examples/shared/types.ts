export type Message = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  isNew?: boolean;
};
