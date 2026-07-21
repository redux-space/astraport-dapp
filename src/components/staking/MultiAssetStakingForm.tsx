'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { StakingAssetInfo, MultiAssetStakingTransaction } from '@/types/staking';
import { Plus, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface FormValues {
  stakes: Array<{
    assetCode: string;
    amount: string;
    lockupPeriod: number;
  }>;
  slippageBps: number;
}

interface MultiAssetStakingFormProps {
  availableAssets: StakingAssetInfo[];
  onSubmit: (transaction: MultiAssetStakingTransaction) => Promise<void>;
  isSubmitting?: boolean;
}

export const MultiAssetStakingForm: React.FC<MultiAssetStakingFormProps> = ({
  availableAssets,
  onSubmit,
  isSubmitting = false,
}) => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      stakes: [{ assetCode: availableAssets[0]?.code ?? '', amount: '', lockupPeriod: 30 }],
      slippageBps: 50,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'stakes' });
  const watchedStakes = watch('stakes');

  const getAssetInfo = (code: string): StakingAssetInfo | undefined =>
    availableAssets.find((a) => a.code === code);

  const getApyForTier = (code: string, lockupDays: number): number => {
    const asset = getAssetInfo(code);
    if (!asset) return 0;
    const tier = asset.apyTiers.find((t) => t.lockupDays === lockupDays);
    return tier?.apy ?? asset.apyTiers[0]?.apy ?? 0;
  };

  const calculateExpectedApy = (): number => {
    if (!watchedStakes.length) return 0;
    const totalAmount = watchedStakes.reduce(
      (sum, s) => sum + (parseFloat(s.amount) || 0),
      0
    );
    if (totalAmount === 0) return 0;
    const weightedApy = watchedStakes.reduce((sum, s) => {
      const amount = parseFloat(s.amount) || 0;
      const apy = getApyForTier(s.assetCode, s.lockupPeriod);
      return sum + (amount / totalAmount) * apy;
    }, 0);
    return weightedApy;
  };

  const handleFormSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const transaction: MultiAssetStakingTransaction = {
        stakes: values.stakes.map((s) => ({
          assetCode: s.assetCode,
          amount: s.amount,
          lockupPeriod: s.lockupPeriod,
        })),
        expectedApy: calculateExpectedApy(),
        estimatedFee: '0.00001',
        slippageBps: values.slippageBps,
      };
      await onSubmit(transaction);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Transaction failed. Please try again.'
      );
    }
  };

  const expectedApy = calculateExpectedApy();

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Multi-Asset Staking
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Stake multiple assets in a single transaction
        </p>
      </div>

      {/* Staking entries */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const selectedAsset = getAssetInfo(watchedStakes[index]?.assetCode);
          const selectedLockup = watchedStakes[index]?.lockupPeriod;
          const currentApy = getApyForTier(
            watchedStakes[index]?.assetCode,
            selectedLockup
          );

          return (
            <div
              key={field.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Asset #{index + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Asset selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Asset
                  </label>
                  <Controller
                    name={`stakes.${index}.assetCode`}
                    control={control}
                    rules={{ required: 'Select an asset' }}
                    render={({ field: f }) => (
                      <select
                        {...f}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {availableAssets.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.code} — {a.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.stakes?.[index]?.assetCode && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.stakes[index]?.assetCode?.message}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Amount {selectedAsset ? `(min: ${selectedAsset.minStake})` : ''}
                  </label>
                  <input
                    {...register(`stakes.${index}.amount`, {
                      required: 'Amount is required',
                      validate: (v) => {
                        const num = parseFloat(v);
                        if (isNaN(num) || num <= 0) return 'Enter a valid amount';
                        const asset = getAssetInfo(watchedStakes[index]?.assetCode);
                        if (asset && num < parseFloat(asset.minStake))
                          return `Minimum is ${asset.minStake}`;
                        if (asset && num > parseFloat(asset.availableBalance))
                          return `Max available: ${asset.availableBalance}`;
                        return true;
                      },
                    })}
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.stakes?.[index]?.amount && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.stakes[index]?.amount?.message}
                    </p>
                  )}
                </div>

                {/* Lockup */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Lockup Period
                  </label>
                  <Controller
                    name={`stakes.${index}.lockupPeriod`}
                    control={control}
                    render={({ field: f }) => (
                      <select
                        {...f}
                        onChange={(e) => f.onChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {selectedAsset?.apyTiers.map((tier) => (
                          <option key={tier.lockupDays} value={tier.lockupDays}>
                            {tier.lockupDays}d — {tier.apy}% APY
                          </option>
                        )) ?? (
                          <>
                            <option value={30}>30 days</option>
                            <option value={90}>90 days</option>
                            <option value={180}>180 days</option>
                            <option value={365}>365 days</option>
                          </>
                        )}
                      </select>
                    )}
                  />
                </div>
              </div>

              {/* APY badge for this asset */}
              {currentApy > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Expected APY:</span>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {currentApy.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add asset button */}
      <button
        type="button"
        onClick={() =>
          append({
            assetCode: availableAssets[0]?.code ?? '',
            amount: '',
            lockupPeriod: 30,
          })
        }
        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add another asset
      </button>

      {/* Summary row */}
      {expectedApy > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Expected weighted APY:
          </span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {expectedApy.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Slippage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Slippage Tolerance (bps)
        </label>
        <input
          {...register('slippageBps', { min: 1, max: 500 })}
          type="number"
          min={1}
          max={500}
          className="w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Default 50 bps (0.5%)
        </p>
      </div>

      {/* Status messages */}
      {submitSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">Transaction submitted successfully!</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{submitError}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Submitting Transaction...
          </>
        ) : (
          'Stake Assets'
        )}
      </button>
    </form>
  );
};

export default MultiAssetStakingForm;
