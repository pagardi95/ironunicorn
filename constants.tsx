
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

export const EVOLUTION_STAGES: Record<number, { url: string; name: string; desc: string }> = {
  1: { 
    url: "https://images.unsplash.com/photo-1534073737927-85f1dfed1a5d?auto=format&fit=crop&q=80&w=800", 
    name: "Das Fohlen", 
    desc: "Der Anfang einer Legende." 
  },
  11: { 
    url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800", 
    name: "Der Aufsteiger", 
    desc: "Dein Körper beginnt sich zu stählen." 
  },
  21: { 
    url: "https://images.unsplash.com/photo-1598971861713-54ad16a7e718?auto=format&fit=crop&q=80&w=800", 
    name: "Der Athlet", 
    desc: "Sichtbare Muskeln und eiserner Wille." 
  },
  31: { 
    url: "https://images.unsplash.com/photo-1453229591443-ec59610f6448?auto=format&fit=crop&q=80&w=800", 
    name: "Das Power-Pony", 
    desc: "Massiv und unaufhaltsam." 
  },
  41: { 
    url: "https://images.unsplash.com/photo-1519451241324-20b4ec2c4220?auto=format&fit=crop&q=80&w=800", 
    name: "Der Kraftprotz", 
    desc: "Du beherrscht das Eisen." 
  },
  51: { 
    url: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&q=80&w=800", 
    name: "Der Zerstörer", 
    desc: "Nichts steht dir im Weg." 
  },
  61: { 
    url: "https://images.unsplash.com/photo-1537210249814-b9a10a161ae4?auto=format&fit=crop&q=80&w=800", 
    name: "Das Stall-Monster", 
    desc: "Übermenschliche Proportionen." 
  },
  71: { 
    url: "https://images.unsplash.com/photo-1505315570107-1601a70058e1?auto=format&fit=crop&q=80&w=800", 
    name: "Der Mystiker", 
    desc: "Das Horn leuchtet auf." 
  },
  81: { 
    url: "https://images.unsplash.com/photo-1549429017-02701107c30a?auto=format&fit=crop&q=80&w=800", 
    name: "Der Halbgott", 
    desc: "Du bist eine Erscheinung aus Stahl." 
  },
  91: { 
    url: "https://images.unsplash.com/photo-1511216113906-8f57bb83e776?auto=format&fit=crop&q=80&w=800", 
    name: "IRON UNICORN", 
    desc: "Die ultimative Legende." 
  },
};

const beginnerEx = [
  { id: 'b1', name: 'Kniebeugen (Leicht)', sets: 3, reps: '12-15', weightHint: 'Fokus auf saubere Technik' },
  { id: 'b2', name: 'Liegestütze', sets: 3, reps: 'Max', weightHint: 'Brust voll dehnen' },
  { id: 'b3', name: 'Plank', sets: 3, reps: '45s', weightHint: 'Core fest anspannen' },
];

const interEx = [
  { id: 'i1', name: 'Back Squats', sets: 4, reps: '8-10', weightHint: 'Kontrollierte Abwärtsphase' },
  { id: 'i2', name: 'Bankdrücken', sets: 4, reps: '6-8', weightHint: 'Explosiv nach oben' },
  { id: 'i3', name: 'Rudern vorgebeugt', sets: 3, reps: '10-12', weightHint: 'Rücken gerade halten' },
];

const advancedEx = [
  { id: 'a1', name: 'Heavy Deadlift', sets: 5, reps: '3-5', weightHint: 'Maximale Kraftentfaltung' },
  { id: 'a2', name: 'Weighted Pullups', sets: 4, reps: '6-8', weightHint: 'Zusatzgewicht am Gürtel' },
  { id: 'a3', name: 'Overhead Press', sets: 4, reps: '5', weightHint: 'Kein Schwung aus den Beinen' },
];

export const MOCK_PLANS: TrainingPlan[] = [
  {
    id: 'plan-fohlen',
    title: 'Fohlen Fundament',
    durationWeeks: 4,
    focus: 'Strength',
    description: 'Perfekt für den Einstieg. Baue deine Basis und lerne die Bewegungsabläufe.',
    minStrengthScore: 0,
    difficulty: 'Beginner',
    days: [
      { day: 1, name: 'Ganzkörper A', exercises: beginnerEx },
      { day: 2, name: 'Ganzkörper B', exercises: beginnerEx },
    ]
  },
  {
    id: 'plan-stallion',
    title: 'Stallion Strength',
    durationWeeks: 8,
    focus: 'Strength',
    description: 'Mittelschweres Training für Einhörner, die das Eisen bereits kennen.',
    minStrengthScore: 1.5,
    difficulty: 'Intermediate',
    days: [
      { day: 1, name: 'Lower Body Focus', exercises: interEx },
      { day: 2, name: 'Upper Body Focus', exercises: interEx },
    ]
  },
  {
    id: 'plan-legend',
    title: 'Iron Legend',
    durationWeeks: 12,
    focus: 'Hypertrophy',
    description: 'Das ultimative Programm für Fortgeschrittene. Maximale Lasten, maximaler Stolz.',
    minStrengthScore: 2.5,
    difficulty: 'Advanced',
    days: [
      { day: 1, name: 'Push / Pull Heavy', exercises: advancedEx },
      { day: 2, name: 'Legs / Core Heavy', exercises: advancedEx },
    ]
  }
];
