import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { theme } from '../theme';

type MessageBubbleProps = {
  text: string;
  role: 'user' | 'assistant';
  showActions?: boolean;
};

export const MessageBubble = ({
  text,
  role,
  showActions = false,
}: MessageBubbleProps) => {
  const isUser = role === 'user';

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[styles.text, isUser ? styles.userText : styles.assistantText]}
        >
          {text}
        </Text>
      </View>

      {showActions && isUser && (
        <View style={styles.userActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons name="copy" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons
              name="pencil"
              size={16}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      )}

      {showActions && !isUser && (
        <View style={styles.assistantActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons name="copy" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons
              name="thumbsup"
              size={16}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons
              name="thumbsdown"
              size={16}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons name="share" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons name="sync" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Octicons
              name="kebab-horizontal"
              size={16}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: theme.layout.bubbleRadius,
  },
  userBubble: {
    backgroundColor: theme.colors.messageSurface,
    maxWidth: theme.layout.maxUserBubbleWidth,
    paddingHorizontal: theme.layout.userBubblePaddingH,
    paddingVertical: theme.layout.userBubblePaddingV,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: theme.colors.textPrimary,
  },
  assistantText: {
    color: theme.colors.textPrimary,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  assistantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
