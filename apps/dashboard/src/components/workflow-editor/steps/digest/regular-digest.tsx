import { useMemo } from 'react';
import { TimeUnitEnum } from '@novu/shared';

import { AmountInput } from '@/components/amount-input';
import { TIME_UNIT_OPTIONS } from '@/components/workflow-editor/steps/time-units';
import { AMOUNT_KEY, UNIT_KEY } from '@/components/workflow-editor/steps/digest/keys';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { useSaveForm } from '@/components/workflow-editor/steps/save-form-context';

export const RegularDigest = () => {
  const { step } = useWorkflow();
  const { saveForm } = useSaveForm();
  const { dataSchema } = step?.controls ?? {};

  const minAmountValue = useMemo(() => {
    const fixedDurationSchema = dataSchema?.anyOf?.[0];
    if (typeof fixedDurationSchema === 'object') {
      const amountField = fixedDurationSchema.properties?.amount;

      if (typeof amountField === 'object' && amountField.type === 'number') {
        return amountField.minimum ?? 1;
      }
    }

    return 1;
  }, [dataSchema]);

  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground-600 text-xs font-medium">Digest events for</span>
      <AmountInput
        fields={{ inputKey: `${AMOUNT_KEY}`, selectKey: `${UNIT_KEY}` }}
        options={TIME_UNIT_OPTIONS}
        defaultOption={TimeUnitEnum.SECONDS}
        className="w-min [&_input]:!w-[3ch] [&_input]:!min-w-[3ch]"
        onValueChange={() => saveForm()}
        showError={false}
        min={minAmountValue}
      />
    </div>
  );
};