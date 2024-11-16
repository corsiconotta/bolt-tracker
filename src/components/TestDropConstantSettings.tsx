import React from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Settings as SettingsIcon } from 'lucide-react';

interface Props {
  value: number;
  onUpdate: (value: number) => Promise<void>;
  isLoading?: boolean;
}

export const TestDropConstantSettings: React.FC<Props> = ({ value, onUpdate, isLoading }) => {
  const [inputValue, setInputValue] = React.useState(value.toString());

  // Update input value when prop value changes
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const [isEditing, setIsEditing] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseFloat(inputValue);
    
    if (isNaN(newValue) || newValue < 0 || newValue > 1) {
      alert('Please enter a valid number between 0 and 1');
      return;
    }

    try {
      await onUpdate(newValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating test drop constant:', error);
      alert('Failed to update test drop constant. Please try again.');
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            Test Drop Constant
          </h3>
          <p className="text-sm text-gray-600 mt-1">Current value: {value.toFixed(3)}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-700"
        >
          Modify
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <SettingsIcon className="w-5 h-5 text-blue-600" />
        Modify Test Drop Constant
      </h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="testDropConstant" className="block text-sm font-medium text-gray-700 mb-1">
            New Value (0-1)
          </label>
          <Input
            id="testDropConstant"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            step="0.001"
            min="0"
            max="1"
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setInputValue(value.toString());
            }}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};