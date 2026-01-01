import { writable } from 'svelte/store';

interface FocusState {
  isActive: boolean;
}

const initialState: FocusState = {
  isActive: false
}

function createFocusStore() {
  const { subscribe, update } = writable<FocusState>(initialState);

  return {
    subscribe,
    
    setIsActive: (isActive: boolean) => update(state => ({ ...state, isActive })),
    
    exit: () => {
      // Logic handled by service subscription, store just signals intent
      update(state => ({ ...state, isActive: false }));
    }
  };
}

export const focusStore = createFocusStore();
