import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ChevronLeft, Camera, Upload, Info, X, Palette } from 'lucide-react';
import { CatProfile, UnitPreferences, ThemeName, WeightGoal } from '../types';
import { InputField } from '../components/InputField';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { calculateBodyCondition, getBodyConditionLabel, getBodyConditionDescription, convertWeight, lbToKg, kgToLb, calculateTargetWeight } from '../utils/calculations';
import { detectThemeFromImage, getAvailableThemes, themes } from '../utils/themes';
import bcsGuideImage from 'figma:asset/e96ed4283bf009da13c4d0a88913716650bd1d92.png';

interface ProfileSetupProps {
  onComplete: (profile: CatProfile) => void;
  onBack?: () => void;
  existingProfile?: CatProfile;
  onAddAnother?: () => void;
  unitPreferences: UnitPreferences;
}

export function ProfileSetup({ onComplete, onBack, existingProfile, onAddAnother, unitPreferences }: ProfileSetupProps) {
  const [name, setName] = useState(existingProfile?.name || '');
  const [breed, setBreed] = useState(existingProfile?.breed || '');
  const [gender, setGender] = useState<'male' | 'female'>(existingProfile?.gender || 'male');
  const [age, setAge] = useState(existingProfile?.age?.toString() || '');
  
  const initialWeightUnit = existingProfile?.weightUnitPreference || unitPreferences.weight;
  // Local weight unit preference (allows toggling during setup)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(initialWeightUnit);
  const [previousWeightUnit, setPreviousWeightUnit] = useState<'kg' | 'lb'>(initialWeightUnit);
  
  // Convert weight from kg (storage) to display unit
  const [currentWeight, setCurrentWeight] = useState(
    existingProfile?.currentWeight
      ? (initialWeightUnit === 'lb'
          ? kgToLb(existingProfile.currentWeight).toFixed(2)
          : existingProfile.currentWeight.toFixed(2))
      : ''
  );
  const [targetWeight, setTargetWeight] = useState(
    existingProfile?.targetWeight
      ? (initialWeightUnit === 'lb'
          ? kgToLb(existingProfile.targetWeight).toFixed(2)
          : existingProfile.targetWeight.toFixed(2))
      : ''
  );
  
  const [isNeutered, setIsNeutered] = useState(existingProfile?.isNeutered ?? true);
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>(
    existingProfile?.activityLevel || 'medium'
  );
  const [photoUrl, setPhotoUrl] = useState(existingProfile?.photoUrl || '');
  const [showActivityInfo, setShowActivityInfo] = useState(false);
  const [showBodyConditionInfo, setShowBodyConditionInfo] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [suggestedTheme, setSuggestedTheme] = useState<ThemeName | null>(null);
  
  // Ensure selectedTheme is one of the valid themes
  const validThemes: ThemeName[] = ['warm-amber', 'soft-cream-neutral', 'misty-grey', 'frosted-taupe', 'nutmeg-sand', 'caramel-mocha', 'ink-gold', 'midnight-neutral', 'ginger-cat', 'snow-whiskers'];
  const initialTheme = existingProfile?.themePreference && validThemes.includes(existingProfile.themePreference)
    ? existingProfile.themePreference
    : 'warm-amber';
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(initialTheme);
  const [isDetectingTheme, setIsDetectingTheme] = useState(false);
  const [bodyCondition, setBodyCondition] = useState<BodyCondition | undefined>(existingProfile?.bodyCondition);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if editing existing profile with feeding plan
  const hasFeedingPlan = existingProfile?.feedingPlan !== undefined;
  const weightGoal = existingProfile?.feedingPlan?.weightGoal || 'maintain';
  const customFactor = existingProfile?.feedingPlan?.customFactor;

  // Calculate target weight based on weight goal if there's a feeding plan
  const calculatedTargetWeight = useMemo(() => {
    if (hasFeedingPlan && existingProfile?.currentWeight) {
      return calculateTargetWeight(
        existingProfile.currentWeight,
        weightGoal,
        customFactor
      );
    }
    return existingProfile?.targetWeight;
  }, [hasFeedingPlan, existingProfile?.currentWeight, existingProfile?.targetWeight, weightGoal, customFactor]);

  // States for revise mode and weight update flow
  const [isRevisingWeight, setIsRevisingWeight] = useState(false);
  const [editedCurrentWeight, setEditedCurrentWeight] = useState(currentWeight);
  const [originalCurrentWeight, setOriginalCurrentWeight] = useState(
    existingProfile?.currentWeight
      ? (initialWeightUnit === 'lb'
          ? kgToLb(existingProfile.currentWeight).toFixed(2)
          : existingProfile.currentWeight.toFixed(2))
      : ''
  );
  const [showGoalConfirm, setShowGoalConfirm] = useState(false);
  const [weightUpdateData, setWeightUpdateData] = useState<{
    newCurrentWeight: string;
    newCurrentWeightKg: number;
    oldTargetWeightKg: number;
    targetAchieved: 'reached' | 'close' | 'none';
  } | null>(null);
  const [confirmedNewGoal, setConfirmedNewGoal] = useState<{
    goal: WeightGoal;
    customFactor?: number;
    targetWeight: number;
  } | null>(null);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedNewGoal, setSelectedNewGoal] = useState<WeightGoal>(weightGoal);
  const [selectedCustomFactor, setSelectedCustomFactor] = useState<number>(customFactor || 1.0);

  // Handle weight unit toggle - convert existing values
  useEffect(() => {
    // Only convert if the unit has actually changed
    if (weightUnit !== previousWeightUnit) {
      // Convert current weight
      setCurrentWeight((prev) => {
        if (!prev) return prev;
        const currentValue = parseFloat(prev);
        if (isNaN(currentValue)) return prev;
        
        if (previousWeightUnit === 'kg' && weightUnit === 'lb') {
          // Converting from kg to lb
          return kgToLb(currentValue).toFixed(2);
        } else if (previousWeightUnit === 'lb' && weightUnit === 'kg') {
          // Converting from lb to kg
          return lbToKg(currentValue).toFixed(2);
        }
        return prev;
      });
      
      // Convert target weight
      setTargetWeight((prev) => {
        if (!prev) return prev;
        const targetValue = parseFloat(prev);
        if (isNaN(targetValue)) return prev;
        
        if (previousWeightUnit === 'kg' && weightUnit === 'lb') {
          // Converting from kg to lb
          return kgToLb(targetValue).toFixed(2);
        } else if (previousWeightUnit === 'lb' && weightUnit === 'kg') {
          // Converting from lb to kg
          return lbToKg(targetValue).toFixed(2);
        }
        return prev;
      });
      
      // Update the previous unit
      setPreviousWeightUnit(weightUnit);
    }
  }, [weightUnit, previousWeightUnit]);

  // Calculate suggested body condition based on weight
  const suggestedBodyCondition = useMemo(() => {
    if (!currentWeight) return null;
    const weightInKg = weightUnit === 'lb'
      ? lbToKg(parseFloat(currentWeight))
      : parseFloat(currentWeight);
    return calculateBodyCondition(weightInKg, breed);
  }, [currentWeight, breed, weightUnit]);

  // Calculate effective target weight based on current state (for display)
  const effectiveTargetWeight = useMemo(() => {
    if (!hasFeedingPlan) return undefined;

    // If user confirmed a new goal, use that
    if (confirmedNewGoal) {
      return confirmedNewGoal.targetWeight;
    }

    // Otherwise calculate based on current weight and goal
    const currentWeightKg = weightUnit === 'lb'
      ? lbToKg(parseFloat(currentWeight))
      : parseFloat(currentWeight);

    if (!currentWeightKg) return calculatedTargetWeight;

    return calculateTargetWeight(
      currentWeightKg,
      weightGoal,
      customFactor
    );
  }, [confirmedNewGoal, currentWeight, weightUnit, hasFeedingPlan, weightGoal, customFactor, calculatedTargetWeight]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const url = reader.result as string;
        setPhotoUrl(url);
        
        // Auto-detect theme from photo
        setIsDetectingTheme(true);
        try {
          const detectedTheme = await detectThemeFromImage(url);
          setSuggestedTheme(detectedTheme);
          setSelectedTheme(detectedTheme);
          // Show theme selector modal after a brief delay
          setTimeout(() => {
            setShowThemeSelector(true);
            setIsDetectingTheme(false);
          }, 500);
        } catch (error) {
          console.error('Error detecting theme:', error);
          setIsDetectingTheme(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle starting weight revision
  const handleStartRevise = () => {
    setIsRevisingWeight(true);
    setEditedCurrentWeight(currentWeight);
  };

  // Handle saving revised weight
  const handleSaveRevisedWeight = () => {
    if (!editedCurrentWeight) return;

    const newCurrentWeightKg = weightUnit === 'lb'
      ? lbToKg(parseFloat(editedCurrentWeight))
      : parseFloat(editedCurrentWeight);

    // Check if target weight exists and calculate achievement status
    const oldTargetWeightKg = calculatedTargetWeight || existingProfile?.targetWeight;
    if (!oldTargetWeightKg) {
      // No target weight, just update and continue
      setCurrentWeight(editedCurrentWeight);
      setIsRevisingWeight(false);
      return;
    }

    // Check if target is reached or close (±2lb = ±0.9kg)
    const weightDiff = Math.abs(newCurrentWeightKg - oldTargetWeightKg);
    const closeThreshold = weightUnit === 'lb' ? 2 : 0.9; // 2lb or 0.9kg
    let targetAchieved: 'reached' | 'close' | 'none' = 'none';
    
    if (weightDiff < 0.1) { // Within 0.1kg (basically reached)
      targetAchieved = 'reached';
    } else if (weightDiff <= closeThreshold) {
      targetAchieved = 'close';
    }

    // Store update data and show goal confirmation
    setWeightUpdateData({
      newCurrentWeight: editedCurrentWeight,
      newCurrentWeightKg,
      oldTargetWeightKg,
      targetAchieved,
    });
    setShowGoalConfirm(true);
  };

  // Handle goal confirmation - keep current goal
  const handleKeepCurrentGoal = () => {
    if (!weightUpdateData) return;

    // Keep current goal and recalculate target weight based on new current weight
    const newTargetWeightKg = calculateTargetWeight(
      weightUpdateData.newCurrentWeightKg,
      weightGoal,
      customFactor
    );

    // Update states
    setConfirmedNewGoal({
      goal: weightGoal,
      customFactor,
      targetWeight: newTargetWeightKg,
    });
    setCurrentWeight(weightUpdateData.newCurrentWeight);
    
    // Update target weight display
    const targetWeightInDisplayUnit = weightUnit === 'lb'
      ? kgToLb(newTargetWeightKg).toFixed(2)
      : newTargetWeightKg.toFixed(2);
    setTargetWeight(targetWeightInDisplayUnit);
    
    setIsRevisingWeight(false);
    setShowGoalConfirm(false);
    setWeightUpdateData(null);
  };

  // Handle goal confirmation - change goal
  const handleChangeGoal = () => {
    setShowGoalConfirm(false);
    setShowGoalSelector(true);
  };

  // Handle goal selection confirmation
  const handleConfirmNewGoal = () => {
    if (!weightUpdateData) return;

    // Calculate new target weight based on selected goal
    const newTargetWeightKg = calculateTargetWeight(
      weightUpdateData.newCurrentWeightKg,
      selectedNewGoal,
      selectedNewGoal === 'custom' ? selectedCustomFactor : undefined
    );

    // Update states
    setConfirmedNewGoal({
      goal: selectedNewGoal,
      customFactor: selectedNewGoal === 'custom' ? selectedCustomFactor : undefined,
      targetWeight: newTargetWeightKg,
    });
    setCurrentWeight(weightUpdateData.newCurrentWeight);
    
    // Update target weight display
    const targetWeightInDisplayUnit = weightUnit === 'lb'
      ? kgToLb(newTargetWeightKg).toFixed(2)
      : newTargetWeightKg.toFixed(2);
    setTargetWeight(targetWeightInDisplayUnit);
    
    setIsRevisingWeight(false);
    setShowGoalSelector(false);
    setWeightUpdateData(null);
  };

  const handleSubmit = () => {
    if (!name || !age || !currentWeight) return;

    // If we're in revise mode or showing confirmation, don't submit yet
    if (isRevisingWeight || showGoalConfirm || showGoalSelector) {
      return;
    }

    // Convert weight to kg for storage
    const currentWeightInKg = weightUnit === 'lb'
      ? lbToKg(parseFloat(currentWeight))
      : parseFloat(currentWeight);
    
    // Use confirmed goal and target weight if available
    let targetWeightInKg: number | undefined;
    let finalWeightGoal: WeightGoal = weightGoal;
    let finalCustomFactor: number | undefined = customFactor;
    
    if (hasFeedingPlan && confirmedNewGoal) {
      targetWeightInKg = confirmedNewGoal.targetWeight;
      finalWeightGoal = confirmedNewGoal.goal;
      finalCustomFactor = confirmedNewGoal.customFactor;
    } else if (hasFeedingPlan && calculatedTargetWeight) {
      targetWeightInKg = calculatedTargetWeight;
    } else if (targetWeight) {
      targetWeightInKg = weightUnit === 'lb'
        ? lbToKg(parseFloat(targetWeight))
        : parseFloat(targetWeight);
    }

    // Update feeding plan with new goal if it was changed
    let updatedFeedingPlan = existingProfile?.feedingPlan;
    if (hasFeedingPlan && confirmedNewGoal && updatedFeedingPlan) {
      updatedFeedingPlan = {
        ...updatedFeedingPlan,
        weightGoal: finalWeightGoal,
        customFactor: finalCustomFactor,
      };
    }

    const profile: CatProfile = {
      id: existingProfile?.id || `cat-${Date.now()}`,
      name,
      breed: breed || undefined,
      gender,
      age: parseFloat(age),
      currentWeight: currentWeightInKg,
      targetWeight: targetWeightInKg,
      isNeutered,
      activityLevel,
      photoUrl: photoUrl || undefined,
      bodyCondition: bodyCondition || undefined,
      weightUnitPreference: weightUnit,
      weightHistory: existingProfile?.weightHistory || [],
      themePreference: selectedTheme,
      // Preserve existing plan and food selection
      selectedFoodId: existingProfile?.selectedFoodId,
      feedingPlan: updatedFeedingPlan,
    };

    // After user confirms target weight, onComplete will be called
    // which will trigger the calories change notification in App.tsx
    onComplete(profile);
  };

  const isValid = name && age && currentWeight;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-4 p-4">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          )}
          <h2 className="text-foreground">Cat Profile</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-muted-foreground">Photo</label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt="Cat" className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl">🐱</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-muted text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                disabled={isDetectingTheme}
              >
                <Upload className="w-4 h-4" />
                {isDetectingTheme ? 'Analyzing...' : 'Upload Photo'}
              </button>
              {photoUrl && (
                <button
                  onClick={() => setPhotoUrl('')}
                  className="w-full py-2 px-4 rounded-xl text-muted-foreground active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {photoUrl && selectedTheme && (
            <div className="mt-3 p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-secondary" />
                  <span className="text-foreground">{themes[selectedTheme]?.name || 'Classic Golden'}</span>
                </div>
                <button
                  onClick={() => setShowThemeSelector(true)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-foreground active:scale-95 transition-all flex items-center justify-center"
                >
                  Change Theme
                </button>
              </div>
            </div>
          )}
        </div>

        <InputField
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Whiskers"
        />

        <InputField
          label="Breed (Optional)"
          value={breed}
          onChange={setBreed}
          placeholder="Persian, Siamese, etc."
        />

        <div className="space-y-2">
          <label className="text-muted-foreground">Gender</label>
          <div className="flex gap-3">
            <button
              onClick={() => setGender('male')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                gender === 'male'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender('female')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                gender === 'female'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <InputField
          label="Age"
          type="number"
          value={age}
          onChange={setAge}
          placeholder="3"
          unit="years"
        />

        <div className="space-y-2">
          <label className="text-muted-foreground">Weight Unit</label>
          <div className="flex gap-3">
            <button
              onClick={() => setWeightUnit('kg')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                weightUnit === 'kg'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Kilograms (kg)
            </button>
            <button
              onClick={() => setWeightUnit('lb')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                weightUnit === 'lb'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Pounds (lb)
            </button>
          </div>
        </div>

        {/* Weight Section - Different UI based on whether there's a feeding plan */}
        {hasFeedingPlan ? (
          /* Display mode with Revise button for existing profiles with feeding plan */
          <div className="space-y-4">
            {/* Current Weight Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground">Current Weight</label>
                {!isRevisingWeight && (
                  <button
                    onClick={handleStartRevise}
                    className="text-primary text-sm font-medium active:scale-95 transition-all"
                  >
                    Revise
                  </button>
                )}
              </div>
              {isRevisingWeight ? (
                <div className="space-y-2">
                  <InputField
                    label=""
                    type="number"
                    value={editedCurrentWeight}
                    onChange={setEditedCurrentWeight}
                    placeholder={weightUnit === 'kg' ? '4.5' : '10'}
                    unit={weightUnit}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveRevisedWeight}
                      className="flex-1 py-3 rounded-xl bg-primary text-foreground transition-all active:scale-[0.98]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsRevisingWeight(false);
                        setEditedCurrentWeight(currentWeight);
                      }}
                      className="flex-1 py-3 rounded-xl bg-muted text-foreground transition-all active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-muted/50 text-foreground">
                  {currentWeight} {weightUnit}
                </div>
              )}
            </div>

            {/* Target Weight Display */}
            <div className="space-y-2">
              <label className="text-muted-foreground">Target Weight</label>
              <div className="px-4 py-3 rounded-xl bg-muted/50 text-foreground">
                {effectiveTargetWeight
                  ? (weightUnit === 'lb'
                      ? kgToLb(effectiveTargetWeight).toFixed(2)
                      : effectiveTargetWeight.toFixed(2))
                  : '-'} {weightUnit}
              </div>
              {(confirmedNewGoal?.goal || weightGoal) !== 'maintain' && (
                <div className="text-sm text-muted-foreground">
                  Based on {confirmedNewGoal?.goal === 'lose' || (weightGoal === 'lose' && !confirmedNewGoal) ? 'Lose Weight (-20%)' : confirmedNewGoal?.goal === 'gain' || (weightGoal === 'gain' && !confirmedNewGoal) ? 'Gain Weight (+20%)' : 'Custom'} goal
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Input mode for new profiles or profiles without feeding plan */
          <>
            <InputField
              label="Current Weight"
              type="number"
              value={currentWeight}
              onChange={setCurrentWeight}
              placeholder={weightUnit === 'kg' ? '4.5' : '10'}
              unit={weightUnit}
            />

            <InputField
              label="Target Weight (Optional)"
              type="number"
              value={targetWeight}
              onChange={setTargetWeight}
              placeholder={weightUnit === 'kg' ? '4.0' : '9'}
              unit={weightUnit}
            />
          </>
        )}

        {/* Body Condition Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground">Body Condition (Optional)</label>
            <button
              onClick={() => setShowBodyConditionInfo(true)}
              className="flex items-center gap-1 text-secondary active:scale-95 transition-all"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm">Reference Guide</span>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setBodyCondition('underweight')}
              className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center text-sm ${
                bodyCondition === 'underweight'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Underweight
            </button>
            <button
              onClick={() => setBodyCondition('ideal')}
              className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center text-sm ${
                bodyCondition === 'ideal'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Ideal
            </button>
            <button
              onClick={() => setBodyCondition('overweight')}
              className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center text-sm ${
                bodyCondition === 'overweight'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Overweight
            </button>
          </div>
          
          {bodyCondition && (
            <div className="p-3 rounded-xl bg-card border border-border">
              <p className="text-muted-foreground text-sm">
                {getBodyConditionDescription(bodyCondition)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-muted-foreground">Neutered/Spayed</label>
          <div className="flex gap-3">
            <button
              onClick={() => setIsNeutered(true)}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                isNeutered
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setIsNeutered(false)}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                !isNeutered
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground">Activity Level</label>
            <button
              onClick={() => setShowActivityInfo(true)}
              className="flex items-center gap-1 text-secondary active:scale-95 transition-all"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm">Click to read more</span>
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActivityLevel('low')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                activityLevel === 'low'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setActivityLevel('medium')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                activityLevel === 'medium'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setActivityLevel('high')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                activityLevel === 'high'
                  ? 'bg-primary text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              High
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <ButtonPrimary onClick={handleSubmit} disabled={!isValid}>
            {existingProfile ? 'Save Changes' : 'Continue'}
          </ButtonPrimary>
          {onAddAnother && (
            <button
              onClick={onAddAnother}
              className="w-full py-4 rounded-2xl bg-muted text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
            >
              + Add Another Pet
            </button>
          )}
        </div>
      </div>

      {showActivityInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Activity Levels</h3>
              <button
                onClick={() => setShowActivityInfo(false)}
                className="p-1 rounded-lg hover:bg-muted active:scale-95 transition-all"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-accent/20">
                <div className="text-foreground mb-1">Low Activity</div>
                <p className="text-muted-foreground">
                  Indoor cats that are relaxed, sleep most of the day, and have minimal play time.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent/20">
                <div className="text-foreground mb-1">Medium Activity</div>
                <p className="text-muted-foreground">
                  Cats with moderate play sessions throughout the day, typical indoor lifestyle.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent/20">
                <div className="text-foreground mb-1">High Activity</div>
                <p className="text-muted-foreground">
                  Very active cats, outdoor access, frequent play, or working/hunting cats.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowActivityInfo(false)}
              className="w-full mt-6 py-3 rounded-xl bg-primary text-foreground active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Choose Your Theme</h3>
              <button
                onClick={() => setShowThemeSelector(false)}
                className="p-1 rounded-lg hover:bg-muted active:scale-95 transition-all"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {suggestedTheme && (
              <div className="mb-4 p-4 rounded-xl bg-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-secondary" />
                  <span className="text-foreground">We've created a custom color palette inspired by your cat!</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {getAvailableThemes().map((theme) => {
                const themeColors = themes[theme.id];
                const isSelected = selectedTheme === theme.id;
                const isSuggested = suggestedTheme === theme.id;
                
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'ring-2 ring-primary bg-background'
                        : 'bg-card border border-border hover:bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-foreground">{theme.name}</h4>
                          {isSuggested && (
                            <span className="px-2 py-0.5 bg-primary text-foreground rounded-full">
                              Cat-Inspired ✨
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">{theme.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <div
                        className="w-10 h-10 rounded-lg"
                        style={{ backgroundColor: themeColors.primary }}
                      />
                      <div
                        className="w-10 h-10 rounded-lg"
                        style={{ backgroundColor: themeColors.secondary }}
                      />
                      <div
                        className="w-10 h-10 rounded-lg border border-border"
                        style={{ backgroundColor: themeColors.background }}
                      />
                      <div
                        className="w-10 h-10 rounded-lg"
                        style={{ backgroundColor: themeColors.muted }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowThemeSelector(false)}
              className="w-full mt-6 py-3 rounded-xl bg-primary text-foreground active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Confirm Theme
            </button>
          </div>
        </div>
      )}

      {/* Goal Confirmation Modal */}
      {showGoalConfirm && weightUpdateData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            {/* Achievement Status */}
            {weightUpdateData.targetAchieved === 'reached' && (
              <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="text-green-800 font-medium text-center mb-1">
                  🎉 Congratulations! {name} has reached the target weight!
                </div>
                <div className="text-green-600 text-sm text-center">
                  Current: {weightUpdateData.newCurrentWeight} {weightUnit} | Target: {weightUnit === 'lb' ? kgToLb(weightUpdateData.oldTargetWeightKg).toFixed(2) : weightUpdateData.oldTargetWeightKg.toFixed(2)} {weightUnit}
                </div>
              </div>
            )}
            {weightUpdateData.targetAchieved === 'close' && (
              <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-blue-800 font-medium text-center mb-1">
                  👏 Almost there! {name} is close to the target weight!
                </div>
                <div className="text-blue-600 text-sm text-center">
                  Current: {weightUpdateData.newCurrentWeight} {weightUnit} | Target: {weightUnit === 'lb' ? kgToLb(weightUpdateData.oldTargetWeightKg).toFixed(2) : weightUpdateData.oldTargetWeightKg.toFixed(2)} {weightUnit}
                </div>
              </div>
            )}

            <h3 className="text-foreground text-center mb-2">
              Modify Weight Goal?
            </h3>
            
            <p className="text-muted-foreground text-center mb-4">
              Current goal: <strong>
                {weightGoal === 'lose' ? 'Lose Weight (-20%)' : 
                 weightGoal === 'gain' ? 'Gain Weight (+20%)' : 
                 weightGoal === 'custom' ? `Custom (×${customFactor?.toFixed(2)})` : 
                 'Maintain Weight'}
              </strong>
            </p>
            
            <p className="text-muted-foreground text-center mb-6 text-sm">
              Would you like to keep this goal or change it? The target weight will be recalculated based on your new current weight.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleKeepCurrentGoal}
                className="w-full py-4 rounded-2xl bg-primary text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Keep Current Goal
              </button>
              <button
                onClick={handleChangeGoal}
                className="w-full py-4 rounded-2xl bg-muted text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Change Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Selector Modal */}
      {showGoalSelector && weightUpdateData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-foreground text-center mb-4">
              Select Weight Goal
            </h3>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedNewGoal('maintain')}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedNewGoal === 'maintain'
                    ? 'bg-primary text-foreground border-2 border-primary'
                    : 'bg-muted text-foreground border-2 border-transparent'
                }`}
              >
                <div className="text-foreground mb-1">Maintain</div>
                <div className="text-sm opacity-80">Keep current weight stable</div>
              </button>

              <button
                onClick={() => setSelectedNewGoal('lose')}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedNewGoal === 'lose'
                    ? 'bg-primary text-foreground border-2 border-primary'
                    : 'bg-muted text-foreground border-2 border-transparent'
                }`}
              >
                <div className="text-foreground mb-1">Lose Weight (-20%)</div>
                <div className="text-sm opacity-80">Gradual, safe reduction for overweight cats</div>
              </button>

              <button
                onClick={() => setSelectedNewGoal('gain')}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedNewGoal === 'gain'
                    ? 'bg-primary text-foreground border-2 border-primary'
                    : 'bg-muted text-foreground border-2 border-transparent'
                }`}
              >
                <div className="text-foreground mb-1">Gain Weight (+20%)</div>
                <div className="text-sm opacity-80">For underweight cats only</div>
              </button>

              <button
                onClick={() => setSelectedNewGoal('custom')}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedNewGoal === 'custom'
                    ? 'bg-primary text-foreground border-2 border-primary'
                    : 'bg-muted text-foreground border-2 border-transparent'
                }`}
              >
                <div className="text-foreground mb-1">Custom</div>
                <div className="text-sm opacity-80">Set your own adjustment factor</div>
              </button>

              {selectedNewGoal === 'custom' && (
                <div className="pt-2">
                  <label className="text-muted-foreground text-sm mb-2 block">
                    Adjustment Factor (0.5 - 1.5)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={selectedCustomFactor}
                    onChange={(e) => setSelectedCustomFactor(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted focus:border-primary outline-none"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmNewGoal}
                className="w-full py-4 rounded-2xl bg-primary text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Confirm Goal
              </button>
              <button
                onClick={() => {
                  setShowGoalSelector(false);
                  setShowGoalConfirm(true);
                }}
                className="w-full py-4 rounded-2xl bg-muted text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body Condition Info Modal */}
      {showBodyConditionInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-4 max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Body Condition Guide</h3>
              <button
                onClick={() => setShowBodyConditionInfo(false)}
                className="p-1 rounded-lg hover:bg-muted active:scale-95 transition-all"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Body Condition Scoring (BCS) helps you assess if your cat is at a healthy weight. 
                Use this visual guide to evaluate your cat's body condition. This reference follows NRC (National Research Council) nutritional standards.
              </p>

              <div className="rounded-xl overflow-hidden border border-border">
                <img 
                  src={bcsGuideImage} 
                  alt="Cat Body Condition Scoring Guide" 
                  className="w-full"
                />
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Source: Association for Pet Obesity Prevention
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-accent/20">
                  <div className="text-foreground mb-2">How to Check Your Cat's Body Condition:</div>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Feel your cat's ribs - they should be easily felt but not visible</li>
                    <li>Look from above - you should see a defined waist behind the ribs</li>
                    <li>Look from the side - the belly should not hang down or be extended</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="text-foreground mb-2">💡 Feeding Recommendations</div>
                  <p className="text-muted-foreground">
                    <strong>Underweight:</strong> Our system will calculate higher calorie portions to help healthy weight gain.<br/>
                    <strong>Ideal:</strong> Maintenance calories to keep your cat at their perfect weight.<br/>
                    <strong>Overweight:</strong> Reduced portions with gradual weight loss plan (consult your vet).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-orange-800">
                    ⚠️ Always consult your veterinarian before starting any weight management program.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowBodyConditionInfo(false)}
              className="w-full mt-6 py-3 rounded-xl bg-primary text-foreground active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
