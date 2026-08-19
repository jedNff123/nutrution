/**
 * NutriVision AI - Workout & Synchronized Timetable Engine
 * Builds 7-day training splits with anatomical exercise links and scheduled daily timeline.
 */

export const WorkoutScheduleService = {
  // Generate 7-day Workout Plan based on type and days
  generateWorkoutPlan(workoutType = 'gym', daysPerWeek = 4, goal = 'fat_loss_only') {
    if (workoutType === 'gym') {
      return this.getGymProgram(daysPerWeek, goal);
    } else if (workoutType === 'cardio') {
      return this.getCardioProgram(daysPerWeek, goal);
    } else {
      return this.getHomeProgram(daysPerWeek, goal);
    }
  },

  getGymProgram(days, goal) {
    const isFatLoss = goal === 'lose_weight' || goal === 'fat_loss_only';
    
    return {
      type: 'gym',
      title: 'Programme Musculation en Salle (Gym Pro Split)',
      description: isFatLoss 
        ? 'Optimisé pour brûler le tissu adipeux tout en conservant et sculptant une masse musculaire dense.' 
        : 'Optimisé pour l\'hypertrophie musculaire et le gain de force progressif.',
      daysPerWeek: days,
      schedule: [
        {
          dayName: 'Lundi',
          focus: 'Pectoraux, Épaules & Triceps (Push Day)',
          icon: '🏋️‍♂️',
          duration: '60-75 min',
          exercises: [
            { key: 'dumbbell_bench_press', name: 'Développé Couché aux Haltères', sets: 4, reps: '8-10', rest: '90s', tip: 'Contrôler la descente sur 2 secondes, exploser à la montée.' },
            { key: 'incline_dumbbell_press', name: 'Développé Incliné aux Haltères', sets: 3, reps: '10-12', rest: '75s', tip: 'Cible le haut des pectoraux.' },
            { key: 'lateral_raises', name: 'Élévations Latérales aux Haltères', sets: 4, reps: '12-15', rest: '60s', tip: 'Garder les coudes légèrement fléchis pour élargir les épaules.' },
            { key: 'overhead_press', name: 'Développé Militaire aux Haltères / Barre', sets: 3, reps: '10', rest: '75s', tip: 'Gainer les abdominaux pendant le mouvement.' },
            { key: 'tricep_pushdown', name: 'Extensions Triceps à la Poulie Haute', sets: 4, reps: '12-15', rest: '60s', tip: 'Bloquer les coudes le long du corps.' }
          ]
        },
        {
          dayName: 'Mardi',
          focus: 'Dos, Arrière d\'épaules & Biceps (Pull Day)',
          icon: '💪',
          duration: '60-70 min',
          exercises: [
            { key: 'lat_pulldown', name: 'Tirage Vertical à la Poulie Haute (Lat Pulldown)', sets: 4, reps: '8-10', rest: '90s', tip: 'Bien resserrer les omoplates en fin de tirage.' },
            { key: 'barbell_row', name: 'Rowing Buste Penché à la Barre', sets: 4, reps: '10-12', rest: '75s', tip: 'Épaissit le dos et renforce les lombaires.' },
            { key: 'lateral_raises', name: 'Oiseau aux Haltères / Arrière d\'épaules', sets: 3, reps: '15', rest: '60s', tip: 'Indispensable pour la posture et les épaules 3D.' },
            { key: 'bicep_curl', name: 'Curl Biceps aux Haltères (Supination)', sets: 4, reps: '10-12', rest: '60s', tip: 'Étirement maximal du biceps en bas du mouvement.' },
            { key: 'bicep_curl', name: 'Curl Marteau aux Haltères (Brachial)', sets: 3, reps: '12', rest: '60s', tip: 'Donne de l\'épaisseur au bras.' }
          ]
        },
        {
          dayName: 'Mercredi',
          focus: 'Repos Actif ou Cardio Récupération',
          icon: '🚶‍♂️',
          duration: '30-45 min',
          exercises: [
            { key: 'hanging_leg_raise', name: 'Marche Rapide Inclinée sur Tapis & Abdos', sets: 1, reps: '30 min', rest: '-', tip: 'Zone 2 cardio pour brûler les graisses sans fatigue.' },
            { key: 'hanging_leg_raise', name: 'Relevés de Jambes & Gainage', sets: 3, reps: '15 reps', rest: '45s', tip: 'Améliore la tonicité abdominale.' }
          ]
        },
        {
          dayName: 'Jeudi',
          focus: 'Jambes Complètes & Mollets (Legs Day)',
          icon: '🦵',
          duration: '65-75 min',
          exercises: [
            { key: 'barbell_squat', name: 'Squat à la Barre Olympique', sets: 4, reps: '8-10', rest: '120s', tip: 'Pousser sur les talons, dos bien droit.' },
            { key: 'barbell_squat', name: 'Fentes Marchées aux Haltères', sets: 3, reps: '12 par jambe', rest: '75s', tip: 'Excellent pour les fessiers et quadriceps.' },
            { key: 'romanian_deadlift', name: 'Soulevé de Terre Jambes Tendues (Ischios)', sets: 4, reps: '10-12', rest: '90s', tip: 'Ressentir l\'étirement à l\'arrière des cuisses.' },
            { key: 'leg_curl', name: 'Leg Curl Ischio-jambiers', sets: 3, reps: '12-15', rest: '60s', tip: 'Contrôler la phase négative.' }
          ]
        },
        {
          dayName: 'Vendredi',
          focus: 'Haut du Corps & Abdominaux (Upper & Core)',
          icon: '🔥',
          duration: '60 min',
          exercises: [
            { key: 'dips', name: 'Dips aux Barres Parallèles', sets: 3, reps: '10-12', rest: '75s', tip: 'Travail puissant du buste et des bras.' },
            { key: 'lat_pulldown', name: 'Tirage Horizontal à la Poulie Basse', sets: 4, reps: '12', rest: '60s', tip: 'Gardez le torse bombé.' },
            { key: 'hanging_leg_raise', name: 'Relevés de Jambes Suspendu à la Barre', sets: 4, reps: '15', rest: '45s', tip: 'Cible le bas des abdominaux.' }
          ]
        },
        {
          dayName: 'Samedi & Dimanche',
          focus: 'Repos & Régénération Musculaire',
          icon: '🛌',
          duration: 'Repos',
          exercises: [
            { key: 'pushups', name: 'Sommeil Réparateur & Récupération (8h)', sets: 1, reps: '8h', rest: '-', tip: 'C\'est pendant le sommeil que le muscle se reconstruit et que le gras se consume.' },
            { key: 'pushups', name: 'Hydratation Continue (2.5L+)', sets: 1, reps: 'Eau', rest: '-', tip: 'Boire régulièrement tout au long du week-end.' }
          ]
        }
      ]
    };
  },

  getCardioProgram(days, goal) {
    return {
      type: 'cardio',
      title: 'Programme Cardio, HIIT & Brûleur de Graisses',
      description: 'Axé sur le déficit calorique, l\'endurance cardiovasculaire et la définition des abdominaux.',
      daysPerWeek: days,
      schedule: [
        {
          dayName: 'Lundi',
          focus: 'HIIT Fractionné Sprints & Abdominaux',
          icon: '⚡',
          duration: '45 min',
          exercises: [
            { key: 'hanging_leg_raise', name: 'Sprints Fractionnés (30s sprint / 30s marche)', sets: 10, reps: '10 rounds', rest: '30s', tip: 'Donner 100% de l\'intensité sur chaque sprint.' },
            { key: 'hanging_leg_raise', name: 'Circuit Abdos (Crunchs, Relevés de bassin)', sets: 3, reps: '20 reps', rest: '45s', tip: 'Brûlure intense garantie.' }
          ]
        },
        {
          dayName: 'Mercredi',
          focus: 'Course d\'Endurance Fondamentale (Zone 2)',
          icon: '🏃‍♂️',
          duration: '50 min',
          exercises: [
            { key: 'hanging_leg_raise', name: 'Course en Continu Allure Modérée', sets: 1, reps: '45 min', rest: '-', tip: 'Allure où vous pouvez parler sans être essoufflé.' }
          ]
        },
        {
          dayName: 'Vendredi',
          focus: 'Circuit Cardio-Renforcement au Poids du Corps',
          icon: '🔥',
          duration: '45 min',
          exercises: [
            { key: 'pushups', name: 'Burpees & Pompes Explosives', sets: 4, reps: '15 reps', rest: '45s', tip: 'Explosivité maximale.' },
            { key: 'hanging_leg_raise', name: 'Mountain Climbers Rapides', sets: 4, reps: '30s', rest: '30s', tip: 'Gainer fort la ceinture abdominale.' }
          ]
        }
      ]
    };
  },

  getHomeProgram(days, goal) {
    return {
      type: 'home',
      title: 'Programme Maison Sans Matériel (Home Fitness)',
      description: 'Développez votre condition physique et sculptez votre corps directement chez vous.',
      daysPerWeek: days,
      schedule: [
        {
          dayName: 'Séance A (Haut du corps & Abdos)',
          focus: 'Pectoraux, Bras & Ceinture Abdominale',
          icon: '🏠',
          duration: '40 min',
          exercises: [
            { key: 'pushups', name: 'Pompes Classiques ou sur Genoux', sets: 4, reps: '12-15', rest: '60s', tip: 'Corps aligné comme une planche.' },
            { key: 'dips', name: 'Dips sur Chaise ou Canapé', sets: 3, reps: '12', rest: '60s', tip: 'Cible les triceps.' },
            { key: 'hanging_leg_raise', name: 'Gainage Planche Statique', sets: 4, reps: '45s', rest: '45s', tip: 'Serrer le ventre au maximum.' }
          ]
        },
        {
          dayName: 'Séance B (Jambes & Cardio)',
          focus: 'Cuisses, Fessiers & Brûle-graisse',
          icon: '🦵',
          duration: '40 min',
          exercises: [
            { key: 'barbell_squat', name: 'Squats au Poids du Corps Tempo Lent', sets: 4, reps: '20', rest: '60s', tip: 'Descendre sous la parallèle.' },
            { key: 'barbell_squat', name: 'Fentes Arrières Alternées', sets: 3, reps: '15 par jambe', rest: '60s', tip: 'Genou arrière frôle le sol.' },
            { key: 'hanging_leg_raise', name: 'Squats Sautés Explosifs', sets: 3, reps: '12', rest: '60s', tip: 'Amortir la réception en douceur.' }
          ]
        }
      ]
    };
  },

  // Build Synchronized Daily Schedule Timeline (Emploi du temps repas + entrainement)
  generateDailyTimeline(workoutTimeStr = '17:30', mealCount = 4, workoutType = 'gym') {
    const [wHour, wMinute] = workoutTimeStr.split(':').map(Number);
    const workoutMinutesFromMidnight = (wHour || 17) * 60 + (wMinute || 30);

    const timeline = [];

    // 1. Wake up & First Water Glass
    timeline.push({
      time: '07:30',
      title: 'Réveil & Grand Verre d\'Eau (500ml) 💧',
      category: 'water',
      typeText: 'Hydratation',
      desc: 'Réveille votre métabolisme et réhydrate votre corps après le sommeil.',
      alarmEnabled: true
    });

    // 2. Breakfast (Meal 1)
    timeline.push({
      time: '08:00',
      title: 'Repas 1 : Petit-Déjeuner Énergétique 🍳',
      category: 'meal',
      typeText: 'Ftour Sbah',
      desc: 'Riche en protéines et glucides complexes pour lancer votre journée.',
      alarmEnabled: true
    });

    // 3. Mid-morning Hydration
    timeline.push({
      time: '10:30',
      title: 'Pause Eau & Hydratation (250ml) 💧',
      category: 'water',
      typeText: 'Hydratation',
      desc: 'Maintient un niveau d\'énergie constant et élimine les toxines.',
      alarmEnabled: false
    });

    // 4. Lunch (Meal 2)
    timeline.push({
      time: '12:30',
      title: 'Repas 2 : Déjeuner Complet & Équilibré 🥗',
      category: 'meal',
      typeText: 'Ftour Noss Nhar',
      desc: 'Protéines maigres (Poulet/Thon), féculents complets et légumes verts.',
      alarmEnabled: true
    });

    // 5. Pre-Workout Snack (1h before workout)
    const preWorkoutMin = Math.max(13 * 60, workoutMinutesFromMidnight - 60);
    const preH = String(Math.floor(preWorkoutMin / 60)).padStart(2, '0');
    const preM = String(preWorkoutMin % 60).padStart(2, '0');

    if (mealCount >= 4) {
      timeline.push({
        time: `${preH}:${preM}`,
        title: 'Collation Pré-Entraînement & Eau (250ml) 🍌',
        category: 'snack',
        typeText: 'Collation Énergie',
        desc: 'Banane, dattes ou shaker de protéines pour faire le plein de carburant.',
        alarmEnabled: true
      });
    }

    // 6. Workout Session
    const endWorkoutMin = workoutMinutesFromMidnight + 75;
    const endH = String(Math.floor(endWorkoutMin / 60)).padStart(2, '0');
    const endM = String(endWorkoutMin % 60).padStart(2, '0');

    timeline.push({
      time: workoutTimeStr,
      title: `Séance de ${workoutType === 'gym' ? 'Musculation (Gym)' : workoutType === 'cardio' ? 'Cardio & HIIT' : 'Sport Maison'} 🏋️‍♂️`,
      category: 'workout',
      typeText: `Entraînement (${workoutTimeStr} - ${endH}:${endM})`,
      desc: 'Donnez le meilleur de vous-même ! Pensez à boire des petites gorgées pendant la séance.',
      alarmEnabled: true
    });

    // 7. Dinner / Post-Workout (Meal 3)
    const dinnerMin = Math.min(21 * 60, endWorkoutMin + 45);
    const dinH = String(Math.floor(dinnerMin / 60)).padStart(2, '0');
    const dinM = String(dinnerMin % 60).padStart(2, '0');

    timeline.push({
      time: `${dinH}:${dinM}`,
      title: 'Repas 3 : Dîner Récupération Musculaire 🍲',
      category: 'meal',
      typeText: '3ché Récupération',
      desc: 'Recharge les stocks d\'énergie et fournit les acides aminés essentiels à la réparation musculaire.',
      alarmEnabled: true
    });

    // 8. Night Hydration & Bedtime
    timeline.push({
      time: '22:00',
      title: 'Dernier Verre d\'Eau & Sommeil Réparateur 🌙',
      category: 'water',
      typeText: 'Nuit & Récupération',
      desc: 'Préparez votre nuit (7h30 minimum) pour une régénération physique optimale.',
      alarmEnabled: false
    });

    return timeline.sort((a, b) => a.time.localeCompare(b.time));
  }
};
