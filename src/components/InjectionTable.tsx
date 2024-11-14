import React from 'react';
import { Injection } from '../types';
import { CONCENTRATION } from '../constants';
import { formatDate } from '../utils/format';
import { Button } from './ui/Button';
import { Activity, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

interface Props {
  injections: Injection[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const InjectionTable: React.FC<Props> = ({ injections, onEdit, onDelete }) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const morningEntries = injections.filter(entry => entry.timeOfDay === 'morning');

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      {morningEntries.map((entry, index) => {
        const isExpanded = expandedRows.has(entry.id || index.toString());
        
        return (
          <div
            key={entry.id || index}
            className={`
              bg-white rounded-lg border border-gray-200 overflow-hidden
              ${entry.isAutoFilled ? 'bg-gray-50' : ''}
            `}
          >
            {/* Header - Always visible */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleRow(entry.id || index.toString())}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-medium">{formatDate(entry.date)}</div>
                  <div className="text-sm text-gray-500">{entry.location}</div>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-500">Dose (mL)</div>
                    <div className="font-medium bg-red-50 px-2 py-1 rounded mt-1">
                      {entry.amount > 0 ? (entry.amount / CONCENTRATION).toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Dose (mg)</div>
                    <div className="font-medium px-2 py-1 mt-1">
                      <span className={entry.amount === 0 ? 'text-gray-400' : ''}>
                        {entry.amount.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      Estimate
                    </div>
                    <div className="font-medium px-2 py-1 mt-1">
                      {Math.round(entry.serumTLevel || 0)} ng/dL
                    </div>
                  </div>
                </div>

                {!entry.isAutoFilled && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        entry.id && onEdit(entry.id);
                      }}
                      className="flex-1 justify-center text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        entry.id && onDelete(entry.id);
                      }}
                      className="flex-1 justify-center text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};