import React, { useState } from 'react';
import { ChevronLeft, Star, ChevronDown } from 'lucide-react';
import { CommunityPost } from '../types';
import { mockCommunityPosts } from '../data/mockCommunityPosts';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { CommunityCard } from '../components/CommunityCard';

interface ShareZoneProps {
  onBack: () => void;
  currentCatName?: string;
}

export function ShareZone({ onBack, currentCatName }: ShareZoneProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostRating, setNewPostRating] = useState(5);
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [showTagDropdown, setShowTagDropdown] = useState(false);

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
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-4 p-4">
            <button onClick={() => setShowNewPostForm(false)} className="p-2 -ml-2 active:scale-95">
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h2 className="text-foreground">Share Your Experience</h2>
          </div>
        </div>

        {/* New Post Form */}
        <div className="flex-1 p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-muted-foreground">How's it going with {currentCatName || 'your cat'}?</label>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your feeding experience, food combinations, or tips with other cat owners..."
              className="w-full px-4 py-3 bg-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground min-h-[150px] border border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground">Rate Your Experience</label>
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
                        ? 'fill-primary text-primary'
                        : 'text-border'
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-foreground">Share Zone</h2>
            <p className="text-muted-foreground">Check others' reviews and post yours</p>
          </div>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="px-4 py-2 bg-primary text-foreground rounded-xl active:scale-95"
          >
            Share
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="px-4 pb-4">
          <div className="relative">
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <span className="text-foreground">
                {filterTag ? `#${filterTag}` : 'All Topics'}
              </span>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showTagDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setFilterTag(null);
                    setShowTagDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left active:bg-muted transition-colors ${
                    filterTag === null ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                >
                  All Topics
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setFilterTag(tag === filterTag ? null : tag);
                      setShowTagDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left active:bg-muted transition-colors border-t border-border ${
                      filterTag === tag ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto p-4 pb-6 space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found with this filter</p>
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
    </div>
  );
}
