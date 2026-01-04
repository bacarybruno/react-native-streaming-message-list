import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Octicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { showNotImplementedAlert } from '../../shared/notImplemented';

type MessageBubbleProps = {
  text: string;
  role: 'user' | 'assistant';
  showActions?: boolean;
  isStreaming?: boolean;
};

export const MessageBubble = ({
  text,
  role,
  showActions = false,
  isStreaming = false,
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
        <View style={styles.textRow}>
          <Text
            style={[
              styles.text,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {text}
          </Text>
          {!isUser && isStreaming && <StreamingDot />}
        </View>
      </View>

      {showActions && isUser && (
        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
            <Octicons name="copy" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
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
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
            <Octicons name="copy" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
            <Octicons
              name="thumbsup"
              size={16}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
            <Octicons
              name="thumbsdown"
              size={16}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
            <Octicons name="share" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
            <Octicons name="sync" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showNotImplementedAlert}
          >
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

const StreamingDot = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 625, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 625, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.streamingDotContainer, animatedStyle]}>
      <Text style={styles.streamingDot}>●</Text>
    </Animated.View>
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
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
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
  streamingDotContainer: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamingDot: {
    color: theme.colors.textPrimary,
    fontSize: 14,
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
