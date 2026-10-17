import { GAME_TITLE } from "../constants";

const Header = () => {
  return (
    <div className="w-full bg-[#fdd60d] text-black text-xl text-center py-3 rounded-t-xl font-bold relative">
      {GAME_TITLE}
    </div> 
  )
}

export default Header;
