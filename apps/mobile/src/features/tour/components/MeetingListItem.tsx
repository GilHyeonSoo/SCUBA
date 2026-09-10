import { BuddyMeetingListItem } from '@/src/features/tour/components/BuddyMeetingListItem';
import { EducationMeetingListItem } from '@/src/features/tour/components/EducationMeetingListItem';
import { TourMeetingListItem } from '@/src/features/tour/components/TourMeetingListItem';
import type { DiveMeeting, MeetingCategory } from '@/src/features/tour/types';

type MeetingListItemProps = {
  meeting: DiveMeeting;
  category: MeetingCategory;
  onPress: () => void;
};

export function MeetingListItem({ meeting, category, onPress }: MeetingListItemProps) {
  switch (category) {
    case 'buddy':
      return <BuddyMeetingListItem meeting={meeting} onPress={onPress} />;
    case 'tour':
      return <TourMeetingListItem meeting={meeting} onPress={onPress} />;
    case 'education':
      return <EducationMeetingListItem meeting={meeting} onPress={onPress} />;
    default:
      return <TourMeetingListItem meeting={meeting} onPress={onPress} />;
  }
}
