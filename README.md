# 🍎 NutriVision AI Pro - Nutrition, Scanner & Coach Sportif par IA

NutriVision AI Pro est une application complète, moderne et intelligente de suivi nutritionnel, d'estimation calorique par vision IA, de calcul métabolique, de marché alimentaire localisé avec vrais prix (Tunisie 🇹🇳 et international), de programme d'entraînement personnalisé (Musculation/Cardio), d'emploi du temps synchronisé et d'alarmes intelligentes.

---

## 🌟 Nouvelles Fonctionnalités Majeures

### 1. 🚀 Assistant d'Onboarding Complet (Premier Lancement)
- **Étape 1 : Identité & Pays** : Prénom (Essmek), Nom (La9abek), Pays de résidence (🇹🇳 Tunisie, 🇫🇷 France, 🇩🇿 Algérie, 🇲🇦 Maroc, 🇨🇦 Canada).
- **Étape 2 : Données Biométriques** : Âge (3omor), Sexe, Taille (Toul cm), Poids (Mizen kg), Poids cible (kg). Calcul en direct du BMR & TDEE.
- **Étape 3 : Objectif Précis** :
  - 🔥 **Perte de poids globale (Yon9oss fel poids)**
  - ⚡ **Brûler uniquement la graisse & Recomposition (Ytayah graisse khaw)** : déficit léger avec protéines maximales pour sculpter le corps.
  - 💪 **Prise de masse musculaire (Yzid fel poids / Bulk)**
  - ⚖️ **Maintien & Forme**
- **Étape 4 : Sport & Heure d'entraînement** : Musculation en salle (Gym), Cardio & Running, Maison + Heure de la séance (ex: 17h30).
- **Étape 5 : Rythme des Repas (3, 4 ou 5 repas) & Alarmes** : Activation des alertes sonores de repas et récapitulatif avec calcul de l'eau en litres.

---

### 2. 🛒 Marché des Aliments Locaux avec Vrais Prix & Marques
- **Base dédiée pour la Tunisie 🇹🇳** en Dinars Tunisiens (DT) avec vraies marques :
  - *Lait Délice demi-écrémé 1L* : **1.400 DT**
  - *Escalope de dinde Chahia / Mazraa 500g* : **8.800 DT**
  - *Thon entier El Manar / Sidi Daoud 160g* : **4.200 DT**
  - *Plateau de 6 Œufs fermiers* : **2.250 DT**
  - *Ricotta / Jben Douz 200g* : **2.600 DT**
  - *Choufane / Flocons d'avoine Beldiet 500g* : **4.500 DT**
  - *Riz Basmati Randa 500g* : **3.400 DT**
  - *Dattes Deglet Nour 500g* : **5.200 DT**
  - *Huile d'olive extra vierge 1L* : **18.000 DT**
  - *Yaourt Vitalait / Danup* : **0.650 DT**
- Bouton **"+ Journal"** pour ajouter n'importe quel aliment local directement dans son repas !

---

### 3. 🏋️‍♂️ Programme d'Entraînement 7 Jours (Gym Split Pro / Cardio / Maison)
- Séances complètes : **Push / Pull / Legs / Upper / Abdominaux**.
- Exercices détaillés, nombre de séries, répétitions cibles, temps de repos et conseils d'exécution.

---

### 4. ⏰ Emploi du Temps Synchronisé (Repas + Sport + Hydratation)
- Timeline journalière calculée automatiquement :
  - **07:30** : Réveil & Grand verre d'eau (500ml) 💧
  - **08:00** : Repas 1 (Petit-déjeuner énergétique) 🍳
  - **12:30** : Repas 2 (Déjeuner équilibré) 🥗
  - **16:30** : Collation pré-entraînement (1h avant la séance) 🍌
  - **17:30 - 18:45** : 🏋️‍♂️ **Séance de Musculation / Sport**
  - **19:30** : Repas 3 (Dîner récupération musculaire) 🍲
  - **22:00** : Dernier verre d'eau & Nuit réparatrice 🌙

---

### 5. 🔔 Système d'Alarmes & Notifications Sonores
- **Carillon musical synthétisé (Web Audio API)** : sonne à l'heure exacte sur mobile et ordinateur.
- **Notifications navigateur / Push**.
- **Modale d'alarme interactive** avec cloche animée, bouton *"C'est fait !"* et bouton *"Rappeler dans 10 min"*.
- Bouton de test audio dans les paramètres.

---

## 🛠️ Lancement en Local

```bash
# Dans le dossier nutrivision-ai :
python -m http.server 8080
```
Ouvrez votre navigateur sur : **[http://localhost:8080](http://localhost:8080)**

---

## 📱 Publication sur Google Play Store & Apple App Store

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
npx cap open ios
```
