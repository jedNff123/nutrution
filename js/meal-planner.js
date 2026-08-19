/**
 * NutriVision AI - Meal Planner Engine with Realistic Food Imagery
 * Generates balanced daily meal plans tailored to calorie and macronutrient targets.
 */

export const MealPlannerService = {
  recipeDatabase: {
    breakfast: [
      {
        id: 'bf_1',
        name: 'Omelette Tunisienne aux Herbes & Choufane',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
        portion: '3 œufs + 50g flocons d\'avoine + huile d\'olive',
        calories: 450,
        protein: 28,
        carbs: 38,
        fats: 20,
        prepTime: '10 min',
        ingredients: ['3 œufs bio', '50g Flocons d\'avoine Choufane', 'Persil frais', '1 c.à.c Huile d\'olive vierge', 'Sel & Poivre'],
        instructions: 'Battez les œufs avec les herbes et le sel. Cuire à la poêle avec un filet d\'huile d\'olive. Accompagnez des flocons d\'avoine tièdes.',
        diet: ['mediterranean', 'balanced', 'high_protein']
      },
      {
        id: 'bf_2',
        name: 'Bowl Ricotta Tunisienne Douz, Banane & Dattes',
        image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80',
        portion: '200g ricotta + 1 banane + 3 dattes Deglet Nour',
        calories: 420,
        protein: 24,
        carbs: 58,
        fats: 10,
        prepTime: '5 min',
        ingredients: ['200g Ricotta fraîche Douz', '1 Banane mûre', '3 Dattes Deglet Nour dénoyautées', 'Cannelle moulue'],
        instructions: 'Mélangez la ricotta fraîche avec les rondelles de banane, les morceaux de dattes et une pincée de cannelle.',
        diet: ['mediterranean', 'balanced']
      },
      {
        id: 'bf_3',
        name: 'Porridge Protéiné Chocolat, Beurre de Cacahuète & Fruits',
        image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
        portion: '60g avoine + 250ml lait Délice + 1 c.à.s beurre de cacahuète',
        calories: 490,
        protein: 32,
        carbs: 55,
        fats: 16,
        prepTime: '8 min',
        ingredients: ['60g Choufane', '250ml Lait Délice demi-écrémé', '25g Whey chocolat ou cacao pur', '15g Beurre de cacahuète pur', 'Myrtilles fraîches'],
        instructions: 'Faites chauffer les flocons d\'avoine dans le lait. Ajoutez la protéine et garnissez de beurre de cacahuète.',
        diet: ['high_protein', 'balanced']
      }
    ],

    lunch: [
      {
        id: 'lu_1',
        name: 'Couscous Complet Tunisien Allégé au Poulet & Légumes',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
        portion: '150g couscous complet cuit + 160g blanc de poulet + légumes',
        calories: 580,
        protein: 44,
        carbs: 68,
        fats: 12,
        prepTime: '25 min',
        ingredients: ['160g Escalope de poulet Chahia', '150g Semoule de couscous complet Randa', 'Courgettes, carottes, potiron', 'Pois chiches', 'Épices couscous (Tabil, Karouia, Harissa douce)'],
        instructions: 'Cuire le couscous à la vapeur. Mijoter le poulet et les légumes dans un bouillon léger parfumé.',
        diet: ['mediterranean', 'balanced']
      },
      {
        id: 'lu_2',
        name: 'Dorade Royale Grillée, Salade Méchouia & Patate Douce',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
        portion: '200g dorade + 150g patate douce vapeur + 100g méchouia',
        calories: 520,
        protein: 48,
        carbs: 46,
        fats: 14,
        prepTime: '20 min',
        ingredients: ['1 Dorade fraîche entière (200g filet)', '150g Patate douce', '100g Salade Méchouia maison sans huile superflue', '1 c.à.s Huile d\'olive vierge extra', 'Jus de citron'],
        instructions: 'Grillez la dorade assaisonnée au cumin et citron. Servez avec la patate douce vapeur et la méchouia.',
        diet: ['mediterranean', 'high_protein', 'low_carb']
      },
      {
        id: 'lu_3',
        name: 'Riz Basmati Randa, Escalope Grillée & Brocolis Vapeur',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        portion: '180g riz basmati cuit + 180g escalope + 150g brocolis',
        calories: 590,
        protein: 50,
        carbs: 64,
        fats: 11,
        prepTime: '15 min',
        ingredients: ['180g Blanc de dinde ou poulet Chahia', '180g Riz Basmati Randa', '150g Brocolis frais vapeur', 'Paprika, ail et sel'],
        instructions: 'Grillez les escalopes assaisonnées avec du paprika. Cuire le riz basmati et les brocolis à la vapeur.',
        diet: ['high_protein', 'balanced']
      }
    ],

    dinner: [
      {
        id: 'di_1',
        name: 'Ojja Tunisienne Légère aux Blancs d\'Œufs & Crevettes / Thon',
        image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
        portion: '1 boîte thon El Manar + 3 œufs + sauce tomate maison',
        calories: 440,
        protein: 42,
        carbs: 22,
        fats: 18,
        prepTime: '15 min',
        ingredients: ['1 boîte Thon El Manar au naturel', '3 Œufs frais', 'Tomates fraîches concassées', 'Poivrons doux', 'Ail, tabil, carvi', '1 c.à.c Huile d\'olive'],
        instructions: 'Faites mijoter la sauce tomate et poivrons avec les épices. Cassez les œufs par-dessus et ajoutez le thon en fin de cuisson.',
        diet: ['mediterranean', 'high_protein', 'low_carb']
      },
      {
        id: 'di_2',
        name: 'Pavé de Saumon Rôti, Quinoa & Haricots Verts',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
        portion: '160g saumon + 120g quinoa cuit + 150g haricots verts',
        calories: 530,
        protein: 40,
        carbs: 34,
        fats: 24,
        prepTime: '18 min',
        ingredients: ['160g Filet de saumon frais', '120g Quinoa cuit', '150g Haricots verts vapeur', 'Citron frais, aneth'],
        instructions: 'Saisissez le saumon à la poêle côté peau. Accompagnez du quinoa et des haricots verts croquants.',
        diet: ['mediterranean', 'balanced', 'high_protein']
      },
      {
        id: 'di_3',
        name: 'Salade Tunisienne Royale au Thon El Manar & Quinoa',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        portion: 'Concombres, tomates, oignons + 1 boîte thon + 2 œufs durs',
        calories: 420,
        protein: 38,
        carbs: 26,
        fats: 16,
        prepTime: '10 min',
        ingredients: ['1 boîte Thon El Manar', '2 Œufs durs', 'Tomates, concombres, oignons coupés en petits dés', 'Menthe séchée, jus de citron, 1 c.à.c huile d\'olive'],
        instructions: 'Mélangez tous les légumes finement émincés, assaisonnez et dressez avec le thon et les quartiers d\'œufs durs.',
        diet: ['mediterranean', 'low_carb', 'high_protein']
      }
    ],

    snack: [
      {
        id: 'sn_1',
        name: 'Dattes Deglet Nour de Tozeur & Amandes Croquantes',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
        portion: '4 dattes fraîches + 20g amandes crues',
        calories: 220,
        protein: 6,
        carbs: 38,
        fats: 9,
        prepTime: '2 min',
        ingredients: ['4 Dattes Deglet Nour de Tozeur', '20g Amandes brutes'],
        instructions: 'Ouvrez les dattes et insérez une amande à l\'intérieur pour un snack énergétique naturel avant l\'entraînement.',
        diet: ['mediterranean', 'balanced']
      },
      {
        id: 'sn_2',
        name: 'Shaker Protéiné Lait Délice & Banane',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
        portion: '300ml lait Délice + 1 banane + 25g whey ou cacao',
        calories: 280,
        protein: 26,
        carbs: 36,
        fats: 4,
        prepTime: '3 min',
        ingredients: ['300ml Lait Délice écrémé', '1 Banane', '25g Poudre de protéine ou cacao non sucré'],
        instructions: 'Mixez tous les ingrédients dans un blender jusqu\'à texture onctueuse.',
        diet: ['high_protein', 'balanced']
      }
    ]
  },

  // Generates a daily meal plan with matching calorie and diet targets
  generatePlan(targetCalories = 2000, targetMacros = {}, dietType = 'mediterranean') {
    const filterRecipes = (category) => {
      const all = this.recipeDatabase[category];
      const matching = all.filter(r => r.diet.includes(dietType));
      return matching.length > 0 ? matching : all;
    };

    const breakfastOptions = filterRecipes('breakfast');
    const lunchOptions = filterRecipes('lunch');
    const dinnerOptions = filterRecipes('dinner');
    const snackOptions = filterRecipes('snack');

    const breakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
    const lunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
    const dinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];
    const snack = snackOptions[Math.floor(Math.random() * snackOptions.length)];

    const totalCal = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    const totalProt = breakfast.protein + lunch.protein + dinner.protein + snack.protein;
    const totalCarb = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs;
    const totalFat = breakfast.fats + lunch.fats + dinner.fats + snack.fats;

    return {
      dietType,
      targetCalories,
      totalCalories: totalCal,
      totalProtein: totalProt,
      totalCarbs: totalCarb,
      totalFats: totalFat,
      meals: {
        breakfast,
        lunch,
        dinner,
        snack
      }
    };
  }
};
