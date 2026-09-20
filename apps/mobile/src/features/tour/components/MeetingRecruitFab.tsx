import { CollapsibleActionFab } from '@/src/components/ui/CollapsibleActionFab';

type MeetingRecruitFabProps = {
  onPress: () => void;
};

export function MeetingRecruitFab({ onPress }: MeetingRecruitFabProps) {
  return (
    <CollapsibleActionFab
      label="모집하기"
      accessibilityLabel="모집하기"
      labelWidth={58}
      onPress={onPress}
    />
  );
}
