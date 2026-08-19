/**
 * NutriVision AI - Reactive State Management
 */

import { MetabolicCalculator } from './calculator.js';
import { WorkoutScheduleService } from './workout-schedule.js';
import { CountryFoodDatabase } from './country-foods.js';

const STORAGE_KEY_PROFILE = 'nutrivision_profile_v2';
const STORAGE_KEY_LOGS = 'nutrivision_daily_logs_v2';
const STORAGE_KEY_SETTINGS = 'nutrivision_settings_v2';
const STORAGE_KEY_MEALPLAN = 'nutrivision_mealplan_v2';

// Default initial state for a new user
const defaultProfile = {
  name: 'Champion',
  firstName: 'Mohamed',
  lastName: '',
  country: 'TN', // 🇹🇳 Tunisie par défaut
  currency: 'DT',
  age: 24,
  gender: 'male',
  weightKg: 80,
  targetWeightKg: 74,
  heightCm: 178,
  activityLevel: 'moderate',
  goal: 'fat_loss_only', // 'lose_weight', 'fat_loss_only', 'gain_muscle', 'maintain'
  pace: 'moderate',
  workoutType: 'gym', // 'gym', 'cardio', 'home'
  workoutDays: 4,
  workoutTime: '17:30',
  mealCount: 4,
  onboardingCompleted: false
};

class StateManager {
  constructor() {
    this.subscribers = [];
    this.init();
  }

  init() {
    // Load profile
    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    this.profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;
    this.metabolism = MetabolicCalculator.evaluateProfile(this.profile);

    // Initialize synchronized daily timeline & workout plan
    this.dailyTimeline = WorkoutScheduleService.generateDailyTimeline(
      this.profile.workoutTime || '17:30',
      this.profile.mealCount || 4,
      this.profile.workoutType || 'gym'
    );

    this.workoutPlan = WorkoutScheduleService.generateWorkoutPlan(
      this.profile.workoutType || 'gym',
      this.profile.workoutDays || 4,
      this.profile.goal || 'fat_loss_only'
    );

    // Load today's logs
    const todayKey = this.getTodayDateKey();
    const savedLogs = localStorage.getItem(`${STORAGE_KEY_LOGS}_${todayKey}`);
    this.dailyLogs = savedLogs ? JSON.parse(savedLogs) : {
      date: todayKey,
      waterMl: 1250,
      meals: {
        breakfast: [
          { id: 'm1', name: 'Omelette aux herbes & Flocons d\'avoine Choufane', portion: '1 bol (250g)', calories: 380, protein: 26, carbs: 32, fats: 14, sugar: 3 }
        ],
        lunch: [
          { id: 'm2', name: 'Escalope de dinde Chahia, Riz Randa & Légumes', portion: '1 assiette (350g)', calories: 540, protein: 44, carbs: 58, fats: 12, sugar: 4 }
        ],
        dinner: [],
        snacks: [
          { id: 'm3', name: 'Dattes Deglet Nour & Poignée d\'amandes', portion: '100g', calories: 190, protein: 5, carbs: 22, fats: 10, sugar: 14 }
        ]
      }
    };

    // Load settings
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    this.settings = savedSettings ? JSON.parse(savedSettings) : {
      apiKey: '',
      theme: 'dark',
      language: 'fr',
      soundEnabled: true,
      alarmsEnabled: true
    };

    // Load meal plan
    const savedPlan = localStorage.getItem(STORAGE_KEY_MEALPLAN);
    this.mealPlan = savedPlan ? JSON.parse(savedPlan) : null;

    // Chat history
    this.chatMessages = [
      {
        sender: 'ai',
        text: 'Bonjour ! Je suis votre coach nutritionnel et sportif IA NutriVision. Posez-moi vos questions sur vos repas locaux (Délice, Chahia, Couscous...) ou vos entraînements en salle (en Derja ou Français) ! 💪'
      }
    ];

    // Current active tab
    this.activeTab = 'dashboard';

    // Last scanned item
    this.lastScanResult = null;
  }

  getTodayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Subscribe to changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(eventType, payload) {
    this.subscribers.forEach(cb => cb(eventType, payload, this));
  }

  // Update profile
  updateProfile(newProfileData) {
    this.profile = { ...this.profile, ...newProfileData };
    this.profile.currency = CountryFoodDatabase.getCurrency(this.profile.country);
    this.metabolism = MetabolicCalculator.evaluateProfile(this.profile);
    this.updateWorkoutAndTimeline();
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(this.profile));
    this.notify('PROFILE_UPDATED', this.profile);
  }

  // Synchronize Workout Plan & Daily Timeline
  updateWorkoutAndTimeline() {
    this.dailyTimeline = WorkoutScheduleService.generateDailyTimeline(
      this.profile.workoutTime || '17:30',
      this.profile.mealCount || 4,
      this.profile.workoutType || 'gym'
    );

    this.workoutPlan = WorkoutScheduleService.generateWorkoutPlan(
      this.profile.workoutType || 'gym',
      this.profile.workoutDays || 4,
      this.profile.goal || 'fat_loss_only'
    );

    this.notify('TIMELINE_UPDATED', this.dailyTimeline);
    this.notify('WORKOUT_UPDATED', this.workoutPlan);
  }

  // Save Settings (API Key, Theme, Alarms, etc.)
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
    this.notify('SETTINGS_UPDATED', this.settings);
  }

  // Add food item to specific meal
  addFoodItem(mealType, foodItem) {
    if (!this.dailyLogs.meals[mealType]) {
      this.dailyLogs.meals[mealType] = [];
    }
    const itemWithId = {
      ...foodItem,
      id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    this.dailyLogs.meals[mealType].push(itemWithId);
    this.persistDailyLogs();
    this.notify('FOOD_LOGGED', { mealType, item: itemWithId });
  }

  // Remove food item
  removeFoodItem(mealType, itemId) {
    if (this.dailyLogs.meals[mealType]) {
      this.dailyLogs.meals[mealType] = this.dailyLogs.meals[mealType].filter(item => item.id !== itemId);
      this.persistDailyLogs();
      this.notify('FOOD_REMOVED', { mealType, itemId });
    }
  }

  // Water intake adjustments
  addWater(amountMl = 250) {
    this.dailyLogs.waterMl = (this.dailyLogs.waterMl || 0) + amountMl;
    this.persistDailyLogs();
    this.notify('WATER_UPDATED', this.dailyLogs.waterMl);
  }

  resetWater() {
    this.dailyLogs.waterMl = 0;
    this.persistDailyLogs();
    this.notify('WATER_UPDATED', this.dailyLogs.waterMl);
  }

  persistDailyLogs() {
    const todayKey = this.getTodayDateKey();
    localStorage.setItem(`${STORAGE_KEY_LOGS}_${todayKey}`, JSON.stringify(this.dailyLogs));
  }

  // Calculate consumed totals for today
  getTodayTotals() {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    let sugar = 0;
    let fiber = 0;

    Object.values(this.dailyLogs.meals).forEach(mealArray => {
      mealArray.forEach(item => {
        calories += parseFloat(item.calories) || 0;
        protein += parseFloat(item.protein) || 0;
        carbs += parseFloat(item.carbs) || 0;
        fats += parseFloat(item.fats) || 0;
        sugar += parseFloat(item.sugar) || 0;
        fiber += parseFloat(item.fiber) || 0;
      });
    });

    const targetCal = this.metabolism.targetCalories;
    const remainingCal = Math.max(0, targetCal - calories);

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      sugar: Math.round(sugar),
      fiber: Math.round(fiber),
      targetCalories: targetCal,
      remainingCalories: remainingCal,
      caloriePercentage: Math.min(100, Math.round((calories / targetCal) * 100)),
      isOverBudget: calories > targetCal
    };
  }

  // Save Generated Meal Plan
  saveMealPlan(plan) {
    this.mealPlan = plan;
    localStorage.setItem(STORAGE_KEY_MEALPLAN, JSON.stringify(plan));
    this.notify('MEALPLAN_UPDATED', plan);
  }

  // Add chat message
  addChatMessage(sender, text) {
    const msg = { sender, text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatMessages.push(msg);
    this.notify('CHAT_MESSAGE_ADDED', msg);
    return msg;
  }
}

export const appState = new StateManager();
