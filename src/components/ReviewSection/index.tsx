import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useCommerce } from '../../context/CommerceContext';
import { radius, spacing, typography } from '../../design-system';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAddReview, useReviews } from '../../services/review/hooks';
import type { AddReviewPayload, ApiReview, ApiReviewWithUser } from '../../types';

const STAR_COLOR = '#E8A952';

// Module-scoped so a pending guest review survives unmount/remount
// while the login modal is open (mirrors web's localStorage 'pendingReviewItem').
let pendingReviewItem: AddReviewPayload | null = null;

type ReviewSectionProps = {
  productId: string;
  avgRating: number;
  embeddedReviews?: ApiReview[];
};

type DisplayReview = ApiReview | ApiReviewWithUser;

function reviewUser(review: DisplayReview): ApiReviewWithUser['user'] | undefined {
  return (review as ApiReviewWithUser).user;
}

function reviewDate(review: DisplayReview): string {
  const raw = (review as ApiReviewWithUser).date || review.createdAt;
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function ReviewSection({ productId, avgRating, embeddedReviews }: ReviewSectionProps) {
  const { colors } = useAppTheme();
  const { token, showLoginModal } = useCommerce();

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: fetchedReviews, isLoading: reviewsLoading } = useReviews(productId);
  const addReviewMutation = useAddReview(productId, token);

  // Combine fetched reviews with embedded product reviews (deduplicate by id)
  const allReviews = useMemo<DisplayReview[]>(() => {
    const map = new Map<string, DisplayReview>();
    for (const r of embeddedReviews ?? []) map.set(r.id, r);
    for (const r of fetchedReviews ?? []) {
      if (!map.has(r.id)) map.set(r.id, r);
    }
    return Array.from(map.values());
  }, [embeddedReviews, fetchedReviews]);

  useEffect(() => {
    return () => {
      if (submittedTimer.current) clearTimeout(submittedTimer.current);
    };
  }, []);

  const submitReview = useCallback(
    async (payload: AddReviewPayload) => {
      try {
        setIsSubmitting(true);
        await addReviewMutation.mutateAsync(payload);
        setComment('');
        setRating(0);
        setSubmitted(true);
        if (submittedTimer.current) clearTimeout(submittedTimer.current);
        submittedTimer.current = setTimeout(() => setSubmitted(false), 3000);
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Failed to submit review. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [addReviewMutation]
  );

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please write a review comment.');
      return;
    }

    const payload: AddReviewPayload = {
      comment: comment.trim(),
      rating,
      productId,
    };

    if (!token) {
      pendingReviewItem = payload;
      showLoginModal();
      return;
    }

    await submitReview(payload);
  };

  // Auto-submit the pending guest review once the user has logged in
  // (web equivalent: review-login-popup replay of 'pendingReviewItem').
  useEffect(() => {
    if (!token || !pendingReviewItem) return;
    const payload = pendingReviewItem;
    pendingReviewItem = null;
    submitReview(payload);
  }, [token, submitReview]);

  return (
    <View style={[styles.reviewsSection, { borderTopColor: colors.borderSubtle }]}>
      <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
        Reviews
      </Text>

      {/* Rating Summary */}
      <View style={styles.ratingSummary}>
        <View style={styles.ratingAvg}>
          <Text style={[typography.display, { color: colors.textPrimary }]}>{avgRating}</Text>
          <View style={styles.starsSmall}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(avgRating) ? 'star' : 'star-outline'}
                size={14}
                color={STAR_COLOR}
              />
            ))}
          </View>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {allReviews.length} reviews
          </Text>
        </View>
      </View>

      {/* Review Form */}
      <View style={[styles.reviewForm, { backgroundColor: colors.surfaceMuted }]}>
        <Text
          style={[typography.bodyStrong, { color: colors.textPrimary, marginBottom: spacing.md }]}
        >
          Write a Review
        </Text>

        {/* Star Rating Selector */}
        <View style={styles.starSelector}>
          <Text
            style={[typography.caption, { color: colors.textSecondary, marginRight: spacing.sm }]}
          >
            Rating:
          </Text>
          <View style={styles.starsSmall}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} hitSlop={8}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={24}
                  color={STAR_COLOR}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Comment Input */}
        <TextInput
          style={[
            styles.reviewInput,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.borderStrong,
            },
          ]}
          placeholder='Share your thoughts about this product...'
          placeholderTextColor={colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          maxLength={400}
          textAlignVertical='top'
        />

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || submitted}
          style={[
            styles.reviewSubmitBtn,
            { backgroundColor: submitted ? colors.success : colors.accent },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size='small' color={colors.textInverse} />
          ) : (
            <Text style={[typography.button, { color: colors.textInverse }]}>
              {submitted ? 'Review Submitted!' : 'Submit Review'}
            </Text>
          )}
        </Pressable>

        {!token && (
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
            ]}
          >
            You'll be asked to login before your review is posted
          </Text>
        )}
      </View>

      {/* Review List */}
      {reviewsLoading ? (
        <View style={{ paddingVertical: spacing.xl }}>
          <ActivityIndicator size='small' color={colors.accent} />
        </View>
      ) : allReviews.length > 0 ? (
        allReviews.map((review) => {
          const user = reviewUser(review);
          return (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
              <View style={styles.reviewCardHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: colors.accent }]}>
                  <Text style={[typography.bodyStrong, { color: colors.textInverse }]}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.reviewCardContent}>
                  <View style={styles.reviewCardTop}>
                    <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
                      {user?.name || 'User'}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {reviewDate(review)}
                    </Text>
                  </View>
                  <View style={styles.starsSmall}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? 'star' : 'star-outline'}
                        size={12}
                        color={STAR_COLOR}
                      />
                    ))}
                  </View>
                  {review.comment && (
                    <Text
                      style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}
                    >
                      {review.comment}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xl },
          ]}
        >
          No reviews yet. Be the first to review!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reviewsSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
  },
  ratingSummary: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  ratingAvg: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  starsSmall: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewCard: {
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  reviewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewForm: {
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  starSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    fontSize: 14,
  },
  reviewSubmitBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});

export default ReviewSection;
