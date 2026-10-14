import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { CalculatorIcon, CalendarIcon, HomeIcon, MoreIcon, SearchIcon } from '@/ui/icons';
import { TabBar, TabButton } from '@/ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton icon={HomeIcon} label="Home" />
          </TabTrigger>
          <TabTrigger name="calculator" href="/calculator" asChild>
            <TabButton icon={CalculatorIcon} label="Calculator" />
          </TabTrigger>
          <TabTrigger name="calendar" href="/calendar" asChild>
            <TabButton icon={CalendarIcon} label="Calendar" />
          </TabTrigger>
          <TabTrigger name="search" href="/search" asChild>
            <TabButton icon={SearchIcon} label="Search" />
          </TabTrigger>
          <TabTrigger name="more" href="/more" asChild>
            <TabButton icon={MoreIcon} label="More" round />
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}
