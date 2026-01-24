export const MEDICINE_STAGES = [
    'Ordered',
    'Raw Material Supply',
    'Manufacturing',
    'Distribution',
    'Retail',
    'Sold'
] as const;

export const STAGE = {
    Ordered: MEDICINE_STAGES[0],
    RawMaterialSupply: MEDICINE_STAGES[1],
    Manufacturing: MEDICINE_STAGES[2],
    Distribution: MEDICINE_STAGES[3],
    Retail: MEDICINE_STAGES[4],
    Sold: MEDICINE_STAGES[5]
} as const;

export const getMedicineStageLabel = (stageIndex: number | string): string => {
    const index = Number(stageIndex);
    if (isNaN(index) || index < 0 || index >= MEDICINE_STAGES.length) {
        return 'Unknown Stage';
    }
    return MEDICINE_STAGES[index];
};
