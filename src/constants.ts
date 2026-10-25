// Icon dừa - loại phần thưởng duy nhất được tính điểm
export const COCONUT_ICON = '🥥';

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

// Số ngôi sao cần thu thập để mở màn chơi đặc biệt
export const REQUIRED_STARS = 1;

// Các mốc phần thưởng cho thanh tiến độ
export const MILESTONES = [0, 1000, 2000, 3000, 4000, 5000];

// Tiêu đề của trò chơi
export const GAME_TITLE = 'Bữa Tiệc Bãi Biển';

export type RingCellReward = { icon: string; points?: number; tickets?: number; stars?: number; level?: string };

// Tạo ngẫu nhiên phần thưởng cho từng ô rìa (24 ô)
// Đảm bảo: đúng 3 ô ngôi sao, đúng 2 ô vé x3, còn lại x30/x50
export const generateRingCellRewards = (): Record<string, RingCellReward> => {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isBoard = r >= 1 && r <= 5 && c >= 1 && c <= 5;
      if (isBoard) continue;
      cells.push([r, c]);
    }
  }

  // Xáo trộn tất cả ô rìa
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const rewards: Record<string, RingCellReward> = {};

  // 3 ô ngôi sao
  for (let i = 0; i < 3; i++) {
    const [r, c] = cells[i];
    rewards[`${r},${c}`] = { icon: '⭐', stars: 1, level: 'level4' };
  }

  // 2 ô vé chơi x3
  for (let i = 3; i < 5; i++) {
    const [r, c] = cells[i];
    rewards[`${r},${c}`] = { icon: '🎟️', tickets: 3, level: 'level4' };
  }

  // Còn lại x30 hoặc x50
  for (let i = 5; i < cells.length; i++) {
    const [r, c] = cells[i];
    const is50 = Math.random() < 0.5;
    if (is50) {
      rewards[`${r},${c}`] = { icon: '🥥', points: 50, level: 'level4' };
    } else {
      rewards[`${r},${c}`] = { icon: '🥥', points: 30, level: 'level3' };
    }
  }

  return rewards;
};

export let RING_CELL_REWARDS: Record<string, RingCellReward> = generateRingCellRewards();

export const regenerateRingCellRewards = () => {
  RING_CELL_REWARDS = generateRingCellRewards();
  return RING_CELL_REWARDS;
};

export const getRingCellReward = (r: number, c: number): RingCellReward | null => {
  return RING_CELL_REWARDS[`${r},${c}`] || null;
};
