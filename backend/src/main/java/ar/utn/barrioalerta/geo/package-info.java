/**
 * Adaptadores del puerto {@code incidentes.dominio.Geocodificador}.
 * <p>
 * Pendiente H3: {@code GeorefAdapter} (API Georef, {@code GET /ubicacion?lat=&lon=}, timeout de 2 s,
 * ver C02 · SmartLife) y {@code GeocodificadorOffline} (GeoJSON local de barrios de CABA, punto en
 * polígono), que es el que se usa en el perfil demo para no depender de internet.
 */
package ar.utn.barrioalerta.geo;
