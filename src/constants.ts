// Cấu hình các phần thưởng có thể xuất hiện trong ô (weight = tỉ lệ tương đối)
export const REWARDS = [
  { icon: '🥥', points: 5, color: 'bg-blue-400', weight: 45 },
  { icon: '🥥', points: 10, color: 'bg-purple-400', weight: 30 },
  { icon: '🥥', points: 15, color: 'bg-yellow-300', weight: 15 },
  { icon: '🥥', points: 20, color: 'bg-red-400', weight: 5 },
  { icon: '🎟️', points: 1, color: 'bg-green-400', isTicket: true, weight: 5 },
];

// Số lượt chơi ban đầu
export const INITIAL_TURNS = 200;

// Số line cần ăn để hoàn thành trò chơi
export const REQUIRED_WON_LINES = 3;

// Các mốc phần thưởng cho thanh tiến độ
export const MILESTONES = [100, 300, 600, 1000];

// Tiêu đề của trò chơi
export const GAME_TITLE = 'Bữa Tiệc Bãi Biển';