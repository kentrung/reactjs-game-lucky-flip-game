import { REQUIRED_WON_LINES } from '../constants';

interface GameControlsProps {
  turns: number;
  isFlipping: boolean;
  wonLines: string[];
  isSkipChecked: boolean;
  onSkipChange: (checked: boolean) => void;
  onPlay: () => void;
}

export default function GameControls({
  turns,
  isFlipping,
  wonLines,
  isSkipChecked,
  onSkipChange,
  onPlay,
}: GameControlsProps) {
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
        onClick={onPlay}
        disabled={turns <= 0 || isFlipping || wonLines.length >= REQUIRED_WON_LINES}
        className={`px-8 py-2 rounded-lg text-xl font-bold shadow-lg transition-transform active:scale-95 ${
          turns > 0 && !isFlipping && wonLines.length < REQUIRED_WON_LINES
            ? 'bg-[#fdd60d] text-black hover:from-yellow-400 hover:to-yellow-300 cursor-pointer'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {wonLines.length >= REQUIRED_WON_LINES ? 'KẾT THÚC' : 'CHƠI'}
      </button>
      <div className="text-sm text-gray-300">
        Số lượt còn lại: <span className="text-yellow-400 font-bold">{turns}</span>
      </div>
    </div>
  );
}
