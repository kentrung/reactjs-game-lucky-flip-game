import { REWARDS } from '../constants';
import type { Cell, CellPosition, Grid } from '../types';

// Kích thước lưới game (5x5)
export const GRID_SIZE = 5;

// Tạo id duy nhất cho 1 ô theo toạ độ hàng/cột
export const getCellId = (r: number, c: number): string => `${r}-${c}`;

// Chọn ngẫu nhiên 1 phần tử trong mảng
export const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// Chọn ngẫu nhiên có trọng số (weight-based selection)
export const getWeightedRandomElement = <T extends { weight: number }>(arr: T[]): T => {
  const totalWeight = arr.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of arr) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return arr[arr.length - 1];
};

// Khởi tạo lưới 5x5: mỗi ô nhận 1 phần thưởng ngẫu nhiên theo trọng số (REQ-001, REQ-008, REQ-009)
export const generateInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const reward = getWeightedRandomElement(REWARDS);
      currentRow.push({
        id: getCellId(row, col),
        icon: reward.icon,
        points: reward.points,
        isRevealed: false,
        isLocked: false,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

// Tạo bản sao sâu của lưới để cập nhật state theo cách bất biến (immutable)
export const cloneGrid = (grid: Grid): Grid =>
  grid.map(row => row.map(cell => ({ ...cell })));

// Lọc ra các ô còn có thể lật: chưa lật và không bị khóa
export const getAvailableCells = (grid: Grid): CellPosition[] => {
  const cells: CellPosition[] = [];
  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell.isRevealed && !cell.isLocked) cells.push({ r, c });
    });
  });
  return cells;
};

// Chọn ngẫu nhiên 1 ô còn lật được; trả về null nếu không còn ô nào
export const getRandomAvailableCell = (grid: Grid): CellPosition | null => {
  const available = getAvailableCells(grid);
  return available.length > 0 ? getRandomElement(available) : null;
};

// Trả về id các ô thuộc những hàng/cột/chéo đã lật đủ (dùng để highlight)
export const getWinningCells = (grid: Grid): string[] => {
  const ids = new Set<string>();

  // Hàng ngang: nếu cả hàng đã lật thì highlight toàn bộ hàng đó
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every(cell => cell.isRevealed)) {
      for (let c = 0; c < GRID_SIZE; c++) ids.add(grid[r][c].id);
    }
  }

  // Hàng dọc: nếu cả cột đã lật thì highlight toàn bộ cột đó
  for (let c = 0; c < GRID_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!grid[r][c].isRevealed) isFull = false;
    }
    if (isFull) {
      for (let r = 0; r < GRID_SIZE; r++) ids.add(grid[r][c].id);
    }
  }

  // Đường chéo chính (i, i) và đường chéo phụ (i, n-1-i)
  let diag1Full = true;
  let diag2Full = true;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!grid[i][i].isRevealed) diag1Full = false;
    if (!grid[i][GRID_SIZE - 1 - i].isRevealed) diag2Full = false;
  }
  if (diag1Full) for (let i = 0; i < GRID_SIZE; i++) ids.add(grid[i][i].id);
  if (diag2Full) for (let i = 0; i < GRID_SIZE; i++) ids.add(grid[i][GRID_SIZE - 1 - i].id);

  return [...ids];
};
