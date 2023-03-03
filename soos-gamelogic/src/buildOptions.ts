export enum BuildOptions {
    Road = 0,
    Settlement = 1,
    City = 2,
    Development = 3,
    Trade = 4
};

export const AllBuildOptions = Object.freeze([
    BuildOptions.Road,
    BuildOptions.Settlement,
    BuildOptions.City,
    BuildOptions.Development,
    BuildOptions.Trade
]);

export const AllBuildCosts = Object.freeze([
    [1, 1, 0, 0, 0], //road
    [1, 1, 1, 1, 0], //settlement
    [0, 0, 0, 3, 2], //city
    [0, 0, 1, 1, 1], //development
    [-4, -4, -4, -4, -4]
]);

export function actionToString(action: BuildOptions): string {
    switch (action) {
        case BuildOptions.Road:
            return "Build Road";
        case BuildOptions.Settlement:
            return "Build Settlement";
        case BuildOptions.City:
            return "Build City";
        case BuildOptions.Development:
            return "Buy Development Card";
        case BuildOptions.Trade:
            return "Trade Resources";
    }
    return '';
}

