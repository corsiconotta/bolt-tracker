import React from 'react';
import { Activity } from 'lucide-react';
import { collection, deleteDoc, doc, updateDoc, getDocs, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { InjectionForm } from './components/InjectionForm';
import { InjectionTable } from './components/InjectionTable';
import { CurrentEstimates } from './components/CurrentEstimates';
import { TestDropConstantSettings } from './components/TestDropConstantSettings';
import { TLevelChart } from './components/TLevelChart';
import { Injection, InjectionFormData, Settings } from './types';
import {
  getDayNumber,
  getWeekNumber,
  calculateTestEInOil,
  calculateTestEReleased,
  calculateSerumTLevel,
} from './utils/calculations';
import { DEFAULT_TEST_DROP_CONSTANT } from './constants';

const SETTINGS_DOC_ID = 'app-settings';

function App() {
  const [injections, setInjections] = React.useState<Injection[]>([]);
  const [testDropConstant, setTestDropConstant] = React.useState(DEFAULT_TEST_DROP_CONSTANT);
  const [isUpdatingSettings, setIsUpdatingSettings] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setIsLoading(true);
    try {
      const settings = await loadSettings();
      await loadInjections(settings.testDropConstant);
    } catch (error) {
      console.error("Error initializing app:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async (): Promise<Settings> => {
    try {
      const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data() as Settings;
        setTestDropConstant(settings.testDropConstant);
        return settings;
      } else {
        const defaultSettings: Settings = {
          testDropConstant: DEFAULT_TEST_DROP_CONSTANT
        };
        await setDoc(settingsRef, defaultSettings);
        setTestDropConstant(DEFAULT_TEST_DROP_CONSTANT);
        return defaultSettings;
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      const defaultSettings: Settings = {
        testDropConstant: DEFAULT_TEST_DROP_CONSTANT
      };
      setTestDropConstant(DEFAULT_TEST_DROP_CONSTANT);
      return defaultSettings;
    }
  };

  const loadInjections = async (dropConstant: number) => {
    try {
      const snapshot = await getDocs(collection(db, 'injections'));
      const loadedInjections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date,
      })) as Injection[];

      const sortedInjections = loadedInjections.sort((a, b) => a.dayNumber - b.dayNumber);
      const recalculatedInjections = recalculateAll(sortedInjections, dropConstant);
      setInjections(recalculatedInjections);
    } catch (error) {
      console.error("Error loading injections:", error);
    }
  };

  const createPairedInjection = (originalInjection: Injection): Injection => ({
    date: originalInjection.date,
    timeOfDay: originalInjection.timeOfDay === 'morning' ? 'night' : 'morning',
    location: originalInjection.location,
    amount: 0,
    dayNumber: originalInjection.timeOfDay === 'morning' ? 
      originalInjection.dayNumber + 0.5 : 
      originalInjection.dayNumber - 0.5,
    weekNumber: getWeekNumber(originalInjection.dayNumber),
    isAutoFilled: true
  });

  const recalculateAll = (injections: Injection[], dropConstant: number): Injection[] => {
    let previousInjection: Injection | undefined;
    
    return injections.map((injection) => {
      const testEInOil = calculateTestEInOil(injection, previousInjection);
      const serumTLevel = calculateSerumTLevel(
        { ...injection, testEInOil },
        previousInjection,
        dropConstant
      );
      
      const updatedInjection = {
        ...injection,
        testEInOil,
        testEReleased: calculateTestEReleased(testEInOil),
        serumTLevel
      };
      
      previousInjection = updatedInjection;
      return updatedInjection;
    });
  };

  const handleUpdateTestDropConstant = async (newValue: number) => {
    setIsUpdatingSettings(true);
    try {
      const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
      await setDoc(settingsRef, {
        testDropConstant: newValue
      });
      
      setTestDropConstant(newValue);
      const recalculatedInjections = recalculateAll(injections, newValue);
      setInjections(recalculatedInjections);
    } catch (error) {
      console.error("Error updating test drop constant:", error);
      throw error;
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleAddInjection = async (formData: InjectionFormData) => {
    try {
      const firstInjectionDate = injections.length > 0 ? new Date(injections[0].date) : undefined;
      
      const newInjection: Injection = {
        ...formData,
        dayNumber: getDayNumber(formData.date, formData.timeOfDay, firstInjectionDate),
        weekNumber: getWeekNumber(getDayNumber(formData.date, formData.timeOfDay, firstInjectionDate))
      };

      const pairedInjection = createPairedInjection(newInjection);
      
      const batch = writeBatch(db);
      
      const injectionRef = collection(db, 'injections');
      const newInjectionDoc = doc(injectionRef);
      const pairedInjectionDoc = doc(injectionRef);
      
      batch.set(newInjectionDoc, newInjection);
      batch.set(pairedInjectionDoc, pairedInjection);
      
      await batch.commit();
      await loadInjections(testDropConstant);
    } catch (error) {
      console.error("Error adding injection:", error);
      alert('Error saving injection. Please try again.');
    }
  };

  const handleEdit = async (id: string) => {
    const injection = injections.find(inj => inj.id === id);
    if (!injection) return;

    const amount = prompt('Enter new amount (mg):', injection.amount.toString());
    if (amount === null) return;

    const newAmount = parseFloat(amount);
    if (isNaN(newAmount)) {
      alert('Please enter a valid number');
      return;
    }

    try {
      const injectionRef = doc(db, 'injections', id);
      await updateDoc(injectionRef, { amount: newAmount });
      await loadInjections(testDropConstant);
    } catch (error) {
      console.error("Error updating injection:", error);
      alert('Error updating injection. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const injectionToDelete = injections.find(inj => inj.id === id);
      if (!injectionToDelete) return;

      const pairedInjection = injections.find(inj => 
        inj.isAutoFilled &&
        inj.date === injectionToDelete.date &&
        inj.timeOfDay !== injectionToDelete.timeOfDay
      );

      const batch = writeBatch(db);
      batch.delete(doc(db, 'injections', id));

      if (pairedInjection?.id) {
        batch.delete(doc(db, 'injections', pairedInjection.id));
      }

      await batch.commit();
      await loadInjections(testDropConstant);
    } catch (error) {
      console.error("Error deleting injection:", error);
      alert('Error deleting injection. Please try again.');
    }
  };

  const currentLevel = injections.length > 0
    ? injections[injections.length - 1].serumTLevel!
    : 600;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Tracker
          </h1>
        </header>

        <main className="space-y-6">
          <InjectionForm onSubmit={handleAddInjection} />
          <CurrentEstimates serumTLevel={currentLevel} />
          <TLevelChart injections={injections} />
          
          <div className="bg-transparent">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              History
            </h2>
            <InjectionTable
              injections={injections}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          <div className="flex justify-center border-t border-gray-200 pt-4">
            <TestDropConstantSettings
              value={testDropConstant}
              onUpdate={handleUpdateTestDropConstant}
              isLoading={isUpdatingSettings}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;