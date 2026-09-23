import { Component, ElementRef, afterNextRender, viewChild } from '@angular/core';
import { nearestPointOnLine } from '@turf/nearest-point-on-line';
import { polygonToLine } from '@turf/polygon-to-line';
import type { Feature, LineString, Polygon } from 'geojson';
import { config, GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

/** The worker ships as its own file, copied to the app root by the `assets` entry in angular.json. */
config.WORKER_URL = 'maplibre-gl-worker.mjs';

const POLY: Polygon = {
  type: 'Polygon',
  coordinates: [[[-10, 50], [10, 50], [10, 40], [-10, 40], [-10, 50]]],
};

/** A single-ring Polygon always converts to one LineString Feature. */
const BORDER = polygonToLine(POLY) as Feature<LineString>;

@Component({
  selector: 'app-root',
  template: `<div #mapDiv style="width:100vw;height:100vh"></div>`,
})
export class AppComponent {
  private readonly mapDiv = viewChild.required<ElementRef<HTMLElement>>('mapDiv');

  constructor() {
    afterNextRender(() => this.initMap());
  }

  private initMap(): void {
    const map = new MapLibreMap({
      container: this.mapDiv().nativeElement,
      style: {
        version: 8,
        sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [0, 45],
      zoom: 4,
    });

    map.on('load', () => {
      map.addSource('poly', { type: 'geojson', data: { type: 'Feature', geometry: POLY, properties: {} } });
      map.addLayer({ id: 'poly-fill', type: 'fill', source: 'poly', paint: { 'fill-color': '#088', 'fill-opacity': 0.3 } });
      map.addLayer({ id: 'poly-line', type: 'line', source: 'poly', paint: { 'line-color': '#088', 'line-width': 2 } });

      map.addSource('debug', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'debug-border', type: 'line', source: 'debug', filter: ['==', ['get', 't'], 'border'], paint: { 'line-color': '#0f0', 'line-width': 3 } });
      map.addLayer({ id: 'debug-cursor', type: 'circle', source: 'debug', filter: ['==', ['get', 't'], 'cursor'], paint: { 'circle-radius': 5, 'circle-color': '#0af', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
      map.addLayer({ id: 'debug-nearest', type: 'circle', source: 'debug', filter: ['==', ['get', 't'], 'nearest'], paint: { 'circle-radius': 7, 'circle-color': '#f00', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
    });

    map.on('mousemove', (e) => {
      const cursor: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const nearest = nearestPointOnLine(BORDER, cursor);

      map.getSource<GeoJSONSource>('debug')?.setData({
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: BORDER.geometry, properties: { t: 'border' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: cursor }, properties: { t: 'cursor' } },
          { type: 'Feature', geometry: nearest.geometry, properties: { t: 'nearest' } },
        ],
      });
    });
  }
}
