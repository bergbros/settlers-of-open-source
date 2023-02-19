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

export const AllResourceTypes = Object.freeze([
  ResourceType.Ore,
  ResourceType.Brick,
  ResourceType.Grain,
  ResourceType.Wood,
  ResourceType.Sheep
]);

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

export function resourceToString(resource: ResourceType): string {
  switch (resource) {
    case ResourceType.Ore:
      return 'Ore';
    case ResourceType.Brick:
      return 'Brick';
    case ResourceType.Grain:
      return 'Grain';
    case ResourceType.Wood:
      return 'Wood';
    case ResourceType.Sheep:
      return 'Sheep';
    default:
      return '';
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