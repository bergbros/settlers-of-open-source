export enum BuildOptions {
    Road = 0,
    Settlement = 1,
    City = 2,
    Development = 3
};

export const AllBuildOptions = Object.freeze([
    BuildOptions.Road,
    BuildOptions.Settlement,
    BuildOptions.City,
    BuildOptions.Development
]);

export const AllBuildCosts = Object.freeze({
    Road: [1,1,0,0,0],
    Settlement: [1,1,1,1,0],
    City: [0,0,0,3,2],
    Development: [0,0,1,1,1]
});

export function actionToString(action:BuildOptions):string{
    switch(action){ 
        case BuildOptions.Road:
            return "Build Road";
        case BuildOptions.Settlement:
            return "Build Settlement";
        case BuildOptions.City:
            return "Build City";
        case BuildOptions.Development:
            return "Buy Development Card";
    }
    return '';
}

