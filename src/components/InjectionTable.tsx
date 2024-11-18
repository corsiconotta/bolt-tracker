import React from 'react';
import { Injection } from '../types';
import { CONCENTRATION } from '../constants';
import { formatDate } from '../utils/format';
import { Button } from './ui/Button';
import { Activity, ChevronDown, ChevronUp, Edit2, Trash2, ChevronLeft, ChevronRight, Moon } from 'lucide-react';

interface Props {
  injections: Injection[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const InjectionTable: React.FC<Props> = ({ injections, onEdit, onDelete }) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const entriesPerPage = 10;

  // Filter morning entries and sort by date in descending order
  const morningEntries = injections
    .filter(entry => entry.timeOfDay === 'morning')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(morningEntries.length / entriesPerPage);

  // Get current page entries
  const getCurrentEntries = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return morningEntries.slice(startIndex, startIndex + entriesPerPage);
  };

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
    <div className="space-y-4">
      <div className="space-y-2">
        {getCurrentEntries().map((entry, index) => {
          const isExpanded = expandedRows.has(entry.id || index.toString());
          const doseInMl = entry.amount / CONCENTRATION;
          
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{entry.location}</span>
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          entry.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
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
                      <div className={`font-medium px-2 py-1 rounded mt-1 ${
                        doseInMl > 0 ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {doseInMl.toFixed(2)}
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
                        <Moon className="w-4 h-4 ml-1" />
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-gray-600"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};