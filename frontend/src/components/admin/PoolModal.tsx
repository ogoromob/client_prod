import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import adminService, { poolTypePresets, CreatePoolForm, PoolType } from '../../services/adminService';
import { toast } from 'sonner';

interface PoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pool?: PoolType;
}

const poolValidationSchema = z.object({
  name: z.string().min(3, 'Min 3 caractères').max(100),
  type: z.enum(['momentum', 'swing', 'altcoin', 'dca', 'community']),
  description: z.string().min(10, 'Min 10 caractères'),
  targetAmount: z.number().min(1000, 'Min 1000€'),
  minInvestment: z.number().min(10, 'Min 10€'),
  maxInvestors: z.number().min(1),
  managerFeePercentage: z.number().min(0).max(50),
  startDate: z.string(),
  endDate: z.string(),
  tradingStrategy: z.string().min(10, 'Min 10 caractères'),
  riskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'La date de fermeture doit être après la date d\'ouverture',
  path: ['endDate'],
});

type PoolFormData = z.infer<typeof poolValidationSchema>;

const PoolModal: React.FC<PoolModalProps> = ({ isOpen, onClose, onSuccess, pool }) => {
  const [step, setStep] = useState<'type' | 'details' | 'dates'>('type');
  const [selectedType, setSelectedType] = useState<keyof typeof poolTypePresets | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PoolFormData>({
    resolver: zodResolver(poolValidationSchema),
    defaultValues: pool
      ? {
          name: pool.name,
          type: pool.type as any,
          description: pool.description,
          targetAmount: pool.targetAmount,
          minInvestment: pool.minInvestment,
          maxInvestors: pool.maxInvestors,
          managerFeePercentage: pool.managerFeePercentage,
          startDate: pool.startDate.split('T')[0],
          endDate: pool.endDate.split('T')[0],
          tradingStrategy: pool.tradingStrategy,
          riskLevel: pool.riskLevel,
        }
      : {
          name: '',
          type: 'momentum',
          description: '',
          targetAmount: 10000,
          minInvestment: 100,
          maxInvestors: 50,
          managerFeePercentage: 15,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tradingStrategy: '',
          riskLevel: 'medium',
        },
  });

  useEffect(() => {
    if (pool) {
      setSelectedType(pool.type as keyof typeof poolTypePresets);
      setStep('details');
    } else {
      setStep('type');
      setSelectedType(null);
    }
  }, [pool, isOpen]);

  const handleSubmitForm = async (values: PoolFormData) => {
    try {
      setIsLoading(true);
      if (pool) {
        await adminService.updatePool(pool.id, values);
        toast.success('Pool mis à jour');
      } else {
        await adminService.createPool(values);
        toast.success('Pool créé');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-800/50 rounded-xl shadow-2xl shadow-blue-500/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/90 border-b border-slate-800/50 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">
            {pool ? 'Éditer Pool' : 'Créer Pool'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="p-6 space-y-6">
          {/* Step 1: Type Selection */}
          {step === 'type' && !pool && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Sélectionner le type de pool</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(poolTypePresets).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedType(key as keyof typeof poolTypePresets);
                      setValue('type', key as any);
                      setValue('name', preset.name);
                      setValue('description', preset.description);
                      setValue('riskLevel', preset.riskLevel);
                      setValue('tradingStrategy', preset.tradingStrategy);
                      setStep('details');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedType === key
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-semibold text-slate-100">{preset.name}</p>
                    <p className="text-sm text-slate-400">{preset.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Risque: {preset.riskLevel.toUpperCase()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {(step === 'details' || pool) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Détails du pool</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nom du pool
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                        placeholder="Ex: Momentum BTC"
                      />
                    )}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Niveau de risque
                  </label>
                  <Controller
                    name="riskLevel"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyen</option>
                        <option value="high">Élevé</option>
                        <option value="very_high">Très élevé</option>
                      </select>
                    )}
                  />
                  {errors.riskLevel && <p className="text-red-400 text-xs mt-1">{errors.riskLevel.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      placeholder="Description du pool..."
                    />
                  )}
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>

              {/* Trading Strategy */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Stratégie de trading
                </label>
                <Controller
                  name="tradingStrategy"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      placeholder="Détails de la stratégie..."
                    />
                  )}
                />
                {errors.tradingStrategy && <p className="text-red-400 text-xs mt-1">{errors.tradingStrategy.message}</p>}
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Montant cible (€)
                  </label>
                  <Controller
                    name="targetAmount"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                    )}
                  />
                  {errors.targetAmount && <p className="text-red-400 text-xs mt-1">{errors.targetAmount.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Investissement min (€)
                  </label>
                  <Controller
                    name="minInvestment"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                    )}
                  />
                  {errors.minInvestment && <p className="text-red-400 text-xs mt-1">{errors.minInvestment.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max investisseurs
                  </label>
                  <Controller
                    name="maxInvestors"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                    )}
                  />
                  {errors.maxInvestors && <p className="text-red-400 text-xs mt-1">{errors.maxInvestors.message}</p>}
                </div>
              </div>

              {/* Manager Fee */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Frais manager (%)
                </label>
                <Controller
                  name="managerFeePercentage"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.1"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    />
                  )}
                />
                {errors.managerFeePercentage && <p className="text-red-400 text-xs mt-1">{errors.managerFeePercentage.message}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Dates */}
          {(step === 'dates' || pool) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Dates</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date d'ouverture
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                    )}
                  />
                  {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date de fermeture
                  </label>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                    )}
                  />
                  {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-4 pt-6 border-t border-slate-800/50">
            {step !== 'type' && !pool && (
              <button
                type="button"
                onClick={() => {
                  if (step === 'details') setStep('type');
                  else if (step === 'dates') setStep('details');
                }}
                className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
              >
                ← Précédent
              </button>
            )}

            <div className="flex gap-4 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 hover:text-slate-100 transition-colors"
              >
                Annuler
              </button>

              {step !== 'dates' && !pool && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'type') setStep('details');
                    else if (step === 'details') setStep('dates');
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  Suivant →
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
              >
                {isLoading ? 'Sauvegarde...' : pool ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PoolModal;
