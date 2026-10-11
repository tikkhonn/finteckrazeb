import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TabIsland } from '@/ui/TabIsland';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <View style={styles.host}>
          <TabIsland state={props.state} navigation={props.navigation} insets={props.insets} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная' }} />
      <Tabs.Screen name="scan-and-go" options={{ title: 'Scan & Go' }} />
      <Tabs.Screen name="take-and-go" options={{ title: 'Take & Go' }} />
      <Tabs.Screen name="settings" options={{ title: 'Профиль' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'box-none',
  },
});
