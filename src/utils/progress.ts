// Tính phần trăm tiến độ dựa trên mốc phần thưởng cao nhất, giới hạn trong khoảng 0-100
export const calculateProgress = (score: number, milestones: number[]): number => {
  const maxMilestone = milestones[milestones.length - 1];
  return Math.min((score / maxMilestone) * 100, 100);
};
