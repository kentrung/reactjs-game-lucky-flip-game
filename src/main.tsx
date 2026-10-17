import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { INITIAL_TURNS, MILESTONES } from './constants';
import './index.css'; // Import file CSS (Tailwind)
import Header from './components/Header';
import GameControls from './components/GameControls';
import {
  generateInitialGrid,
  cloneGrid,
  getCellId,
  getWinningCells,
  getRandomAvailableCell,
} from './utils/grid';
import { getLinePoints, getRingLineKey, checkLines } from './utils/lines';
import { calculateProgress } from './utils/progress';

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

    // Chọn ngẫu nhiên 1 ô còn lật được (chưa lật & không bị khóa)
    const pickedCell = getRandomAvailableCell(grid);

    if (!pickedCell) {
      setBannerMessage('Bạn đã lật hết tất cả các ô!');
      return;
    }

    const { r, c } = pickedCell;

    setIsFlipping(true);
    setFlipCellId(getCellId(r, c));

    const finishFlip = () => {
      // Cập nhật state (tạo bản sao để đảm bảo immutability)
      const newGrid = cloneGrid(grid);
      newGrid[r][c].isRevealed = true;
      setGrid(newGrid);
      setTurns(prev => prev - 1);

      // REQ-006: Kiểm tra ăn hàng (điểm thưởng)
      const { bonusPoints, messages, newLines } = checkLines(newGrid, wonLines);

      if (newLines.length > 0) {
        setWonLines(prev => [...prev, ...newLines]);
        setScore(prev => prev + bonusPoints);

        // Dừng trò chơi khi đã ăn đủ 3 line
        if (wonLines.length + newLines.length >= 3) {
          setBannerMessage('🎉 Đã ăn đủ 3 line! Trò chơi kết thúc.');
        } else {
          setBannerMessage(`🎉 Ăn hàng: ${messages.join(', ')} (+${bonusPoints} điểm)`);
          setTimeout(() => setBannerMessage(''), 3000); // Xóa thông báo sau 3s
        }
      }

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

  // Highlight cố định cho các hàng/cột/chéo đã hoàn thành
  const winningCells = getWinningCells(grid);

  // Tính toán % thanh tiến độ dựa trên điểm và các mốc phần thưởng
  const progressPercent = calculateProgress(score, MILESTONES);

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