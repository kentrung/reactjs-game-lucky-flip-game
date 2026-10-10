import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Import file CSS (Tailwind)

// Cấu hình các phần thưởng có thể xuất hiện trong ô
const REWARDS = [
  { icon: '🥥', points: 10 },
  { icon: '🍋', points: 20 },
  { icon: '🍊', points: 30 },
  { icon: '🍇', points: 40 },
  { icon: '💎', points: 100 },
];

interface Cell {
  id: string;
  icon: string;
  points: number;
  isRevealed: boolean;
  isLocked: boolean;
}

type Grid = Cell[][];

// Hàm khởi tạo lưới 5x5 (REQ-001, REQ-008, REQ-009)
const generateInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let row = 0; row < 5; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < 5; col++) {
      const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
      currentRow.push({
        id: `${row}-${col}`,
        icon: reward.icon,
        points: reward.points,
        isRevealed: false,
        isLocked: Math.random() < 0.1, // 10% cơ hội bị khóa (REQ-008)
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

const App = () => {
  // --- STATE ---
  const [grid, setGrid] = useState(generateInitialGrid);
  const [turns, setTurns] = useState(200); // REQ-002
  const [score, setScore] = useState(0); // Dùng cho thanh tiến độ (REQ-004)
  const [bannerMessage, setBannerMessage] = useState('');
  const [isSkipChecked, setIsSkipChecked] = useState(false); // REQ-011

  // Mốc phần thưởng cho thanh tiến độ (REQ-013)
  const milestones = [100, 300, 600, 1000];

  // --- LOGIC XỬ LÝ ---

  // REQ-005: Click Chơi -> Lật ngẫu nhiên 1 ô
  const handlePlay = () => {
    if (turns <= 0) return;

    // Lọc ra các ô chưa lật và không bị khóa
    const availableCells: { r: number; c: number }[] = [];
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell.isRevealed && !cell.isLocked) {
          availableCells.push({ r, c });
        }
      });
    });

    if (availableCells.length === 0) {
      setBannerMessage('Bạn đã lật hết tất cả các ô!');
      return;
    }

    // Chọn ngẫu nhiên 1 ô
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const { r, c } = availableCells[randomIndex];

    // Cập nhật state (tạo bản sao để đảm bảo immutability)
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    newGrid[r][c].isRevealed = true;
    setGrid(newGrid);
    setTurns(prev => prev - 1);

    // REQ-006: Kiểm tra ăn hàng (điểm thưởng)
    checkLines(newGrid);
  };

  // REQ-006: Logic ăn hàng điểm khi lật đủ đường thẳng/chéo
  const checkLines = (currentGrid: Grid) => {
    let bonusPoints = 0;
    let messages = [];

    // Kiểm tra Hàng Ngang
    for (let r = 0; r < 5; r++) {
      if (currentGrid[r].every(cell => cell.isRevealed)) {
        bonusPoints += 150;
        messages.push(`Hàng ${r + 1}`);
      }
    }

    // Kiểm tra Hàng Dọc
    for (let c = 0; c < 5; c++) {
      let isFull = true;
      for (let r = 0; r < 5; r++) {
        if (!currentGrid[r][c].isRevealed) isFull = false;
      }
      if (isFull) {
        bonusPoints += 150;
        messages.push(`Cột ${c + 1}`);
      }
    }

    // Kiểm tra Đường Chéo
    let diag1Full = true;
    let diag2Full = true;
    for (let i = 0; i < 5; i++) {
      if (!currentGrid[i][i].isRevealed) diag1Full = false;
      if (!currentGrid[i][4 - i].isRevealed) diag2Full = false;
    }
    if (diag1Full) { bonusPoints += 300; messages.push('Chéo chính'); }
    if (diag2Full) { bonusPoints += 300; messages.push('Chéo phụ'); }

    if (bonusPoints > 0) {
      setScore(prev => prev + bonusPoints);
      setBannerMessage(`🎉 Ăn hàng: ${messages.join(', ')} (+${bonusPoints} điểm)`);
      setTimeout(() => setBannerMessage(''), 3000); // Xóa thông báo sau 3s
    }
  };

  // Tính toán % thanh tiến độ
  const maxMilestone = milestones[milestones.length - 1];
  const progressPercent = Math.min((score / maxMilestone) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans max-w-md mx-auto relative overflow-hidden">
      
      {/* REQ-007: Thông tin sự kiện */}
      <div className="w-full bg-yellow-500 text-black text-center py-2 rounded-t-xl font-bold relative">
        🏖️ Bóng Chuyền Bãi Biển
        <div className="text-xs font-normal">Sự kiện kết thúc sau: 04 ngày 15 giờ</div>
      </div>

      {/* REQ-014: Hiển thị tài nguyên */}
      <div className="w-full bg-gray-800 flex justify-between px-4 py-2 text-sm border-b border-gray-700">
        <span>🥥 x65</span>
        <span>🎟️ x12</span>
      </div>

      <div className="flex w-full mt-4 gap-4">
        {/* REQ-004 & REQ-013: Thanh tiến độ cột bên trái */}
        <div className="w-16 flex flex-col items-center bg-gray-800 rounded-lg py-4 relative">
          <div className="text-xs mb-2">Điểm: {score}</div>
          <div className="w-4 h-64 bg-gray-700 rounded-full relative overflow-hidden flex flex-col justify-end">
            <div 
              className="w-full bg-gradient-to-t from-yellow-400 to-yellow-200 transition-all duration-500"
              style={{ height: `${progressPercent}%` }}
            ></div>
          </div>
          {/* Các mốc phần thưởng */}
          <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-between py-10 text-[10px] text-gray-400">
            {milestones.map((m, idx) => (
              <div key={idx} className={`flex items-center gap-1 ${score >= m ? 'text-yellow-400 font-bold' : ''}`}>
                <span>{m}</span>
                <div className={`w-2 h-2 rounded-full ${score >= m ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* REQ-001: Khung trò chơi 5x5 */}
        <div className="flex-1 grid grid-cols-5 gap-1 bg-blue-900 p-2 rounded-lg border-4 border-yellow-600">
          {grid.map(row => (
            row.map(cell => (
              <div
                key={cell.id}
                onClick={() => {
                  // Cho phép click trực tiếp vào ô để lật (tuỳ chọn thêm)
                  if (!cell.isRevealed && !cell.isLocked && turns > 0) {
                    handlePlay(); // Gọi logic lật ngẫu nhiên hoặc xử lý riêng ô này
                  }
                }}
                className={`aspect-square flex items-center justify-center rounded-md text-xl font-bold transition-all duration-300 ${
                  cell.isRevealed 
                    ? 'bg-yellow-100 text-black shadow-inner transform scale-95' 
                    : cell.isLocked 
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-yellow-400 cursor-pointer hover:bg-yellow-300'
                }`}
              >
                {/* REQ-009: Hiển thị phần thưởng khi lật */}
                {cell.isRevealed ? (
                  <div className="flex flex-col items-center">
                    <span>{cell.icon}</span>
                    <span className="text-[10px] text-gray-600">x{cell.points}</span>
                  </div>
                ) : cell.isLocked ? (
                  <span className="text-gray-400">🔒</span> // REQ-008: Icon ổ khóa
                ) : (
                  <span className="text-yellow-600 opacity-50">?</span>
                )}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Thông báo ăn hàng */}
      <div className="h-6 mt-2 text-yellow-400 font-semibold text-sm">
        {bannerMessage}
      </div>

      {/* REQ-003: Button Chơi & Lượt chơi */}
      <div className="w-full mt-2 flex flex-col items-center">
        <button
          onClick={handlePlay}
          disabled={turns <= 0}
          className={`w-full py-4 rounded-xl text-2xl font-bold shadow-lg transition-transform active:scale-95 ${
            turns > 0 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          CHƠI
        </button>
        <div className="mt-2 text-sm text-gray-300">
          Số lượt còn lại: <span className="text-yellow-400 font-bold">{turns}</span>
        </div>
      </div>

      {/* Bỏ qua hoạt ảnh */}
      <div className="w-full mt-4 flex items-center gap-2 text-sm text-gray-400">
        <input 
          type="checkbox" 
          id="skip" 
          checked={isSkipChecked}
          onChange={(e) => setIsSkipChecked(e.target.checked)}
          className="w-4 h-4 accent-yellow-500"
        />
        <label htmlFor="skip">Bỏ qua hoạt ảnh</label>
      </div>

    </div>
  );
};

export default App;

const root = createRoot(document.getElementById('app')!);
root.render(<App />);