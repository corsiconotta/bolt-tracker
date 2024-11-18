import React from 'react';
import { LOCATIONS, TIME_OPTIONS } from '../constants';
import { InjectionFormData } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface Props {
  onSubmit: (data: InjectionFormData) => void;
}

export const InjectionForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState<InjectionFormData>({
    date: new Date().toISOString().split('T')[0],
    timeOfDay: 'morning',
    location: 'VG-D',
    amount: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(prev => ({ ...prev, amount: 0 }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <Input
          type="date"
          id="date"
          value={formData.date}
          onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <Select
            id="time"
            value={formData.timeOfDay}
            onChange={e => setFormData(prev => ({ ...prev, timeOfDay: e.target.value as 'morning' | 'night' }))}
            options={TIME_OPTIONS.map(time => ({ value: time, label: time.charAt(0).toUpperCase() + time.slice(1) }))}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <Select
            id="location"
            value={formData.location}
            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value as typeof LOCATIONS[number] }))}
            options={LOCATIONS.map(loc => ({ value: loc, label: loc }))}
          />
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount (mg)
        </label>
        <Input
  type="number"
  id="amount"
  value={formData.amount ?? ''}
  onChange={e => setFormData(prev => ({ 
    ...prev, 
    amount: e.target.value === '' ? '' : parseFloat(e.target.value)
  }))}
  step="0.1"
  required
  min="0"
/>
      </div>

      <Button type="submit" className="w-full">
        Add
      </Button>
    </form>
  );
};