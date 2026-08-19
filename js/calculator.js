/**
 * NutriVision AI - Scientific Nutrition & Metabolic Calculator
 * Uses Mifflin-St Jeor equation & evidence-based macronutrient distribution.
 */

export const MetabolicCalculator = {
  // Calculate Basal Metabolic Rate (BMR)
  calculateBMR({ gender, weightKg, heightCm, ageYears }) {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    const a = parseFloat(ageYears);

    if (gender === 'female') {
      return Math.round((10 * w) + (6.25 * h) - (5 * a) - 161);
    }
    // Default Male
    return Math.round((10 * w) + (6.25 * h) - (5 * a) + 5);
  },

  // Activity Multipliers
  activityMultipliers: {
    sedentary: 1.2,        // Little or no exercise, desk job
    light: 1.375,          // Light exercise 1-3 days/week
    moderate: 1.55,        // Moderate exercise 3-5 days/week
    active: 1.725,         // Hard exercise 6-7 days/week
    extra_active: 1.9      // Very hard exercise & physical job
  },

  // Calculate Total Daily Energy Expenditure (TDEE)
  calculateTDEE(bmr, activityLevel) {
    const multiplier = this.activityMultipliers[activityLevel] || 1.375;
    return Math.round(bmr * multiplier);
  },

  // Calculate Target Daily Calories based on Goal & Pace
  calculateTargetCalories(tdee, goal, pace = 'moderate') {
    let calorieDelta = 0;

    switch (goal) {
      case 'lose_weight': // Noth3ef / Perdre du poids & graisse
        if (pace === 'mild') calorieDelta = -300;
        else if (pace === 'aggressive') calorieDelta = -750;
        else calorieDelta = -500; // Moderate 0.5kg/week loss
        break;

      case 'fat_loss_only': // Just ytayah chwaya graisse khaw / Recomposition corporelle
        calorieDelta = -220; // Slight deficit to preserve all muscle while burning stubborn fat
        break;

      case 'gain_muscle': // Nesmen / Prendre de la masse / Bulk
        if (pace === 'mild') calorieDelta = 250;
        else if (pace === 'aggressive') calorieDelta = 500;
        else calorieDelta = 350; // Lean bulk
        break;

      case 'maintain': // Maintien du poids & forme
      default:
        calorieDelta = 0;
        break;
    }

    const targetCalories = Math.max(1200, Math.round(tdee + calorieDelta));
    return {
      targetCalories,
      calorieDelta,
      maintenanceCalories: tdee
    };
  },

  // Calculate Optimal Macronutrients (Protein, Carbs, Fats, Fiber, Sugar)
  calculateMacros({ weightKg, targetCalories, goal, workoutType }) {
    const w = parseFloat(weightKg);
    let proteinGramsPerKg = 2.0;

    if (goal === 'lose_weight') {
      proteinGramsPerKg = 2.2;
    } else if (goal === 'fat_loss_only') {
      proteinGramsPerKg = 2.3; // Maximum protein for body recomposition
    } else if (goal === 'gain_muscle') {
      proteinGramsPerKg = 2.0;
    } else {
      proteinGramsPerKg = 1.8;
    }

    const proteinGrams = Math.round(w * proteinGramsPerKg);
    const proteinCalories = proteinGrams * 4;

    // Dietary Fats: ~25-28% of total calories
    const fatCalories = targetCalories * (goal === 'fat_loss_only' ? 0.25 : 0.28);
    const fatGrams = Math.round(fatCalories / 9);

    // Carbohydrates: Remaining calories
    const carbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbGrams = Math.round(carbCalories / 4);

    // Dietary Fiber recommendation (14g per 1000 kcal)
    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    // Added Sugar safe daily limit (< 7% of total calories)
    const sugarLimitGrams = Math.round((targetCalories * 0.07) / 4);

    // Water target (ml): 35ml per kg of bodyweight + workout buffer (500-800ml)
    const workoutBonus = (workoutType === 'gym' || workoutType === 'cardio') ? 800 : 500;
    const waterTargetMl = Math.round(w * 35 + workoutBonus);

    return {
      proteinGrams,
      carbGrams,
      fatGrams,
      fiberGrams,
      sugarLimitGrams,
      waterTargetMl,
      percentages: {
        protein: Math.round((proteinCalories / targetCalories) * 100),
        carbs: Math.round((carbCalories / targetCalories) * 100),
        fats: Math.round((fatCalories / targetCalories) * 100)
      }
    };
  },

  // Complete profile evaluation
  evaluateProfile(userData) {
    const bmr = this.calculateBMR(userData);
    const tdee = this.calculateTDEE(bmr, userData.activityLevel);
    const { targetCalories, calorieDelta, maintenanceCalories } = this.calculateTargetCalories(tdee, userData.goal, userData.pace || 'moderate');
    const macros = this.calculateMacros({
      weightKg: userData.weightKg,
      targetCalories,
      goal: userData.goal,
      workoutType: userData.workoutType
    });

    // Calculate estimated time to reach target weight if target weight is specified
    let estimatedWeeks = null;
    if (userData.targetWeightKg && userData.targetWeightKg !== userData.weightKg) {
      const weightDiff = Math.abs(parseFloat(userData.weightKg) - parseFloat(userData.targetWeightKg));
      const weeklyChangeKg = Math.abs(calorieDelta) * 7 / 7700; // 7700 kcal ~= 1kg fat
      if (weeklyChangeKg > 0) {
        estimatedWeeks = Math.ceil(weightDiff / weeklyChangeKg);
      }
    }

    return {
      bmr,
      tdee,
      maintenanceCalories,
      targetCalories,
      calorieDelta,
      estimatedWeeks,
      ...macros
    };
  }
};
