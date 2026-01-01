import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import adminService, { poolTypePresets, CreatePoolForm, PoolType } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface PoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pool?: PoolType;
}

const poolValidationSchema = Yup.object().shape({
  name: Yup.string().required('Nom requis').min(3, 'Min 3 caractères'),
  type: Yup.string().required('Type requis'),
  description: Yup.string().required('Description requise'),
  targetAmount: Yup.number().required('Montant cible requis').min(1000, 'Min 1000€'),
  minInvestment: Yup.number().required('Investissement min requis').min(10, 'Min 10€'),
  maxInvestors: Yup.number().required('Max investisseurs requis').min(1),
  managerFeePercentage: Yup.number().required('Frais manager requis').min(0).max(50),
  startDate: Yup.date().required('Date ouverture requise').typeError('Date invalide'),
  endDate: Yup.date()
    .required('Date fermeture requise')
    .typeError('Date invalide')
    .min(Yup.ref('startDate'), 'Doit être après la date ouverture'),
  tradingStrategy: Yup.string().required('Stratégie requise'),
  riskLevel: Yup.string().required('Niveau risque requis'),
});

const PoolModal: React.FC<PoolModalProps> = ({ isOpen, onClose, onSuccess, pool }) => {
  const [step, setStep] = useState<'type' | 'details' | 'dates' | 'advanced'>('type');
  const [selectedType, setSelectedType] = useState<keyof typeof poolTypePresets | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pool) {
      setSelectedType(pool.type as keyof typeof poolTypePresets);
      setStep('details');
    } else {
      setStep('type');
      setSelectedType(null);
    }
  }, [pool, isOpen]);

  const initialValues: CreatePoolForm = pool
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
      };

  const handleSubmit = async (values: CreatePoolForm) => {
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

        <Formik
          initialValues={initialValues}
          validationSchema={poolValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="p-6 space-y-6">
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
                          setFieldValue('type', key);
                          setFieldValue('name', preset.name);
                          setFieldValue('description', preset.description);
                          setFieldValue('riskLevel', preset.riskLevel);
                          setFieldValue('tradingStrategy', preset.tradingStrategy);
                          setFieldValue('maxLeverage', preset.maxLeverage);
                          setStep('details');
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedType === key
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-semibold text-slate-100">{preset.name}</p>
                          <p className="text-sm text-slate-400">{preset.description}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            Risque: {preset.riskLevel.toUpperCase()}
                          </p>
                        </div>
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
                      <Field
                        name="name"
                        type="text"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                        placeholder="Ex: Momentum BTC"
                      />
                      <ErrorMessage name="name" component="p" className="text-red-400 text-xs mt-1" />
                    </div>

                    {/* Risk Level */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Niveau de risque
                      </label>
                      <Field
                        name="riskLevel"
                        as="select"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyen</option>
                        <option value="high">Élevé</option>
                        <option value="very_high">Très élevé</option>
                      </Field>
                      <ErrorMessage name="riskLevel" component="p" className="text-red-400 text-xs mt-1" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <Field
                      name="description"
                      as="textarea"
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      placeholder="Description du pool..."
                    />
                    <ErrorMessage name="description" component="p" className="text-red-400 text-xs mt-1" />
                  </div>

                  {/* Trading Strategy */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Stratégie de trading
                    </label>
                    <Field
                      name="tradingStrategy"
                      as="textarea"
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      placeholder="Détails de la stratégie..."
                    />
                    <ErrorMessage name="tradingStrategy" component="p" className="text-red-400 text-xs mt-1" />
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Montant cible (€)
                      </label>
                      <Field
                        name="targetAmount"
                        type="number"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                      <ErrorMessage name="targetAmount" component="p" className="text-red-400 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Investissement min (€)
                      </label>
                      <Field
                        name="minInvestment"
                        type="number"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                      <ErrorMessage name="minInvestment" component="p" className="text-red-400 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Max investisseurs
                      </label>
                      <Field
                        name="maxInvestors"
                        type="number"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                      <ErrorMessage name="maxInvestors" component="p" className="text-red-400 text-xs mt-1" />
                    </div>
                  </div>

                  {/* Manager Fee */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Frais manager (%)
                    </label>
                    <Field
                      name="managerFeePercentage"
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    />
                    <ErrorMessage name="managerFeePercentage" component="p" className="text-red-400 text-xs mt-1" />
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
                      <Field
                        name="startDate"
                        type="date"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                      <ErrorMessage name="startDate" component="p" className="text-red-400 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Date de fermeture
                      </label>
                      <Field
                        name="endDate"
                        type="date"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                      />
                      <ErrorMessage name="endDate" component="p" className="text-red-400 text-xs mt-1" />
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
                      else if (step === 'advanced') setStep('dates');
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

                  {step !== 'advanced' && !pool && (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 'type') setStep('details');
                        else if (step === 'details') setStep('dates');
                        else if (step === 'dates') setStep('advanced');
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
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PoolModal;
