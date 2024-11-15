import React from 'react';
import { Activity } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { InjectionForm } from './components/InjectionForm';
import { InjectionTable } from './components/InjectionTable';
import { CurrentEstimates } from './components/CurrentEstimates';
import { Injection, InjectionFormData } from './types';
import {
  getDayNumber,
  getWeekNumber,
  calculateTestEInOil,
  calculateTestEReleased,
  calculateSerumTLevel,
} from './utils/calculations';
import { INITIAL_SERUM_LEVEL } from './constants';

function App() {
  const [injections, setInjections] = React.useState<Injection[]>([]);

  React.useEffect(() => {
    loadInjections();
  }, []);

  const loadInjections = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'injections'));
      const loadedInjections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date,
      })) as Injection[];

      const sortedInjections = loadedInjections.sort((a, b) => a.dayNumber - b.dayNumber);
      const recalculatedInjections = recalculateAll(sortedInjections);
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

  const recalculateAll = (injections: Injection[]): Injection[] => {
    let previousInjection: Injection | undefined;
    
    return injections.map((injection) => {
      const testEInOil = calculateTestEInOil(injection, previousInjection);
      const serumTLevel = calculateSerumTLevel(
        { ...injection, testEInOil },
        previousInjection
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
      await loadInjections();
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
      await loadInjections();
    } catch (error) {
      console.error("Error updating injection:", error);
      alert('Error updating injection. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Find the injection to be deleted
      const injectionToDelete = injections.find(inj => inj.id === id);
      if (!injectionToDelete) return;

      // Find the paired auto-filled injection
      const pairedInjection = injections.find(inj => 
        inj.isAutoFilled &&
        inj.date === injectionToDelete.date &&
        inj.timeOfDay !== injectionToDelete.timeOfDay
      );

      const batch = writeBatch(db);

      // Delete the main injection
      batch.delete(doc(db, 'injections', id));

      // Delete the paired injection if found
      if (pairedInjection?.id) {
        batch.delete(doc(db, 'injections', pairedInjection.id));
      }

      await batch.commit();
      await loadInjections();
    } catch (error) {
      console.error("Error deleting injection:", error);
      alert('Error deleting injection. Please try again.');
    }
  };

  const currentLevel = injections.length > 0
    ? injections[injections.length - 1].serumTLevel!
    : INITIAL_SERUM_LEVEL;

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
        </main>
      </div>
    </div>
  );
}

export default App;