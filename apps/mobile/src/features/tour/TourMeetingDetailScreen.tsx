import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/ui';
import { colors, layout, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { MeetingDetailCalendar } from '@/src/features/tour/components/MeetingDetailCalendar';
import { MeetingDetailLocationMap } from '@/src/features/tour/components/MeetingDetailLocationMap';
import { MeetingDetailParticipants } from '@/src/features/tour/components/MeetingDetailParticipants';
import { MeetingCoverImage } from '@/src/features/tour/components/MeetingCoverImage';
import { TourDetailContentBlocks } from '@/src/features/tour/components/tour-detail/TourDetailContentBlocks';
import { TourDetailScheduleTable } from '@/src/features/tour/components/tour-detail/TourDetailScheduleTable';
import { TourDetailSectionNav } from '@/src/features/tour/components/tour-detail/TourDetailSectionNav';
import { TourDetailTermsSection } from '@/src/features/tour/components/tour-detail/TourDetailTermsSection';
import {
  TOUR_DETAIL_NAV_ITEMS,
  TOUR_DETAIL_STICKY_NAV_HEIGHT,
} from '@/src/features/tour/constants/tour-detail-nav';
import { getTourMeetingDetailMock } from '@/src/features/tour/mock-data/tour-meeting-detail.mock';
import type { DiveMeeting } from '@/src/features/tour/types';
import type { TourDetailNavSection } from '@/src/features/tour/types/tour-meeting-detail';
import { formatTourListingPrice } from '@/src/features/tour/utils';

type TourMeetingDetailScreenProps = {
  meeting: DiveMeeting;
};

const SECTION_ORDER = TOUR_DETAIL_NAV_ITEMS.map((item) => item.id);
const STICKY_NAV_SCROLL_THRESHOLD = 4;

export function TourMeetingDetailScreen({ meeting }: TourMeetingDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<TourDetailNavSection, number>>>({});
  const stickyNavOffsetY = useRef(0);
  const isProgrammaticScroll = useRef(false);
  const [activeSection, setActiveSection] = useState<TourDetailNavSection>('date');
  const [isStickyNavPinned, setIsStickyNavPinned] = useState(false);

  const detail = getTourMeetingDetailMock(meeting);
  const listing = meeting.tourListing;
  const priceLabel = formatTourListingPrice(meeting.cost, listing?.priceFrom ?? true);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/tour');
  };

  const registerSectionOffset = useCallback(
    (section: TourDetailNavSection) => (event: LayoutChangeEvent) => {
      sectionOffsets.current[section] = event.nativeEvent.layout.y;
    },
    [],
  );

  const resolveActiveSection = useCallback((scrollY: number): TourDetailNavSection => {
    const probe = scrollY + TOUR_DETAIL_STICKY_NAV_HEIGHT + spacing.sm;
    let active: TourDetailNavSection = SECTION_ORDER[0];

    for (const sectionId of SECTION_ORDER) {
      const offset = sectionOffsets.current[sectionId];
      if (offset !== undefined && offset <= probe) {
        active = sectionId;
      }
    }

    return active;
  }, []);

  const handleStickyNavLayout = useCallback((event: LayoutChangeEvent) => {
    stickyNavOffsetY.current = event.nativeEvent.layout.y;
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const pinned =
        stickyNavOffsetY.current > 0 &&
        scrollY >= stickyNavOffsetY.current - STICKY_NAV_SCROLL_THRESHOLD;
      setIsStickyNavPinned((current) => (current === pinned ? current : pinned));

      if (isProgrammaticScroll.current) {
        return;
      }
      setActiveSection(resolveActiveSection(scrollY));
    },
    [resolveActiveSection],
  );

  const handleNavSelect = useCallback((section: TourDetailNavSection) => {
    const offset = sectionOffsets.current[section] ?? 0;
    const targetY = Math.max(0, offset - TOUR_DETAIL_STICKY_NAV_HEIGHT);

    isProgrammaticScroll.current = true;
    setActiveSection(section);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 400);
  }, []);

  return (
    <View style={styles.screen}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        hitSlop={8}
        onPress={handleBack}
        style={({ pressed }) => [
          styles.backButton,
          isStickyNavPinned ? styles.backButtonWithStickyNav : styles.backButtonFloating,
          { top: insets.top + spacing.sm },
          pressed && styles.backButtonPressed,
        ]}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>

      <View style={[styles.scrollViewport, { paddingTop: insets.top }]}>
        <ScrollView
          ref={scrollRef}
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: spacing['2xl'], paddingBottom: insets.bottom + spacing['2xl'] },
          ]}>
        <View style={styles.profileSection}>
          <View style={styles.coverWrap}>
            <MeetingCoverImage meeting={meeting} variant="featured" edgeToEdge />
          </View>
          <View style={styles.profileBody}>
            <View style={styles.hostRow}>
              <ProfileAvatar imageUrl={meeting.hostProfileImageUrl} size={52} />
              <View style={styles.hostInfo}>
                <AppText variant="caption" color="textSecondary">투어 운영</AppText>
                <AppText variant="h3">{meeting.hostName}</AppText>
              </View>
              <MeetingDetailParticipants
                variant="hostHeader"
                current={meeting.currentParticipants}
                max={meeting.maxParticipants}
              />
            </View>

            {listing?.badges?.length ? (
              <View style={styles.badgeRow}>
                {listing.badges.map((badge) => (
                  <View key={badge.label} style={styles.badge}>
                    <AppText variant="caption" style={styles.badgeText}>{badge.label}</AppText>
                  </View>
                ))}
              </View>
            ) : null}

            <AppText variant="h1" style={styles.title}>{meeting.title}</AppText>
            <AppText variant="body" color="textSecondary">{detail.profileTagline}</AppText>
            <AppText variant="h2" style={styles.price}>{priceLabel}</AppText>

            <View style={styles.highlightList}>
              {detail.profileHighlights.map((line) => (
                <View key={line} style={styles.highlightRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  <AppText variant="bodySmall" style={styles.highlightText}>{line}</AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.stickyNavShell} onLayout={handleStickyNavLayout}>
          <TourDetailSectionNav activeSection={activeSection} onSelect={handleNavSelect} />
        </View>

        <View onLayout={registerSectionOffset('date')} style={styles.sectionDivided}>
          <MeetingDetailCalendar startDateIso={meeting.date} endDateIso={meeting.endDate} />
        </View>

        <View onLayout={registerSectionOffset('intro')} style={styles.sectionDivided}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>투어소개</AppText>
          <TourDetailContentBlocks blocks={detail.introBlocks} />
        </View>

        <View onLayout={registerSectionOffset('schedule')} style={styles.sectionDivided}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>일정표</AppText>
          <TourDetailScheduleTable schedule={detail.scheduleTable} />
        </View>

        <View onLayout={registerSectionOffset('terms')} style={styles.sectionDivided}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>상세정보</AppText>
          <TourDetailTermsSection terms={detail.terms} />
        </View>

        <View onLayout={registerSectionOffset('map')} style={styles.mapSection}>
          <MeetingDetailLocationMap
            meetingId={meeting.id}
            locationLabel={meeting.location}
            latitude={meeting.latitude}
            longitude={meeting.longitude}
            edgeToEdge
          />
        </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewport: {
    flex: 1,
  },
  stickyNavShell: {
    zIndex: 10,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 30,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  backButtonFloating: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  backButtonWithStickyNav: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  profileSection: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  coverWrap: {
    marginHorizontal: -layout.screenPaddingHorizontal,
  },
  profileBody: {
    gap: spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  hostInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  badgeText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  title: {
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  highlightList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  highlightText: {
    flex: 1,
    color: colors.textSecondary,
  },
  sectionDivided: {
    gap: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  mapSection: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    marginHorizontal: -layout.screenPaddingHorizontal,
  },
});
