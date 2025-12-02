import React, { useState } from 'react';
import { ChevronLeft, Star } from 'lucide-react';
import { CommunityPost } from '../types';
import { mockCommunityPosts } from '../data/mockCommunityPosts';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { CommunityCard } from '../components/CommunityCard';
import { BottomNav } from '../components/BottomNav';

interface CommunityProps {
  onNavigate: (page: 'dashboard' | 'feeding-log' | 'community' | 'profile') => void;
  currentCatName?: string;
}

export function Community({ onNavigate, currentCatName }: CommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostRating, setNewPostRating] = useState(5);
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags))
  ).sort();

  const filteredPosts = filterTag
    ? posts.filter((post) => post.tags.includes(filterTag))
    : posts;

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post: CommunityPost) => {
    // Mock share functionality
    alert(`Sharing ${post.userName}'s post about ${post.catName}!`);
  };

  const handleNewPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      catName: currentCatName || 'My Cat',
      timestamp: new Date(),
      content: newPostContent,
      foodItems: [],
      rating: newPostRating,
      likes: 0,
      comments: [],
      tags: ['my-experience']
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostRating(5);
    setShowNewPostForm(false);
  };

  if (showNewPostForm) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid rgba(59, 46, 37, 0.1)' }}>
          <div className="flex items-center gap-4 p-4">
            <button onClick={() => setShowNewPostForm(false)} className="p-2 -ml-2 active:scale-95">
              <ChevronLeft className="w-6 h-6 text-[#3B2E25]" />
            </button>
            <h2 className="text-[#3B2E25]">Share Your Experience</h2>
          </div>
        </div>

        {/* New Post Form */}
        <div className="flex-1 p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[#6E5C50]">How's it going with {currentCatName || 'your cat'}?</label>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your feeding experience, food combinations, or tips with other cat owners..."
              className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4CDA5] text-[#3B2E25] min-h-[150px]"
              style={{ border: '1px solid rgba(59, 46, 37, 0.1)' }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#6E5C50]">Rate Your Experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setNewPostRating(rating)}
                  className="p-2 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= newPostRating
                        ? 'fill-[#F4CDA5] text-[#F4CDA5]'
                        : 'text-[#E8D8C8]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <ButtonPrimary onClick={handleNewPost} disabled={!newPostContent.trim()}>
            Post to Community
          </ButtonPrimary>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="pt-6 px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#3B2E25]">Community</h2>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="px-4 py-2 bg-[#F4CDA5] rounded-xl active:scale-95 text-[#3B2E25]"
          >
            Share
          </button>
        </div>

        {/* Filter Tags */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFilterTag(null)}
              className={`px-4 py-2 rounded-full transition-all ${
                filterTag === null
                  ? 'bg-[#F4CDA5] text-[#3B2E25]'
                  : 'bg-[#E8D8C8] text-[#6E5C50]'
              }`}
            >
              All
            </button>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  filterTag === tag
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#6E5C50]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 pb-6 space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6E5C50]">No posts found with this filter</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <CommunityCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onToggleComments={() => toggleComments(post.id)}
              onShare={() => handleShare(post)}
              showComments={showComments[post.id] || false}
              onFilterTag={setFilterTag}
            />
          ))
        )}
      </div>

      <BottomNav currentPage="community" onNavigate={onNavigate} />
    </div>
  );
}
