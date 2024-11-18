import React from 'react';
import { Activity } from 'lucide-react';

interface Props {
  serumTLevel: number;
}

export const CurrentEstimates: React.FC<Props> = ({ serumTLevel }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        Current Estimates
      </h3>
      <div>
        <p className="text-sm text-gray-600 mb-1">Morning of day after last injection</p>
        <p className="text-2xl font-semibold text-gray-900">
          {serumTLevel.toFixed(2)} <span className="text-base font-normal text-gray-600">ng/dL</span>
        </p>
      </div>
    </div>
  );
};