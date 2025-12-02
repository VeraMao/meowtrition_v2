import React, { useState } from 'react';
import { ChevronLeft, Star, ThumbsUp, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { FoodItem, FoodReview, CatProfile } from '../types';
import { BottomNav } from '../components/BottomNav';

interface FoodDetailProps {
  food: FoodItem;
  onBack: () => void;
  onAddToMyPlan: (foodId: string) => void;
  onShareReview: (review: Omit<FoodReview, 'id' | 'timestamp'>) => void;
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile') => void;
  currentProfile?: CatProfile;
}

export function FoodDetail({
  food,
  onBack,
  onAddToMyPlan,
  onShareReview,
  onNavigate,
  currentProfile,
}: FoodDetailProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFilter, setReviewFilter] = useState<'newest' | 'top' | 'helpful'>('newest');
  const [addedToPlan, setAddedToplan] = useState(false);

  const sortedReviews = [...(food.reviews || [])].sort((a, b) => {
    if (reviewFilter === 'newest') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (reviewFilter === 'top') {
      return b.rating - a.rating;
    } else {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    }
  });

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;

    onShareReview({
      userId: 'current-user',
      userName: 'Current User',
      catName: currentProfile?.name,
      catPhotoUrl: currentProfile?.photoUrl,
      rating: reviewRating,
      content: reviewText,
    });

    setReviewText('');
    setReviewRating(5);
    setShowReviewModal(false);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${
              star <= rating ? 'fill-secondary text-secondary' : 'text-border'
            }`}
          />
        ))}
      </div>
    );
  };

  const totalProtein = food.protein || 0;
  const totalFat = food.fat || 0;
  const totalCarbs = food.carbohydrate || 0;
  const totalFiber = food.fiber || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h2 className="text-foreground flex-1 text-center">Food Details</h2>
          <button className="p-2 -mr-2 active:scale-95">
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Food Overview */}
        <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
          {food.imageUrl && (
            <div className="w-full h-40 bg-muted rounded-xl mb-4 overflow-hidden">
              <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-foreground mb-1">{food.name}</h1>
              {food.brand && <p className="text-muted-foreground">{food.brand}</p>}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 mb-1">
                {renderStars(food.rating || 0, 'md')}
              </div>
              <span className="text-muted-foreground">{food.rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-muted text-foreground rounded-full capitalize">
              {food.type}
            </span>
            {food.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            {food.nrcCompliant ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>NRC Compliant</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span>Check nutritional balance</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setAddedToplan(true);
              onAddToMyPlan(food.id);
              setTimeout(() => setAddedToplan(false), 2000);
            }}
            className={`w-full py-3 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              addedToPlan
                ? 'bg-green-500 text-white'
                : 'bg-primary text-foreground'
            }`}
          >
            {addedToPlan ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Added to Plan
              </>
            ) : (
              'Add to My Plan'
            )}
          </button>
        </div>

        {/* Nutrition Breakdown */}
        <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
          <h3 className="text-foreground mb-4">Nutrition per 100g</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Calories</span>
              <span className="text-foreground">{food.caloriesPerHundredGrams} kcal</span>
            </div>
            
            {totalProtein > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">Protein</span>
                  <span className="text-foreground">{totalProtein}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(totalProtein, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {totalFat > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">Fat</span>
                  <span className="text-foreground">{totalFat}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min(totalFat, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {totalCarbs > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">Carbohydrates</span>
                  <span className="text-foreground">{totalCarbs}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(totalCarbs, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {totalFiber > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fiber</span>
                <span className="text-foreground">{totalFiber}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Community Insights */}
        <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Community Reviews</h3>
            <span className="text-muted-foreground">
              {food.reviewCount || 0} reviews
            </span>
          </div>

          {/* Review Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setReviewFilter('newest')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reviewFilter === 'newest'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setReviewFilter('top')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reviewFilter === 'top'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Top Rated
            </button>
            <button
              onClick={() => setReviewFilter('helpful')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reviewFilter === 'helpful'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Most Helpful
            </button>
          </div>

          {/* Reviews List */}
          {sortedReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No reviews yet</p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-3 bg-primary text-foreground rounded-xl active:scale-95 transition-all"
              >
                Be the first to review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-start gap-3 mb-2">
                    {review.catPhotoUrl ? (
                      <img
                        src={review.catPhotoUrl}
                        alt={review.catName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xl">🐱</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-foreground">{review.userName}</span>
                          {review.catName && (
                            <span className="text-muted-foreground"> • {review.catName}</span>
                          )}
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-muted-foreground mb-2">{review.content}</p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-muted-foreground active:scale-95">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.helpfulCount || 0}</span>
                        </button>
                        <span className="text-muted-foreground">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {sortedReviews.length > 5 && (
                <button className="w-full py-2 text-primary">
                  See all {sortedReviews.length} reviews
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setShowReviewModal(true)}
            className="w-full py-3 mt-4 bg-muted text-foreground rounded-xl active:scale-[0.98] transition-all"
          >
            Share Your Experience
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-card rounded-t-3xl w-full p-6 space-y-4 animate-slide-up max-w-[390px] mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Share Your Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-muted-foreground active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewRating ? 'fill-secondary text-secondary' : 'text-border'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-2 block">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this food..."
                  className="w-full px-4 py-3 bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground border border-border resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={!reviewText.trim()}
                className={`w-full py-4 rounded-2xl transition-all ${
                  reviewText.trim()
                    ? 'bg-primary text-foreground active:scale-[0.98]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                }`}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentPage="library" onNavigate={onNavigate} />
    </div>
  );
}
