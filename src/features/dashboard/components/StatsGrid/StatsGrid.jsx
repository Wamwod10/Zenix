import {
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import StatCard from "../StatCard/StatCard";

const stats = [
  {
    title: "Bugungi savdo",
    value: "14 280 000 so‘m",
    change: "+23.5%",
    previous: "Kecha: 11 560 000 so‘m",
    icon: CircleDollarSign,
    color: "blue",
    trend: "up",
    priority: "primary",
  },
  {
    title: "Sof foyda",
    value: "4 120 000 so‘m",
    change: "+18.2%",
    previous: "Marja: 28.8%",
    icon: TrendingUp,
    color: "green",
    trend: "up",
    priority: "primary",
  },
  {
    title: "Mijozlar",
    value: "248",
    change: "+12",
    previous: "Yangi mijozlar: 34",
    icon: Users,
    color: "purple",
    trend: "up",
  },
  {
    title: "Ombor qoldig‘i",
    value: "1 842 ta",
    change: "-4.8%",
    previous: "Kam qolgan: 17 ta",
    icon: PackageCheck,
    color: "orange",
    trend: "down",
  },
  {
    title: "O‘rtacha chek",
    value: "186 000 so‘m",
    change: "+9.6%",
    previous: "Oxirgi 7 kun",
    icon: BarChart3,
    color: "cyan",
    trend: "up",
  },
  {
    title: "AI tavsiyalar",
    value: "5 ta",
    change: "+2",
    previous: "3 tasi muhim",
    icon: Sparkles,
    color: "blue",
    trend: "up",
  },
];

const StatsGrid = () => {
  return (
    <section className="zenix-dashboard__stats">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </section>
  );
};

export default StatsGrid;
