// Cấu hình các phần thưởng có thể xuất hiện trong ô (weight = tỉ lệ tương đối)
export const REWARDS = [
  { icon: '🥥', points: 5, level: 'level1', weight: 45 },
  { icon: '🥥', points: 10, level: 'level2', weight: 30 },
  { icon: '🥥', points: 15, level: 'level3', weight: 15 },
  { icon: '🥥', points: 20, level: 'level4', weight: 5 },
  { icon: '🎟️', points: 1, level: 'level4', weight: 5, isTicket: true },
];

// Số lượt chơi ban đầu
export const INITIAL_TURNS = 200;

// Số line cần ăn để hoàn thành trò chơi
export const REQUIRED_WON_LINES = 3;

// Các mốc phần thưởng cho thanh tiến độ
export const MILESTONES = [100, 300, 600, 1000];

// Tiêu đề của trò chơi
export const GAME_TITLE = 'Bữa Tiệc Bãi Biển';