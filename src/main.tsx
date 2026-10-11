import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { REWARDS, INITIAL_TURNS, MILESTONES } from './constants';
import './index.css'; // Import file CSS (Tailwind)
import Header from './components/Header';
import GameControls from './components/GameControls';

interface Cell {
  id: string;
  icon: string;
  points: number;
  isRevealed: boolean;
  isLocked: boolean;
}

type Grid = Cell[][];

// Trả về id các ô thuộc những hàng/cột/chéo đã lật đủ (dùng để highlight)
const getWinningCells = (grid: Grid): string[] => {
  const ids = new Set<string>();

  for (let r = 0; r < 5; r++) {
    if (grid[r].every(cell => cell.isRevealed)) {
      for (let c = 0; c < 5; c++) ids.add(grid[r][c].id);
    }
  }

  for (let c = 0; c < 5; c++) {
    let isFull = true;
    for (let r = 0; r < 5; r++) {
      if (!grid[r][c].isRevealed) isFull = false;
    }
    if (isFull) {
      for (let r = 0; r < 5; r++) ids.add(grid[r][c].id);
    }
  }

  let diag1Full = true;
  let diag2Full = true;
  for (let i = 0; i < 5; i++) {
    if (!grid[i][i].isRevealed) diag1Full = false;
    if (!grid[i][4 - i].isRevealed) diag2Full = false;
  }
  if (diag1Full) for (let i = 0; i < 5; i++) ids.add(grid[i][i].id);
  if (diag2Full) for (let i = 0; i < 5; i++) ids.add(grid[i][4 - i].id);

  return [...ids];
};

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
        isLocked: false,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

// Điểm thưởng của từng loại line (hàng/cột = 150, chéo = 300)
const getLinePoints = (key: string): number => (key.startsWith('diag') ? 300 : 150);

// Với 1 ô trên vòng rìa 7x7, trả về line mà nó đại diện (hàng/cột/chéo)
const getRingLineKey = (R: number, C: number): string | null => {
  if (R === 0 || R === 6) {
    if (C >= 1 && C <= 5) return `col-${C - 1}`;
    if (C === 0) return R === 0 ? 'diag-1' : 'diag-2';
    if (C === 6) return R === 0 ? 'diag-2' : 'diag-1';
  }
  if (C === 0 || C === 6) {
    if (R >= 1 && R <= 5) return `row-${R - 1}`;
  }
  return null;
};

const App = () => {
  // --- STATE ---
  const [grid, setGrid] = useState(generateInitialGrid);
  const [turns, setTurns] = useState(INITIAL_TURNS);
  const [score, setScore] = useState(0); // Dùng cho thanh tiến độ (REQ-004)
  const [bannerMessage, setBannerMessage] = useState('');
  const [isSkipChecked, setIsSkipChecked] = useState(false); // REQ-011
  const [flipCellId, setFlipCellId] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [wonLines, setWonLines] = useState<string[]>([]);

  // --- LOGIC XỬ LÝ ---

  // REQ-005: Click Chơi -> Lật ngẫu nhiên 1 ô (có hiệu ứng, khóa nút trong lúc lật)
  const handlePlay = () => {
    if (turns <= 0 || isFlipping || wonLines.length >= 3) return;

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

    setIsFlipping(true);
    setFlipCellId(`${r}-${c}`);

    const finishFlip = () => {
      // Cập nhật state (tạo bản sao để đảm bảo immutability)
      const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
      newGrid[r][c].isRevealed = true;
      setGrid(newGrid);
      setTurns(prev => prev - 1);

      // REQ-006: Kiểm tra ăn hàng (điểm thưởng)
      checkLines(newGrid);

      setFlipCellId(null);
      setIsFlipping(false);
    };

    // REQ-xxx: Bỏ qua hoạt ảnh nếu checkbox được tick
    if (isSkipChecked) {
      finishFlip();
    } else {
      setTimeout(finishFlip, 1000);
    }
  };

  // REQ-006: Logic ăn hàng điểm khi lật đủ đường thẳng/chéo
  const checkLines = (currentGrid: Grid) => {
    let bonusPoints = 0;
    const messages: string[] = [];
    const newLines: string[] = [];

    // Kiểm tra Hàng Ngang
    for (let r = 0; r < 5; r++) {
      const key = `row-${r}`;
      if (currentGrid[r].every(cell => cell.isRevealed) && !wonLines.includes(key)) {
        bonusPoints += 150;
        messages.push(`Hàng ${r + 1}`);
        newLines.push(key);
      }
    }

    // Kiểm tra Hàng Dọc
    for (let c = 0; c < 5; c++) {
      const key = `col-${c}`;
      let isFull = true;
      for (let r = 0; r < 5; r++) {
        if (!currentGrid[r][c].isRevealed) isFull = false;
      }
      if (isFull && !wonLines.includes(key)) {
        bonusPoints += 150;
        messages.push(`Cột ${c + 1}`);
        newLines.push(key);
      }
    }

    // Kiểm tra Đường Chéo
    let diag1Full = true;
    let diag2Full = true;
    for (let i = 0; i < 5; i++) {
      if (!currentGrid[i][i].isRevealed) diag1Full = false;
      if (!currentGrid[i][4 - i].isRevealed) diag2Full = false;
    }
    if (diag1Full && !wonLines.includes('diag-1')) {
      bonusPoints += 300;
      messages.push('Chéo chính');
      newLines.push('diag-1');
    }
    if (diag2Full && !wonLines.includes('diag-2')) {
      bonusPoints += 300;
      messages.push('Chéo phụ');
      newLines.push('diag-2');
    }

    if (newLines.length > 0) {
      setWonLines(prev => [...prev, ...newLines]);
      setScore(prev => prev + bonusPoints);

      // Dừng trò chơi khi đã ăn đủ 3 line
      if (wonLines.length + newLines.length >= 3) {
        setBannerMessage(`🎉 Đã ăn đủ 3 line! Trò chơi kết thúc.`);
      } else {
        setBannerMessage(`🎉 Ăn hàng: ${messages.join(', ')} (+${bonusPoints} điểm)`);
        setTimeout(() => setBannerMessage(''), 3000); // Xóa thông báo sau 3s
      }
    }
  };

  // Highlight cố định cho các hàng/cột/chéo đã hoàn thành
  const winningCells = getWinningCells(grid);

  // Tính toán % thanh tiến độ
  const maxMilestone = MILESTONES[MILESTONES.length - 1];
  const progressPercent = Math.min((score / maxMilestone) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans max-w-xl mx-auto relative overflow-hidden">
      <Header />
      <div className="flex w-full mt-4 gap-4">
        {/* REQ-004 & REQ-013: Thanh tiến độ cột bên trái */}
        <div className="w-24 flex flex-col items-center bg-gray-800 rounded-lg py-4 relative">
          <div className="flex flex-1 w-full items-stretch justify-center gap-2">
            <div className="w-4 bg-gray-700 rounded-full relative overflow-hidden flex flex-col justify-end">
              <div 
                className="w-full bg-gradient-to-t from-yellow-400 to-yellow-200 transition-all duration-500"
                style={{ height: `${progressPercent}%` }}
              ></div>
            </div>
            {/* Các mốc phần thưởng */}
            <div className="flex flex-col justify-between py-2 text-[10px] text-gray-400">
              {[...MILESTONES].reverse().map((m, idx) => (
                <div key={idx} className={`flex items-center gap-1 ${score >= m ? 'text-yellow-400 font-bold' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${score >= m ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs mt-2">Điểm: {score}</div>
        </div>

        {/* REQ-001: Khung trò chơi 5x5 bao ngoài bởi vòng ô điểm 7x7 */}
        <div className="flex-1 grid grid-cols-7 gap-1 bg-[#411a1b] p-2 rounded-lg">
          {Array.from({ length: 7 }).flatMap((_, R) =>
            Array.from({ length: 7 }).map((_, C) => {
              const isBoard = R >= 1 && R <= 5 && C >= 1 && C <= 5;

              if (isBoard) {
                const cell = grid[R - 1][C - 1];
                return (
                  <div
                    key={cell.id}
                    className={`cell ${winningCells.includes(cell.id) ? 'winning' : ''}`}
                  >
                    <div className={`cell-inner ${flipCellId === cell.id || cell.isRevealed ? 'flipped' : ''} ${isSkipChecked ? 'no-transition' : ''}`}>
                      {/* Mặt trước: ô chưa lật */}
                      <div className={`cell-face text-xl font-bold ${cell.isLocked ? 'bg-gray-700' : 'bg-yellow-400'}`}>
                        {cell.isLocked ? (
                          <span className="text-gray-400">🔒</span>
                        ) : (
                          <span className="text-yellow-600 opacity-50">?</span>
                        )}
                      </div>
                      {/* Mặt sau: phần thưởng khi lật */}
                      <div className="cell-face cell-face-back bg-yellow-100 text-black text-xl font-bold">
                        <div className="flex flex-col items-center">
                          <span>{cell.icon}</span>
                          <span className="text-[10px] text-gray-600">x{cell.points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Ô rìa: hiện ổ khóa khi chưa ăn được, sáng rõ + mất khóa khi ăn được
              const lineKey = getRingLineKey(R, C);
              const isWon = lineKey ? wonLines.includes(lineKey) : false;
              return (
                <div
                  key={`ring-${R}-${C}`}
                  className="aspect-square relative border border-yellow-400 rounded-md transition-all duration-300"
                >
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-md text-[10px] font-bold ${
                      isWon
                        ? 'bg-yellow-400 text-black shadow'
                        : 'bg-blue-800/60 text-yellow-400 opacity-50'
                    }`}
                  >
                    {lineKey ? `+${getLinePoints(lineKey)}` : ''}
                  </div>
                  {!isWon && lineKey && (
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute top-0 right-0 text-[10px] text-yellow-400"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Thông báo ăn hàng */}
      <div className="h-6 mt-2 text-yellow-400 font-semibold text-sm">
        {bannerMessage}
      </div>

      <GameControls
        turns={turns}
        isFlipping={isFlipping}
        wonLines={wonLines}
        isSkipChecked={isSkipChecked}
        onSkipChange={setIsSkipChecked}
        onPlay={handlePlay}
      />
    </div>
  );
};

export default App;

const root = createRoot(document.getElementById('app')!);
root.render(<App />);