export enum TerrainType {
  Empty,
  Water,
  Land,
};

export enum ResourceType {
  None = -1, // desert
  Ore = 0,
  Brick = 1,
  Grain = 2,
  Wood = 3,
  Sheep = 4,
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

export function stringToResource(jsonResource: string) {
  switch (jsonResource) {
    case 'o':
      return ResourceType.Ore;
    case 'b':
      return ResourceType.Brick;
    case 'g':
      return ResourceType.Grain;
    case 'w':
      return ResourceType.Wood;
    case 's':
      return ResourceType.Sheep;
    default:
      return ResourceType.None;
  }
}