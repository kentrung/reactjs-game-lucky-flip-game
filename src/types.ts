// Định nghĩa các kiểu dữ liệu dùng chung cho toàn bộ game

// Trạng thái của 1 ô trong lưới 5x5
export interface Cell {
  id: string; // id duy nhất dạng "hàng-cột"
  icon: string; // emoji hiển thị khi lật
  points: number; // điểm thưởng khi lật
  isRevealed: boolean; // đã lật hay chưa
  isLocked: boolean; // bị khóa hay không (khóa thì không lật được)
}

// Lưới game 5x5
export type Grid = Cell[][];

// Toạ độ 1 ô trong lưới (0-based)
export interface CellPosition {
  r: number;
  c: number;
}

// Kết quả sau khi kiểm tra các đường ăn điểm
export interface LineResult {
  bonusPoints: number; // tổng điểm thưởng vừa ăn được
  messages: string[]; // tên các đường đã ăn (vd: "Hàng 1", "Cột 3")
  newLines: string[]; // id các đường mới ăn (vd: "row-0", "diag-1")
}
