import React from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Settings as SettingsIcon } from 'lucide-react';
import { Dialog } from './ui/Dialog';

interface Props {
  value: number;
  onUpdate: (value: number) => Promise<void>;
  isLoading?: boolean;
}

export const TestDropConstantSettings: React.FC<Props> = ({ value, onUpdate, isLoading }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value.toString());

  // Update input value when prop value changes
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseFloat(inputValue);
    
    if (isNaN(newValue) || newValue < 0 || newValue > 1) {
      alert('Please enter a valid number between 0 and 1');
      return;
    }

    try {
      await onUpdate(newValue);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating drop constant:', error);
      alert('Failed to update drop constant. Please try again.');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-gray-600 hover:text-gray-900"
      >
        <SettingsIcon className="w-4 h-4 mr-2" />
        Drop Constant: {value.toFixed(3)}
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setInputValue(value.toString());
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Modify Drop Constant
            </h3>
          </div>

          <div>
            <label htmlFor="dropConstant" className="block text-sm font-medium text-gray-700 mb-1">
              New Value (0-1)
            </label>
            <Input
              id="dropConstant"
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

          <div className="flex gap-2 pt-4">
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
                setIsOpen(false);
                setInputValue(value.toString());
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};