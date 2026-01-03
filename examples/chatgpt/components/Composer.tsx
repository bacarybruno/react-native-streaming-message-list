import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { theme } from '../theme';

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export const Composer = ({ onSend, disabled = false }: ComposerProps) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.composerContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          disabled={disabled}
          onPress={() => {}}
        >
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Ask anything"
          placeholderTextColor={theme.colors.textTertiary}
          multiline={false}
          maxLength={2000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          underlineColorAndroid="transparent"
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          disabled={!canSend}
          onPress={handleSend}
        >
          <Octicons
            name="arrow-up"
            size={20}
            color={
              canSend
                ? theme.colors.submitBtnText
                : theme.colors.mainSurfaceSecondary
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.layout.composerRadius,
    height: theme.layout.composerHeight,
    paddingHorizontal: theme.layout.composerPadding,
    gap: theme.layout.composerGap,
  },
  iconButton: {
    width: theme.layout.sendButtonSize,
    height: theme.layout.sendButtonSize,
    borderRadius: theme.layout.sendButtonSize / 2,
    backgroundColor: theme.colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 22,
    color: theme.colors.textPrimary,
    fontWeight: '400',
    lineHeight: 22,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: theme.layout.composerGap,
    backgroundColor: 'transparent',
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: theme.layout.sendButtonSize,
    height: theme.layout.sendButtonSize,
    borderRadius: theme.layout.sendButtonSize / 2,
    backgroundColor: theme.colors.textQuaternary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: theme.colors.submitBtnBg,
  },
});
