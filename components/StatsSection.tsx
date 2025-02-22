import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShieldAlert } from 'lucide-react';
import StatCard from './StatCard';
const data = [
  { year: '2019', value: 1.5 },
  { year: '2020', value: 2.1 },
  { year: '2021', value: 2.8 },
  { year: '2022', value: 3.3 },
  { year: '2023', value: 3.9 },
];

interface StatsSectionProps {
  showCards?: boolean;
  showChart?: boolean;
}

const StatsSection = ({ showCards = true, showChart = true }: StatsSectionProps) => {
  return (
    <div className="space-y-8">
      {showCards && (
        <div className="grid grid-cols-1 gap-6">
          <StatCard
            title="Annual Losses"
            value="$3.9B"
            icon={<DollarSign className="animate-pulse" />}
            description="Total losses to phone scams in 2023"
          />
          <StatCard
            title="Victims"
            value="47%"
            icon={<Users className="animate-pulse" />}
            description="Of seniors targeted by phone scams"
          />
          <StatCard
            title="Prevention"
            value="$12B"
            icon={<ShieldAlert className="animate-pulse" />}
            description="Spent annually on scam prevention"
          />
        </div>
      )}
    </div>
  );
};

export default StatsSection; 