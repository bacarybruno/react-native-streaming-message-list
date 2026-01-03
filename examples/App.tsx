import { BasicChatScreen } from './src/basic/screen';
import { ChatGPTScreen } from './src/chatgpt/screen';

const variant = (process.env.EXPO_PUBLIC_DEMO_VARIANT || 'chatgpt') as
  | 'basic'
  | 'chatgpt';

export default function App() {
  return variant === 'basic' ? <BasicChatScreen /> : <ChatGPTScreen />;
}
