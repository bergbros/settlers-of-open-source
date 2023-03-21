import HexCoords from './hex-coords.js';
import VertexCoords, { VertexDirection } from './vertex-coords.js';

describe('VertexCoords', () => {
  it('normalizes vertex coords using VertexDirection.S on odd row', () => {
    const vertexCoords = new VertexCoords(new HexCoords(3, 3), VertexDirection.S);

    // moves it to 4,4
    expect(vertexCoords.hexCoords.x).toEqual(4);
    expect(vertexCoords.hexCoords.y).toEqual(4);
    expect(vertexCoords.direction).toEqual(VertexDirection.NW);
  });

  it('normalizes vertex coords using VertexDirection.S on even row', () => {
    const vertexCoords = new VertexCoords(new HexCoords(2, 2), VertexDirection.S);

    // moves it to 2,3
    expect(vertexCoords.hexCoords.x).toEqual(2);
    expect(vertexCoords.hexCoords.y).toEqual(3);
    expect(vertexCoords.direction).toEqual(VertexDirection.NW);
  });

  it('normalizes vertex coords using VertexDirection.SE on odd row', () => {
    const vertexCoords = new VertexCoords(new HexCoords(3, 3), VertexDirection.SE);

    // moves it to 4,4
    expect(vertexCoords.hexCoords.x).toEqual(4);
    expect(vertexCoords.hexCoords.y).toEqual(4);
    expect(vertexCoords.direction).toEqual(VertexDirection.N);
  });

  it('normalizes vertex coords using VertexDirection.SE on even row', () => {
    const vertexCoords = new VertexCoords(new HexCoords(2, 2), VertexDirection.SE);

    // moves it to 2,3
    expect(vertexCoords.hexCoords.x).toEqual(2);
    expect(vertexCoords.hexCoords.y).toEqual(3);
    expect(vertexCoords.direction).toEqual(VertexDirection.N);
  });

  it('normalizes vertex coords using VertexDirection.NE on odd row', () => {
    const vertexCoords = new VertexCoords(new HexCoords(3, 3), VertexDirection.NE);

    // moves it to 4,4
    expect(vertexCoords.hexCoords.x).toEqual(4);
    expect(vertexCoords.hexCoords.y).toEqual(3);
    expect(vertexCoords.direction).toEqual(VertexDirection.NW);
  });

  it('normalizes vertex coords using VertexDirection.NE on even row', () => {
    const vertexCoords = new VertexCoords(new HexCoords(2, 2), VertexDirection.NE);

    // moves it to 2,3
    expect(vertexCoords.hexCoords.x).toEqual(3);
    expect(vertexCoords.hexCoords.y).toEqual(2);
    expect(vertexCoords.direction).toEqual(VertexDirection.NW);
  });
});
