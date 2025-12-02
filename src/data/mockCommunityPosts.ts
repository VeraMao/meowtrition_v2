import { CommunityPost } from '../types';

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    userName: 'Sarah M.',
    catName: 'Luna',
    timestamp: new Date('2025-11-02T14:30:00'),
    content: 'Switched Luna to a 70/30 mix of Royal Canin dry and Wellness wet food. She\'s been loving it! Her coat is shinier and she has more energy. Highly recommend this combo for indoor cats.',
    foodItems: [
      { id: 'food-1', name: 'Indoor Adult', brand: 'Royal Canin' },
      { id: 'food-5', name: 'Core Pate', brand: 'Wellness' }
    ],
    combinationType: 'mixed',
    rating: 5,
    likes: 24,
    comments: [
      {
        id: 'comment-1',
        userId: 'user-5',
        userName: 'Mike T.',
        timestamp: new Date('2025-11-02T15:45:00'),
        content: 'Great mix! I do something similar with my cat.'
      },
      {
        id: 'comment-2',
        userId: 'user-7',
        userName: 'Emma L.',
        timestamp: new Date('2025-11-02T16:20:00'),
        content: 'What ratio do you use for each meal?'
      }
    ],
    tags: ['mixed-feeding', 'indoor-cat', 'royal-canin']
  },
  {
    id: 'post-2',
    userId: 'user-2',
    userName: 'James K.',
    catName: 'Whiskers',
    timestamp: new Date('2025-11-01T09:15:00'),
    content: 'Been feeding Whiskers Blue Buffalo Wilderness for 6 months now. His weight is perfect and he\'s very active. The high protein content really makes a difference for active cats!',
    foodItems: [
      { id: 'food-2', name: 'Wilderness Chicken', brand: 'Blue Buffalo' }
    ],
    combinationType: 'single',
    rating: 5,
    likes: 18,
    comments: [
      {
        id: 'comment-3',
        userId: 'user-8',
        userName: 'Rachel P.',
        timestamp: new Date('2025-11-01T10:30:00'),
        content: 'My cat loves this too! Great quality food.'
      }
    ],
    tags: ['high-protein', 'active-cat', 'blue-buffalo']
  },
  {
    id: 'post-3',
    userId: 'user-3',
    userName: 'Lisa R.',
    catName: 'Mittens',
    timestamp: new Date('2025-10-31T18:45:00'),
    content: 'Trying out the Purina Pro Plan Sensitive formula. Mittens had some digestive issues with other brands but this one has been amazing. No more upset stomach!',
    foodItems: [
      { id: 'food-4', name: 'Sensitive Skin & Stomach', brand: 'Purina Pro Plan' }
    ],
    combinationType: 'single',
    rating: 4,
    likes: 31,
    comments: [
      {
        id: 'comment-4',
        userId: 'user-9',
        userName: 'Tom W.',
        timestamp: new Date('2025-10-31T19:15:00'),
        content: 'This worked wonders for my senior cat too!'
      },
      {
        id: 'comment-5',
        userId: 'user-10',
        userName: 'Nina S.',
        timestamp: new Date('2025-10-31T20:00:00'),
        content: 'How long did it take to see improvement?'
      }
    ],
    tags: ['sensitive-stomach', 'digestive-health', 'purina']
  },
  {
    id: 'post-4',
    userId: 'user-4',
    userName: 'David C.',
    catName: 'Tiger',
    timestamp: new Date('2025-10-30T12:00:00'),
    content: 'My vet recommended mixing Hills Science Diet with some wet food for better hydration. Tiger is drinking less water but staying well hydrated. This app helped me calculate the perfect portions!',
    foodItems: [
      { id: 'food-3', name: 'Science Diet Adult', brand: 'Hills' },
      { id: 'food-6', name: 'Classic Pate', brand: 'Fancy Feast' }
    ],
    combinationType: 'mixed',
    rating: 5,
    likes: 42,
    comments: [
      {
        id: 'comment-6',
        userId: 'user-11',
        userName: 'Kelly M.',
        timestamp: new Date('2025-10-30T13:30:00'),
        content: 'Hydration is so important! Great tip.'
      }
    ],
    tags: ['hydration', 'vet-recommended', 'mixed-feeding']
  },
  {
    id: 'post-5',
    userId: 'user-6',
    userName: 'Amy B.',
    catName: 'Oliver',
    timestamp: new Date('2025-10-29T16:20:00'),
    content: 'Oliver lost 2 lbs on a controlled portion plan using this app! We mix Wellness Core dry with their wet food. The meal optimizer made it so easy to track calories.',
    foodItems: [
      { id: 'food-7', name: 'Core Grain-Free', brand: 'Wellness' },
      { id: 'food-5', name: 'Core Pate', brand: 'Wellness' }
    ],
    combinationType: 'mixed',
    rating: 5,
    likes: 56,
    comments: [
      {
        id: 'comment-7',
        userId: 'user-12',
        userName: 'Chris D.',
        timestamp: new Date('2025-10-29T17:00:00'),
        content: 'Congrats on the weight loss! My cat needs to lose some too.'
      },
      {
        id: 'comment-8',
        userId: 'user-13',
        userName: 'Sophie H.',
        timestamp: new Date('2025-10-29T18:15:00'),
        content: 'How long did it take to see results?'
      }
    ],
    tags: ['weight-loss', 'portion-control', 'wellness']
  },
  {
    id: 'post-6',
    userId: 'user-14',
    userName: 'Maria G.',
    catName: 'Bella',
    timestamp: new Date('2025-10-28T11:30:00'),
    content: 'Bella is super picky but she absolutely loves the Taste of the Wild formula. Finally found something she consistently eats! Worth the investment.',
    foodItems: [
      { id: 'food-8', name: 'Canyon River', brand: 'Taste of the Wild' }
    ],
    combinationType: 'single',
    rating: 5,
    likes: 29,
    comments: [],
    tags: ['picky-eater', 'premium-food', 'taste-of-the-wild']
  }
];
