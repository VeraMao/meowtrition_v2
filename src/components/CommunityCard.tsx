import React from 'react';
import { Heart, MessageCircle, Share2, Star } from 'lucide-react';
import { CommunityPost } from '../types';

interface CommunityCardProps {
  post: CommunityPost;
  onLike: () => void;
  onToggleComments: () => void;
  onShare: () => void;
  showComments: boolean;
  onFilterTag: (tag: string) => void;
}

export function CommunityCard({
  post,
  onLike,
  onToggleComments,
  onShare,
  showComments,
  onFilterTag,
}: CommunityCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-4 border border-border"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#F4CDA5] flex items-center justify-center flex-shrink-0">
          <span className="text-[#3B2E25]">{post.userName[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[#3B2E25]">{post.userName}</h3>
            <span className="text-[#6E5C50]">•</span>
            <span className="text-[#6E5C50]">{post.catName}</span>
          </div>
          <p className="text-[#6E5C50]">
            {new Date(post.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < post.rating ? 'fill-[#F4CDA5] text-[#F4CDA5]' : 'text-[#E8D8C8]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Post Content */}
      <p className="text-[#3B2E25] mb-3">{post.content}</p>

      {/* Food Items */}
      {post.foodItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.foodItems.map((food) => (
            <div
              key={food.id}
              className="px-3 py-1 bg-background rounded-full"
              style={{ border: '1px solid rgba(59, 46, 37, 0.1)' }}
            >
              <span className="text-[#6E5C50]">
                {food.brand ? `${food.brand} ${food.name}` : food.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onFilterTag(tag)}
            className="text-[#D1A27B] hover:text-[#F4CDA5] active:scale-95"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-6 pt-3"
        style={{ borderTop: '1px solid rgba(59, 46, 37, 0.1)' }}
      >
        <button
          onClick={onLike}
          className="flex items-center gap-2 text-[#6E5C50] active:scale-95"
        >
          <Heart className="w-5 h-5" />
          <span>{post.likes}</span>
        </button>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-2 text-[#6E5C50] active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments.length}</span>
        </button>
        <button onClick={onShare} className="flex items-center gap-2 text-[#6E5C50] active:scale-95">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comments */}
      {showComments && post.comments.length > 0 && (
        <div
          className="mt-4 pt-4 space-y-3"
          style={{ borderTop: '1px solid rgba(59, 46, 37, 0.1)' }}
        >
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8D8C8] flex items-center justify-center flex-shrink-0">
                <span className="text-[#3B2E25]">{comment.userName[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#3B2E25]">{comment.userName}</span>
                  <span className="text-[#6E5C50]">
                    {new Date(comment.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-[#6E5C50]">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
