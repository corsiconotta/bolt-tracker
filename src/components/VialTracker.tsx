import React from 'react';
import { Plus, Droplet, Package } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Vial } from '../types';
import { formatDate } from '../utils/format';

interface Props {
  activeVial: Vial | null;
  vialStock: Vial[];
  onAddVial: (vial: Omit<Vial, 'id' | 'dateOpened' | 'remainingVolume'>) => Promise<void>;
  onOpenNewVial: (vial: Vial) => Promise<void>;
}

export const VialTracker: React.FC<Props> = ({
  activeVial,
  vialStock,
  onAddVial,
  onOpenNewVial,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newVial, setNewVial] = React.useState({
    brand: '',
    ester: '',
    volume: 10,
    concentration: 250,
  });

  const calculateDaysRemaining = (vial: Vial) => {
    const dailyUsage = 0.12; // ml per day
    return Math.floor(vial.remainingVolume / dailyUsage);
  };

 const calculateEstimatedEndDate = (daysRemaining: number) => {
    const today = new Date(); // Start from today
    today.setDate(today.getDate() + daysRemaining); // Add the days remaining
    return formatDate(today);
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddVial(newVial);
    setIsAddDialogOpen(false);
    setNewVial({
      brand: '',
      ester: '',
      volume: 10,
      concentration: 250,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Active Vial */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-600" />
          Active Vial
        </h3>
        
        {activeVial ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Brand:</span>
                <p className="font-medium">{activeVial.brand}</p>
              </div>
              <div>
                <span className="text-gray-500">Ester:</span>
                <p className="font-medium">{activeVial.ester}</p>
              </div>
              <div>
                <span className="text-gray-500">Concentration:</span>
                <p className="font-medium">{activeVial.concentration} mg/ml</p>
              </div>
              <div>
                <span className="text-gray-500">Opened:</span>
                <p className="font-medium">{formatDate(activeVial.dateOpened!)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining:</span>
                <span className="font-medium">
                  {activeVial.remainingVolume.toFixed(1)} / {activeVial.volume} ml
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${(activeVial.remainingVolume / activeVial.volume) * 100}%`,
                  }}
                />
              </div>
            <p className="text-sm text-gray-500">
    Lasts until: {calculateEstimatedEndDate(calculateDaysRemaining(activeVial))}
    <br />
    ({calculateDaysRemaining(activeVial)} days remaining)
</p>

            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No active vial</p>
        )}
      </div>

      {/* Vial Stock */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Vials Left ({vialStock.length})
            
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="text-blue-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {vialStock.length > 0 ? (
          <div className="space-y-2">
            {vialStock.map((vial, index) => (
              <div
                key={vial.id || index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
              >
                <div className="text-sm">
                  <p className="font-medium">{vial.brand}</p>
                  <p className="text-gray-500">
                    {vial.volume}ml • {vial.concentration}mg/ml
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenNewVial(vial)}
                  
                  className="text-blue-600"
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No vials in stock</p>
        )}
        
      </div>

      {/* Add Vial Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Add New Vial
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <Input
              value={newVial.brand}
              onChange={(e) => setNewVial(prev => ({ ...prev, brand: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ester Type
            </label>
            <Input
              value={newVial.ester}
              onChange={(e) => setNewVial(prev => ({ ...prev, ester: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume (ml)
            </label>
            <Input
              type="number"
              value={newVial.volume}
              onChange={(e) => setNewVial(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
              step="0.1"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concentration (mg/ml)
            </label>
            <Input
              type="number"
              value={newVial.concentration}
              onChange={(e) => setNewVial(prev => ({ ...prev, concentration: parseFloat(e.target.value) }))}
              step="1"
              min="0"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Vial
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};