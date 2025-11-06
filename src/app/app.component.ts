import { Component, ElementRef, viewChild, effect } from '@angular/core';
import { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import polygonToLine from '@turf/polygon-to-line';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import type { GeoJsonProperties, Geometry, Polygon, GeoJSON } from 'geojson';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div #mapDiv style="width:100vw;height:100vh"></div>`
})
export class AppComponent {
  mapDiv = viewChild<ElementRef>('mapDiv');
  poly: Polygon = { type: 'Polygon', coordinates: [[[-10, 50], [10, 50], [10, 40], [-10, 40], [-10, 50]]] };

  constructor() {
    effect(() => {
      if (!this.mapDiv()) return;

      const map = new MapLibreMap({
        container: this.mapDiv()!.nativeElement,
        style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] },
        center: [0, 45],
        zoom: 4
      });

      map.on('load', () => {
        // Add polygon
        map.addSource('poly', { type: 'geojson', data: { type: 'Feature', geometry: this.poly, properties: {} } });
        map.addLayer({ id: 'poly-fill', type: 'fill', source: 'poly', paint: { 'fill-color': '#088', 'fill-opacity': 0.3 } });
        map.addLayer({ id: 'poly-line', type: 'line', source: 'poly', paint: { 'line-color': '#088', 'line-width': 2 } });

        // Add debug layers
        map.addSource('debug', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: 'debug-border', type: 'line', source: 'debug', filter: ['==', ['get', 't'], 'border'], paint: { 'line-color': '#0f0', 'line-width': 3 } });
        map.addLayer({ id: 'debug-cursor', type: 'circle', source: 'debug', filter: ['==', ['get', 't'], 'cursor'], paint: { 'circle-radius': 5, 'circle-color': '#0af', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
        map.addLayer({ id: 'debug-nearest', type: 'circle', source: 'debug', filter: ['==', ['get', 't'], 'nearest'], paint: { 'circle-radius': 7, 'circle-color': '#f00', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
      });

      map.on('mousemove', (e) => {
        const c: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        const lines = polygonToLine(this.poly);
        const lineFeature = lines.type === 'FeatureCollection' ? lines.features[0] : lines;
        const n = nearestPointOnLine(lineFeature, c).geometry.coordinates as [number, number];

        const features: Array<{ type: 'Feature', geometry: Geometry, properties: GeoJsonProperties }> = [];

        // Add border lines
        if (lines.type === 'Feature' && lines.geometry.type === 'LineString') {
          features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: lines.geometry.coordinates }, properties: { t: 'border' } });
        }

        // Add points
        features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: c }, properties: { t: 'cursor' } });
        features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: n }, properties: { t: 'nearest' } });

        (map.getSource('debug') as GeoJSONSource).setData({ type: 'FeatureCollection', features });
      });
    });
  }
}
