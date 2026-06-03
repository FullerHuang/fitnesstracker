import { create } from 'zustand';
import {
  TrainingSession,
  SessionWithExercise,
  createSession,
  getSessionsByDate,
  getSessionById,
  getSessionsByExercise,
  deleteSession,
  updateSessionNotes,
} from '../db/sessions';
import {
  TrainingSet,
  CreateSetInput,
  createSet,
  getSetsBySession,
  updateSet,
  deleteSet,
  deleteSetsBySession,
} from '../db/sets';

interface TrainingState {
  currentSessions: SessionWithExercise[];
  currentSets: TrainingSet[];
  loading: boolean;

  loadSessionsByDate: (date: string) => void;
  loadSessionDetail: (sessionId: string) => void;
  loadSessionsByExercise: (exerciseId: string) => SessionWithExercise[];
  addSession: (exerciseId: string, date: string) => TrainingSession;
  removeSession: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;

  addSet: (input: CreateSetInput) => TrainingSet;
  loadSetsBySession: (sessionId: string) => TrainingSet[];
  editSet: (id: string, input: Partial<CreateSetInput>) => void;
  removeSet: (id: string) => void;
  clearSetsBySession: (sessionId: string) => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  currentSessions: [],
  currentSets: [],
  loading: false,

  loadSessionsByDate: (date) => {
    try {
      const sessions = getSessionsByDate(date);
      set({ currentSessions: sessions, loading: false });
    } catch {
      set({ currentSessions: [], loading: false });
    }
  },

  loadSessionDetail: (sessionId) => {
    try {
      const session = getSessionById(sessionId);
      const sets = getSetsBySession(sessionId);
      set({ currentSessions: session ? [session] : [], currentSets: sets, loading: false });
    } catch {
      set({ currentSessions: [], currentSets: [], loading: false });
    }
  },

  loadSessionsByExercise: (exerciseId) => {
    try {
      return getSessionsByExercise(exerciseId);
    } catch {
      return [];
    }
  },

  addSession: (exerciseId, date) => {
    return createSession(exerciseId, date);
  },

  removeSession: (id) => {
    deleteSession(id);
    set((s) => ({ currentSessions: s.currentSessions.filter((sess) => sess.id !== id) }));
  },

  updateNotes: (id, notes) => {
    updateSessionNotes(id, notes);
  },

  addSet: (input) => {
    const ts = createSet(input);
    set((s) => ({ currentSets: [...s.currentSets, ts].sort((a, b) => a.set_number - b.set_number) }));
    return ts;
  },

  loadSetsBySession: (sessionId) => {
    const sets = getSetsBySession(sessionId);
    set({ currentSets: sets });
    return sets;
  },

  editSet: (id, input) => {
    updateSet(id, input);
    set((s) => ({
      currentSets: s.currentSets.map((ts) => {
        if (ts.id !== id) return ts;
        return {
          ...ts,
          target_weight: input.target_weight ?? ts.target_weight,
          target_reps: input.target_reps ?? ts.target_reps,
          target_rpe: input.target_rpe !== undefined ? input.target_rpe : ts.target_rpe,
          weight: input.weight ?? ts.weight,
          reps: input.reps ?? ts.reps,
          rpe: input.rpe !== undefined ? input.rpe : ts.rpe,
          custom_fields: input.custom_fields ?? ts.custom_fields,
        };
      }),
    }));
  },

  removeSet: (id) => {
    deleteSet(id);
    set((s) => ({ currentSets: s.currentSets.filter((ts) => ts.id !== id) }));
  },

  clearSetsBySession: (sessionId) => {
    deleteSetsBySession(sessionId);
    set({ currentSets: [] });
  },
}));
