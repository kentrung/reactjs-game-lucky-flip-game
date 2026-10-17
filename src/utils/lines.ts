import type { Cell, Grid, LineResult } from '../types';
import { GRID_SIZE } from './grid';

// Điểm thưởng của từng loại đường: hàng/cột = 150, chéo = 300
export const getLinePoints = (key: string): number =>
  key.startsWith('diag') ? 300 : 150;

// Kiểm tra 1 đường (danh sách ô) đã lật đủ tất cả ô chưa
export const isLineFull = (cells: Cell[]): boolean =>
  cells.every(cell => cell.isRevealed);

// Với 1 ô trên vòng rìa 7x7, trả về id đường mà nó đại diện (hàng/cột/chéo).
// Trả về null nếu ô đó không thuộc đường nào.
export const getRingLineKey = (R: number, C: number): string | null => {
  // Ô cạnh trên/dưới: đại diện cho 1 cột (phần giữa) hoặc 1 đường chéo (phần góc)
  if (R === 0 || R === 6) {
    if (C >= 1 && C <= 5) return `col-${C - 1}`;
    if (C === 0) return R === 0 ? 'diag-1' : 'diag-2';
    if (C === 6) return R === 0 ? 'diag-2' : 'diag-1';
  }
  // Ô cạnh trái/phải: đại diện cho 1 hàng
  if (C === 0 || C === 6) {
    if (R >= 1 && R <= 5) return `row-${R - 1}`;
  }
  return null;
};

// Kiểm tra lưới xem có ăn thêm đường nào không, trả về kết quả
// (điểm thưởng, tên các đường, id các đường mới) để component tự cập nhật state
export const checkLines = (grid: Grid, wonLines: string[]): LineResult => {
  let bonusPoints = 0;
  const messages: string[] = [];
  const newLines: string[] = [];

  // Ghi nhận phần thưởng cho 1 đường nếu đã lật đủ và chưa từng được ăn
  const award = (cells: Cell[], key: string, points: number, label: string) => {
    if (isLineFull(cells) && !wonLines.includes(key)) {
      bonusPoints += points;
      messages.push(label);
      newLines.push(key);
    }
  };

  // Hàng ngang: 5 hàng, mỗi hàng 150 điểm
  for (let r = 0; r < GRID_SIZE; r++) {
    award(grid[r], `row-${r}`, 150, `Hàng ${r + 1}`);
  }

  // Hàng dọc: 5 cột, mỗi cột 150 điểm
  for (let c = 0; c < GRID_SIZE; c++) {
    const column = grid.map(row => row[c]);
    award(column, `col-${c}`, 150, `Cột ${c + 1}`);
  }

  // Đường chéo chính & phụ: mỗi đường 300 điểm
  const mainDiagonal = grid.map((row, i) => row[i]);
  const antiDiagonal = grid.map((row, i) => row[GRID_SIZE - 1 - i]);
  award(mainDiagonal, 'diag-1', 300, 'Chéo chính');
  award(antiDiagonal, 'diag-2', 300, 'Chéo phụ');

  return { bonusPoints, messages, newLines };
};
