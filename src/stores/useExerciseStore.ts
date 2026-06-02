import { create } from 'zustand';
import {
  Exercise,
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  getAllCategories,
  createExercise,
  updateExercise,
  deleteExercise,
  seedDefaultExercises,
  CreateExerciseInput,
} from '../db/exercises';
import { DEFAULT_EXERCISES } from '../constants/defaultExercises';

interface ExerciseState {
  exercises: Exercise[];
  categories: string[];
  loading: boolean;
  loadExercises: () => void;
  loadCategories: () => void;
  addExercise: (input: CreateExerciseInput) => Exercise;
  editExercise: (id: string, input: Partial<CreateExerciseInput>) => void;
  removeExercise: (id: string) => void;
  seedDefaults: () => void;
  getByCategory: (category: string) => Exercise[];
  getById: (id: string) => Exercise | null;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  categories: [],
  loading: false,

  loadExercises: () => {
    try {
      const exercises = getAllExercises();
      set({ exercises, loading: false });
    } catch {
      set({ exercises: [], loading: false });
    }
  },

  loadCategories: () => {
    try {
      const categories = getAllCategories();
      set({ categories });
    } catch {
      set({ categories: [] });
    }
  },

  addExercise: (input) => {
    const exercise = createExercise(input);
    set((s) => ({
      exercises: [...s.exercises, exercise].sort(
        (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      ),
      categories: [...new Set([...s.categories, exercise.category])].sort(),
    }));
    return exercise;
  },

  editExercise: (id, input) => {
    updateExercise(id, input);
    get().loadExercises();
    get().loadCategories();
  },

  removeExercise: (id) => {
    deleteExercise(id);
    set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) }));
    get().loadCategories();
  },

  seedDefaults: () => {
    seedDefaultExercises(DEFAULT_EXERCISES);
    get().loadExercises();
    get().loadCategories();
  },

  getByCategory: (category) => {
    return getExercisesByCategory(category);
  },

  getById: (id) => {
    return getExerciseById(id) || null;
  },
}));
