import { View } from 'react-native';

import { Screen } from '@/components/common';
import { AppHeader } from '@/components/common/AppHeader';

const DashboardScreen = () => {
  return (
    <Screen scroll>
      <View className="gap-xl pb-xl pt-sm">
        <AppHeader />
      </View>
    </Screen>
  );
};

export default DashboardScreen;
