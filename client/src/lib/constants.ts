export const MEDICINE_STAGES = [
    'Ordered',
    'Raw Material Supply',
    'Manufacturing',
    'Distribution',
    'Retail',
    'Sold'
] as const;

export const getMedicineStageLabel = (stageIndex: number | string): string => {
    const index = Number(stageIndex);
    if (isNaN(index) || index < 0 || index >= MEDICINE_STAGES.length) {
        return 'Unknown Stage';
    }
    return MEDICINE_STAGES[index];
};
