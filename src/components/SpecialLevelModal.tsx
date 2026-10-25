import { REQUIRED_STARS } from "../constants";

interface SpecialLevelModalProps {
  open: boolean;
  onPlay: () => void;
}

// Popup thông báo khi thu thập đủ REQUIRED_STARS
export default function SpecialLevelModal({ open, onPlay }: SpecialLevelModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm bg-gray-800 border-2 border-yellow-400 rounded-2xl shadow-2xl text-center p-6">
        <div className="text-5xl mb-3">⭐</div>
        <h2 className="text-xl font-bold text-yellow-400 mb-2">Chúc mừng!</h2>
        <p className="text-sm text-gray-200 mb-6">
          Bạn đã thu thập đủ <span className="font-bold text-yellow-400">{REQUIRED_STARS} ngôi sao</span>.
          <br />
          Bạn đã được vào <span className="font-bold text-yellow-400">màn chơi đặc biệt</span>!
        </p>
        <button
          onClick={onPlay}
          className="px-10 py-2 rounded-lg text-xl font-bold bg-[#fdd60d] text-black shadow-lg transition-transform active:scale-95 hover:bg-yellow-300 cursor-pointer"
        >
          Chơi
        </button>
      </div>
    </div>
  );
}
