
import React from 'react';
import { TrainingPlan, WorkoutDay } from './types';

export const REVIEWS = [
  { id: 1, name: "Markus S.", rating: 5, text: "Endlich ein Plan, der wirklich ballert. Die Gamification hält mich bei der Stange!", date: "Vor 2 Tagen" },
  { id: 2, name: "Sarah L.", rating: 5, text: "Von Level 1 bis 20 in 4 Wochen. Mein Einhorn sieht schon richtig fit aus. Beste App!", date: "Vor 1 Woche" },
  { id: 3, name: "Kevin T.", rating: 5, text: "Profi-Expertise merkt man sofort. Kein Bullshit, nur Ergebnisse.", date: "Vor 3 Wochen" },
];

export const UNICORN_WISDOM = [
  { title: "Progressive Overload", text: "Einhörner werden nicht durch Zauberei muskulös, sondern durch mehr Gewicht in jedem Training." },
  { title: "Regeneration", text: "Auch ein Iron Unicorn braucht Schlaf. Deine Muskeln wachsen im Stall, nicht nur auf der Wiese." },
  { title: "Intensität", text: "Wähle das Gewicht so, dass die letzte Wiederholung ein Kampf zwischen dir und deinem inneren Pony ist." },
];

const mockExercises = [
  { id: '1', name: 'Kniebeugen (Squats)', sets: 4, reps: '8-10', weightHint: 'Letzte Rep gerade noch möglich' },
  { id: '2', name: 'Bankdrücken', sets: 3, reps: '10', weightHint: 'Konzentrische Phase kontrolliert' },
  { id: '3', name: 'Kreuzheben', sets: 5, reps: '5', weightHint: 'Kraftfokus, Technik vor Gewicht' },
];

export const MOCK_PLANS: TrainingPlan[] = [
  {
    id: 'basic-strength',
    title: 'Basic Strength',
    durationWeeks: 6,
    focus: 'Strength',
    description: 'Fundament für massive Kraft. Erstellt von Profi-Powerliftern.',
    days: [
      { day: 1, name: 'Lower Body A', exercises: mockExercises },
      { day: 2, name: 'Upper Body A', exercises: mockExercises },
    ]
  },
  {
    id: 'hypertrophy-max',
    title: 'Hypertrophy Pro',
    durationWeeks: 12,
    focus: 'Hypertrophy',
    description: 'Maximaler Muskelaufbau mit Volumen-Fokus.',
    days: [
      { day: 1, name: 'Chest & Back', exercises: mockExercises },
      { day: 2, name: 'Legs & Core', exercises: mockExercises },
    ]
  }
];
