/**
 * Merge raw GROUP BY counts with a fixed status list so every status appears (count 0 if absent).
 */
export const buildFullStatusCounts = (rawCounts, allStatuses) => {
    const byStatus = Object.fromEntries(
        rawCounts.map((sc) => [sc.status, parseInt(sc.count, 10) || 0])
    );
    return allStatuses.map((status) => ({
        status,
        count: byStatus[status] ?? 0,
    }));
};
