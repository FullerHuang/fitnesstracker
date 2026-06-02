import { create } from 'zustand';
import {
  Template,
  TemplateExercise,
  createTemplate,
  getAllTemplates,
  deleteTemplate,
  parseTemplateData,
} from '../db/templates';

interface TemplateState {
  templates: Template[];
  loading: boolean;

  loadTemplates: () => void;
  addTemplate: (name: string, data: TemplateExercise[]) => Template;
  removeTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  loading: false,

  loadTemplates: () => {
    try {
      const templates = getAllTemplates();
      set({ templates, loading: false });
    } catch {
      set({ templates: [], loading: false });
    }
  },

  addTemplate: (name, data) => {
    const tpl = createTemplate(name, data);
    set((s) => ({ templates: [tpl, ...s.templates] }));
    return tpl;
  },

  removeTemplate: (id) => {
    deleteTemplate(id);
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
  },
}));
