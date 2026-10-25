import { REQUIRED_WON_LINES } from '../constants';

interface GameControlsProps {
  turns: number;
  isFlipping: boolean;
  wonLines: string[];
  isSkipChecked: boolean;
  onSkipChange: (checked: boolean) => void;
  onPlay: () => void;
  onCollect: () => void;
}

export default function GameControls({
  turns,
  isFlipping,
  wonLines,
  isSkipChecked,
  onSkipChange,
  onPlay,
  onCollect,
}: GameControlsProps) {
  const canCollect = wonLines.length >= REQUIRED_WON_LINES;

  return (
    <div className="w-full mt-2 flex items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          id="skip"
          checked={isSkipChecked}
          onChange={(e) => onSkipChange(e.target.checked)}
          className="w-4 h-4 accent-yellow-500"
        />
        Bỏ qua hoạt ảnh
      </label>
      <button
        onClick={canCollect ? onCollect : onPlay}
        disabled={canCollect ? isFlipping : (turns <= 0 || isFlipping)}
        className={`px-8 py-2 rounded-lg text-xl font-bold shadow-lg transition-transform active:scale-95 ${
          canCollect
            ? 'bg-[#22c55e] text-black hover:bg-green-400 cursor-pointer'
            : turns > 0 && !isFlipping
            ? 'bg-[#fdd60d] text-black hover:from-yellow-400 hover:to-yellow-300 cursor-pointer'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canCollect ? 'NHẬN NGAY' : 'CHƠI'}
      </button>
      <div className="text-sm text-gray-300">
        Số lượt còn lại: <span className="text-yellow-400 font-bold">{turns}</span>
      </div>
    </div>
  );
}
