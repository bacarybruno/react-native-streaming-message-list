import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Octicons, FontAwesome6 } from '@expo/vector-icons';
import { theme } from '../theme';

export const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Octicons
              name="three-bars"
              size={20}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.modelSwitcher}>
            <Text style={styles.title}>ChatGPT</Text>
            <Octicons
              name="chevron-down"
              size={16}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome6
              name="pen-to-square"
              size={18}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Octicons
              name="kebab-horizontal"
              size={16}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderXlight,
  },
  content: {
    height: theme.layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.headerPadding,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    minHeight: 36,
  },
  title: {
    fontSize: theme.layout.headerTitleSize,
    lineHeight: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 4,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 4,
  },
});
