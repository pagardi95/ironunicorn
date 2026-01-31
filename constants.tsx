
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

/**
 * 10 Evolution-Stages gemappt auf 100 Level.
 * Ersetze die URLs durch deine 10 generierten Bilder.
 */
export const EVOLUTION_STAGES: Record<number, { url: string; name: string; desc: string }> = {
  1: { 
    url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=800", 
    name: "Das Fohlen", 
    desc: "Der Anfang einer Legende." 
  },
  11: { 
    url: "https://images.unsplash.com/photo-1598971861713-54ad16a7e718?q=80&w=800", 
    name: "Der Aufsteiger", 
    desc: "Erste Fasern werden sichtbar." 
  },
  21: { 
    url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800", 
    name: "Der Athlet", 
    desc: "Stahlharte Disziplin zahlt sich aus." 
  },
  31: { 
    url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800", 
    name: "Das Power-Pony", 
    desc: "Dein Fundament steht." 
  },
  41: { 
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800", 
    name: "Der Kraftprotz", 
    desc: "Die Masse kommt." 
  },
  51: { 
    url: "https://images.unsplash.com/photo-1541534741688-6078c64b5ec5?q=80&w=800", 
    name: "Der Zerstörer", 
    desc: "Gewichte erzittern vor dir." 
  },
  61: { 
    url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800", 
    name: "Das Stall-Monster", 
    desc: "Du bist kaum noch zu halten." 
  },
  71: { 
    url: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800", 
    name: "Der Mystiker", 
    desc: "Das Horn glüht vor Energie." 
  },
  81: { 
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800", 
    name: "Der Halbgott", 
    desc: "Du beherrschst den Stall." 
  },
  91: { 
    url: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=800", 
    name: "IRON UNICORN", 
    desc: "Die ultimative Legende." 
  },
};

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
