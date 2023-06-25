export enum TerrainType {
  Empty,
  Water,
  Land,
}

export enum ResourceType {
  WaterNone = -2,
  None = -1, // desert
  Wood = 0,
  Brick = 1,
  Sheep = 2,
  Grain = 3,
  Ore = 4,
  WoodPort = 5,
  BrickPort = 6,
  SheepPort = 7,
  GrainPort = 8,
  OrePort = 9,
  AnyPort = 10,
}

export const SeaResourceTypes = Object.freeze([
  ResourceType.WaterNone,
  ResourceType.WoodPort,
  ResourceType.BrickPort,
  ResourceType.SheepPort,
  ResourceType.GrainPort,
  ResourceType.OrePort,
  ResourceType.AnyPort,
]);

export const AllResourceTypes = Object.freeze([
  ResourceType.Wood,
  ResourceType.Brick,
  ResourceType.Sheep,
  ResourceType.Grain,
  ResourceType.Ore,
]);

export function resourceToLand(resource: ResourceType | undefined): string {
  if (resource === undefined) {
    return 'none';
  }
  switch (resource) {
    case ResourceType.Ore:
      return 'ore';
    case ResourceType.Brick:
      return 'brick';
    case ResourceType.Grain:
      return 'grain';
    case ResourceType.Wood:
      return 'wood';
    case ResourceType.Sheep:
      return 'sheep';
    case ResourceType.OrePort:
      return 'ore';
    case ResourceType.BrickPort:
      return 'brick';
    case ResourceType.GrainPort:
      return 'grain';
    case ResourceType.WoodPort:
      return 'wood';
    case ResourceType.SheepPort:
      return 'sheep';
    default:
      return 'none';
  }
}

export function resourceToString(resource: ResourceType | undefined): string {
  if (resource === undefined) {
    return '';
  }

  switch (resource) {
    case ResourceType.Wood:
      return '🌳 Wood';
    case ResourceType.Brick:
      return '🧱Brick';
    case ResourceType.Sheep:
      return '🐑Sheep';
    case ResourceType.Grain:
      return '🌾Grain';
    case ResourceType.Ore:
      return '⛰️  Ore';
    default:
      return '';
  }
}

export function resourceToSymbol(resource: ResourceType | undefined): string {
  if (resource === undefined) {
    return '';
  }

  switch (resource) {
    case ResourceType.Wood:
      return '🌳';
    case ResourceType.Brick:
      return '🧱';
    case ResourceType.Sheep:
      return '🐑';
    case ResourceType.Grain:
      return '🌾';
    case ResourceType.Ore:
      return '🗿';
    case ResourceType.WoodPort:
      return '🌳';
    case ResourceType.BrickPort:
      return '🧱';
    case ResourceType.SheepPort:
      return '🐑';
    case ResourceType.GrainPort:
      return '🌾';
    case ResourceType.OrePort:
      return '⛰️';
    case ResourceType.AnyPort:
      return '❔';
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
    case '/o':
      return ResourceType.OrePort;
    case '/b':
      return ResourceType.BrickPort;
    case '/g':
      return ResourceType.GrainPort;
    case '/w':
      return ResourceType.WoodPort;
    case '/s':
      return ResourceType.SheepPort;
    case '/a':
      return ResourceType.AnyPort;
    case '/':
      return ResourceType.WaterNone;
    default:
      return ResourceType.None;
  }
}

export function isSeaType(resource: ResourceType | undefined) {
  if (resource === undefined) {
    return false;
  }
  return SeaResourceTypes.includes(resource);
}

export function resourceToLetter(resource: ResourceType | undefined): string {
  if (resource === undefined) {
    return '/';
  }

  switch (resource) {
    case ResourceType.Wood:
      return 'w';
    case ResourceType.Brick:
      return 'b';
    case ResourceType.Sheep:
      return 's';
    case ResourceType.Grain:
      return 'g';
    case ResourceType.Ore:
      return 'o';
    default:
      return 'd'; //desert
  }
}
