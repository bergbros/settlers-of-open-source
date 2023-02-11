export enum TerrainType {
  Empty,
  Water,
  Land,
};

export enum ResourceType {
  None, // desert
  Ore,
  Brick,
  Grain,
  Wood,
  Sheep,
}

export function resourceToLand(resource: ResourceType): string {
  switch (resource) {
    case ResourceType.Ore:
      return 'Mountain';
    case ResourceType.Brick:
      return 'Hill';
    case ResourceType.Grain:
      return 'Field';
    case ResourceType.Wood:
      return 'Forest';
    case ResourceType.Sheep:
      return 'Pasture';

    default:
      return 'Desert';
    }
}