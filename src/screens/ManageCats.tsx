import React from 'react';
import { ChevronLeft, Plus, Edit2, Trash2, Palette } from 'lucide-react';
import { CatProfile, WeightUnit } from '../types';
import { themes } from '../utils/themes';
import { formatWeightForDisplay } from '../utils/calculations';

interface ManageCatsProps {
  profiles: CatProfile[];
  currentProfileId: string | null;
  onBack: () => void;
  onAddCat: () => void;
  onEditCat: (profile: CatProfile) => void;
  onDeleteCat: (profileId: string) => void;
  onSwitchProfile: (profileId: string) => void;
  defaultWeightUnit: WeightUnit;
}

export function ManageCats({
  profiles,
  currentProfileId,
  onBack,
  onAddCat,
  onEditCat,
  onDeleteCat,
  onSwitchProfile,
  defaultWeightUnit,
}: ManageCatsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

  const handleDelete = (profileId: string) => {
    if (profiles.length <= 1) {
      alert('You must have at least one cat profile.');
      return;
    }
    setShowDeleteConfirm(profileId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteCat(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card sticky top-0 z-10 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h2 className="text-foreground flex-1">Manage Cats</h2>
          <button
            onClick={onAddCat}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-foreground rounded-xl active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Cat
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <div className="text-5xl">🐱</div>
            </div>
            <h3 className="text-foreground mb-2">No Cats Yet</h3>
            <p className="text-muted-foreground mb-6">Add your first cat to get started</p>
            <button
              onClick={onAddCat}
              className="px-6 py-3 bg-primary text-foreground rounded-xl active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Cat
            </button>
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-card rounded-2xl p-4 ${
                profile.id === currentProfileId ? 'ring-2 ring-primary border border-ring' : 'border border-border'
              }`}
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl">🐱</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-foreground">{profile.name}</h3>
                      {profile.id === currentProfileId && (
                        <span className="inline-block px-2 py-1 bg-primary text-foreground rounded-full mt-1">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-muted-foreground">
                      {profile.age} {profile.age === 1 ? 'year' : 'years'} •{' '}
                      {formatWeightForDisplay(profile.currentWeight, profile.weightUnitPreference || defaultWeightUnit)}
                    </p>
                    {profile.breed && (
                      <p className="text-muted-foreground">{profile.breed}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-background text-muted-foreground rounded-lg">
                        {profile.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </span>
                      <span className="px-2 py-1 bg-background text-muted-foreground rounded-lg">
                        {profile.isNeutered ? '✓ Neutered' : 'Not Neutered'}
                      </span>
                      <span className="px-2 py-1 bg-background text-muted-foreground rounded-lg capitalize">
                        {profile.activityLevel} Activity
                      </span>
                      {profile.themePreference && themes[profile.themePreference] && (
                        <span className="px-2 py-1 bg-background text-muted-foreground rounded-lg flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          {themes[profile.themePreference].name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {profile.id !== currentProfileId && (
                      <button
                        onClick={() => onSwitchProfile(profile.id)}
                        className="flex-1 py-2 bg-primary text-foreground rounded-xl active:scale-95 flex items-center justify-center"
                      >
                        Switch to {profile.name}
                      </button>
                    )}
                    <button
                      onClick={() => onEditCat(profile)}
                      className="px-4 py-2 bg-muted text-foreground rounded-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl active:scale-95 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-foreground text-center mb-2">Delete Cat Profile?</h3>
            <p className="text-muted-foreground text-center mb-6">
              This will permanently delete {profiles.find(p => p.id === showDeleteConfirm)?.name}'s profile and all associated data. This action cannot be undone.
            </p>
            <div className="space-y-3">
              <button
                onClick={confirmDelete}
                className="w-full py-4 rounded-2xl bg-red-600 text-white transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-4 rounded-2xl bg-muted text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
