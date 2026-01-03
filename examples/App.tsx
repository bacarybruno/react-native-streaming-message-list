import { StatusBar } from 'react-native';
import { BasicChatScreen } from './screens/BasicChatScreen';
import { ChatGPTScreen } from './screens/ChatGPTScreen';

const variant = (process.env.EXPO_PUBLIC_DEMO_VARIANT || 'chatgpt') as
  | 'basic'
  | 'chatgpt';

export default function App() {
  return (
    <>
      <StatusBar
        barStyle={variant === 'basic' ? 'dark-content' : 'light-content'}
      />
      {variant === 'basic' ? <BasicChatScreen /> : <ChatGPTScreen />}
    </>
  );
}
