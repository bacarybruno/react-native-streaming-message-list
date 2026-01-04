import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicChatScreen } from './src/basic/screen';
import { ChatGPTScreen } from './src/chatgpt/screen';

const variant = (process.env.EXPO_PUBLIC_DEMO_VARIANT || 'basic') as
  | 'basic'
  | 'chatgpt';

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        {variant === 'basic' ? <BasicChatScreen /> : <ChatGPTScreen />}
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
