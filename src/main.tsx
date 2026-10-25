import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { INITIAL_TURNS, MILESTONES, REWARDS, REQUIRED_WON_LINES, regenerateRingCellRewards, getRingCellReward } from './constants';
import './index.css';
import Header from './components/Header';
import GameControls from './components/GameControls';
import {
  generateInitialGrid,
  cloneGrid,
  getCellId,
  getWinningCells,
  getRandomAvailableCell,
} from './utils/grid';
import { getRingLineKey, checkLines } from './utils/lines';
import { calculateProgress } from './utils/progress';

const App = () => {
  // --- STATE ---
  const [grid, setGrid] = useState(generateInitialGrid);
  const [turns, setTurns] = useState(INITIAL_TURNS);
  const [score, setScore] = useState(0); // Dùng cho thanh tiến độ (REQ-004)
  const [bannerMessage, setBannerMessage] = useState('');
  const [isSkipChecked, setIsSkipChecked] = useState(true);
  const [flipCellId, setFlipCellId] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [wonLines, setWonLines] = useState<string[]>([]);
  const [ticketsCollected, setTicketsCollected] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);

  // --- LOGIC XỬ LÝ ---

  // REQ-005: Click Chơi -> Lật ngẫu nhiên 1 ô (có hiệu ứng, khóa nút trong lúc lật)
  const handlePlay = () => {
    if (turns <= 0 || isFlipping || wonLines.length >= REQUIRED_WON_LINES) return;

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

      // Kiểm tra nếu ô vừa lật là vé chơi -> lưu vào ticketsCollected (chưa cộng vào turns)
      const isTicket = REWARDS.find(rw => rw.isTicket)?.icon === newGrid[r][c].icon;
      if (isTicket) {
        setTicketsCollected(prev => prev + 1);
        setBannerMessage('🎟️ Vé chơi! (thu thập - nhận khi hoàn thành 3 lines)');
        setTimeout(() => setBannerMessage(''), 3000);
      } else {
        setTurns(prev => prev - 1);
      }

      // REQ-006: Kiểm tra ăn hàng (điểm thưởng)
      const { bonusPoints, messages, newLines } = checkLines(newGrid, wonLines);

      if (newLines.length > 0) {
        const totalWonAfter = wonLines.length + newLines.length;
        setWonLines(prev => [...prev, ...newLines]);

        // Áp dụng phần thưởng vòng ngoài cho các line mới ăn được
        let extraPoints = 0;
        let extraTickets = 0;
        let extraStars = 0;
        newLines.forEach(key => {
          // Tìm tất cả ô rìa thuộc line này
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
              const k = getRingLineKey(r, c);
              if (k === key) {
                const reward = getRingCellReward(r, c);
                if (reward) {
                  if (reward.points) extraPoints += reward.points;
                  if (reward.tickets) extraTickets += reward.tickets;
                  if (reward.stars) extraStars += reward.stars;
                }
              }
            }
          }
        });

        if (extraTickets > 0) {
          setTicketsCollected(prev => prev + extraTickets);
        }
        if (extraStars > 0) {
          setStarsCollected(prev => prev + extraStars);
        }

        // Chỉ bắt đầu cộng điểm vào score sau khi đã ăn đủ 3 hàng
        if (wonLines.length >= REQUIRED_WON_LINES || totalWonAfter >= REQUIRED_WON_LINES) {
          setScore(prev => prev + bonusPoints + extraPoints);
        }

        // Dừng trò chơi khi đã ăn đủ 3 line
        if (totalWonAfter >= REQUIRED_WON_LINES) {
          setBannerMessage('🎉 Đã ăn đủ 3 line! Nhấn THU THẬP để cộng điểm và bắt đầu ván mới.');
        } else {
          const rewardText: string[] = [];
          if (bonusPoints > 0) rewardText.push(`+${bonusPoints} điểm`);
          if (extraPoints > 0) rewardText.push(`+${extraPoints} điểm (vòng ngoài)`);
          if (extraTickets > 0) rewardText.push(`+${extraTickets} vé chơi`);
          if (extraStars > 0) rewardText.push(`+${extraStars} ngôi sao`);
          setBannerMessage(`🎉 Ăn hàng: ${messages.join(', ')} (${rewardText.join(', ')})`);
          setTimeout(() => setBannerMessage(''), 3000);
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

  // Thu thập điểm và reset bàn chơi sau khi hoàn thành 3 hàng
  const handleCollect = () => {
    if (wonLines.length < REQUIRED_WON_LINES) return;

    // Cộng tổng vé chơi đã thu thập vào turns
    if (ticketsCollected > 0) {
      setTurns(prev => prev + ticketsCollected);
    }

    // Reset bàn chơi cho ván mới
    regenerateRingCellRewards();
    setGrid(generateInitialGrid());
    setWonLines([]);
    setTicketsCollected(0);
    setStarsCollected(0);
    setFlipCellId(null);
    setIsFlipping(false);
    setBannerMessage('Đã thu thập điểm! Bàn chơi đã được reset.');
    setTimeout(() => setBannerMessage(''), 3000);
  };

  // Highlight cố định cho các hàng/cột/chéo đã hoàn thành
  const winningCells = getWinningCells(grid);

  // Lấy class cấp độ tương ứng với điểm thưởng
  const getRewardColor = (points: number): string => {
    const reward = REWARDS.find(r => r.points === points);
    return reward?.level ?? 'level1';
  };

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
                className="w-full bg-linear-to-t from-yellow-400 to-yellow-200 transition-all duration-500"
                style={{ height: `${progressPercent}%` }}
              />
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
        <div className="flex-1 grid grid-cols-7 gap-1">
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
                      <div className="cell-face">
                        <div className="cell-face-inner text-xl font-bold">
                          {cell.isLocked ? (
                            <span className="text-gray-400">🔒</span>
                          ) : (
                            <span className="text-yellow-600 opacity-50">?</span>
                          )}
                        </div>
                      </div>
                      {/* Mặt sau: phần thưởng khi lật */}
                      <div className={`cell-face cell-face-back ${getRewardColor(cell.points)} text-xl font-bold`}>
                        <div className="cell-face-inner flex flex-col items-center leading-none">
                          <div className="w-[28px] h-[28px] flex items-center justify-center overflow-hidden">
                            <span style={{ fontSize: '20px', lineHeight: 1 }}>{cell.icon}</span>
                          </div>
                          <span className="text-[12px] leading-none -mt-[1px]">x{cell.points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Ô rìa: hiện phần thưởng luôn, mờ khi chưa ăn, sáng rõ khi ăn được
              const lineKey = getRingLineKey(R, C);
              const isWon = lineKey ? wonLines.includes(lineKey) : false;
              const ringReward = getRingCellReward(R, C);
              return (
                <div
                  key={`ring-${R}-${C}`}
                  className={`aspect-square relative rounded-md transition-all duration-300 ${isWon ? 'ring-winning' : ''}`}
                >
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-md font-bold transition-all duration-300 ${
                      isWon && ringReward
                        ? 'bg-yellow-400 text-white shadow'
                        : ringReward
                        ? 'bg-[#797f96] text-white opacity-40'
                        : 'bg-[#797f96]'
                    }`}
                  >
                    {ringReward ? (
                      <div className="flex flex-col items-center leading-none">
                        <div className="w-[28px] h-[28px] flex items-center justify-center overflow-hidden">
                          <span style={{ fontSize: '20px', lineHeight: 1 }}>{ringReward.icon}</span>
                        </div>
                        <span className="text-[12px] leading-none -mt-[1px]">
                          {ringReward.tickets ? `x${ringReward.tickets}` : ringReward.stars ? `x${ringReward.stars}` : ringReward.points ? `x${ringReward.points}` : ''}
                        </span>
                      </div>
                    ) : (
                      <div></div>
                    )}
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
        onCollect={handleCollect}
      />
    </div>
  );
};

export default App;

const root = createRoot(document.getElementById('app')!);
root.render(<App />);