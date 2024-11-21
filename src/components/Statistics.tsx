import React from 'react';
import { Activity, Percent, Zap } from 'lucide-react';
import { Injection } from '../types';

interface Props {
  injections: Injection[];
}

export const Statistics: React.FC<Props> = ({ injections }) => {
  const calculateStats = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);

    // Filter morning entries and sort by date in descending order
    const morningEntries = injections
      .filter(entry => entry.timeOfDay === 'morning')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Last 30 days stats
    const last30DaysEntries = morningEntries.filter(
      entry => new Date(entry.date) >= thirtyDaysAgo
    );
    const last30DaysNonZero = last30DaysEntries.filter(entry => entry.amount > 0);
    const last30DaysPercentage = last30DaysEntries.length > 0
      ? (last30DaysNonZero.length / last30DaysEntries.length) * 100
      : 0;

    // Last 10 days stats
    const last10DaysEntries = morningEntries.filter(
      entry => new Date(entry.date) >= tenDaysAgo
    );
    const last10DaysNonZero = last10DaysEntries.filter(entry => entry.amount > 0);
    const last10DaysPercentage = last10DaysEntries.length > 0
      ? (last10DaysNonZero.length / last10DaysEntries.length) * 100
      : 0;

    // Current streak
    let currentStreak = 0;
    for (const entry of morningEntries) {
      if (entry.amount > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      last30Days: last30DaysPercentage,
      last10Days: last10DaysPercentage,
      streak: currentStreak,
    };
  };

  const stats = calculateStats();

  return (
    
    
   <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Shot Stats</h3>
      <div className="grid grid-cols-3 gap-2 bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
          <Activity className="w-3 h-3" />
          30d
        </div>
        <div className="font-semibold text-sm">
          {stats.last30Days.toFixed(0)}%
        </div>
      </div>

      <div className="text-center border-x border-gray-100">
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
          <Percent className="w-3 h-3" />
          10d
        </div>
        <div className="font-semibold text-sm">
          {stats.last10Days.toFixed(0)}%
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
          <Zap className="w-3 h-3" />
          Streak
        </div>
        <div className="font-semibold text-sm">
          {stats.streak}
        </div>
      </div>
    </div>
    </div>
  );
};


