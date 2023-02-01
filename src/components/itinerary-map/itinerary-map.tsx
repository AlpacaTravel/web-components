import { Component, Element, Event, Host, h, Prop, EventEmitter, Method } from '@stencil/core';
import type {
  Map,
  MapboxEvent,
  MapMouseEvent,
  Popup,
  MapboxGeoJSONFeature,
  PopupOptions,
} from 'mapbox-gl';

@Component({
  tag: 'itinerary-map',
  styleUrls: ['itinerary-map.css'],
  shadow: true,
})
export class ItineraryMap {
  @Element() el: HTMLElement;
  private map: Map;
  private popup: Popup;
  private manifest: Manifest;

  @Prop() alpacaAccessToken: string;
  @Prop() mapboxAccessToken: string;
  @Prop() itineraryId: string;

  @Prop() initialFitBoundsPadding: string;
  @Prop() disableMouseoverPopup: boolean;

  // Mapbox API Events
  @Event({
    eventName: 'mapbox',
    composed: true,
    bubbles: true,
    cancelable: false,
  })
  mapboxEvent: EventEmitter<MapboxEvent>;
  // Alpaca Events (indicated, etc)
  @Event({
    eventName: 'alpaca',
    composed: true,
    bubbles: true,
    cancelable: false,
  })
  alpacaEvent: EventEmitter<AlpacaEvent>;

  constructor() {
    this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this);
  }

  componentDidLoad() {
    this.initialise();
  }

  async initialise() {
    // Obtain the mapbox api from the window
    const Map = window.mapboxgl.Map;

    if (window.mapboxgl.accessToken == null && this.mapboxAccessToken) {
      window.mapboxgl.accessToken = this.mapboxAccessToken;
    }

    // Access the alpaca access token
    // Can be included on the window or via a prop
    const alpacaAccessToken = (() => {
      if (this.alpacaAccessToken != null) {
        return this.alpacaAccessToken;
      }
      if ('alpacaAccessToken' in window) {
        return window.alpacaAccessToken;
      }
    })();

    // Fetch the manifest
    this.manifest = await fetchManifest(
      `https://mapping.withalpaca.com/v1/${this.itineraryId}.json?accessToken=${alpacaAccessToken}`,
    );

    // Build the options
    const options: any = {
      container: this.el,
      style: this.manifest.styles.default,
      bounds: this.manifest.bounds,
      fitBoundsOptions: { padding: Number(this.initialFitBoundsPadding) || 50 },
    };

    // Initiate a mapbox instance
    this.map = new Map(options);

    // Add in a resize observer
    const resizeObserver = new ResizeObserver(() => this.map.resize());
    resizeObserver.observe(this.el);

    // Listen to any events to be emitted
    const relay = (event: MapboxEvent) => this.mapboxEvent.emit(event);
    this.map.on('load', relay);
    // TODO: Add any more events of interest...

    // Add in our listener
    this.map.on('mousemove', this.onMouseMoveHandler);
  }

  async onMouseMoveHandler(e: MapMouseEvent) {
    const features = this.map.queryRenderedFeatures(e.point, {
      filter: ['==', 'class', 'location_marker'],
    });

    // Build the event
    const event: AlpacaEvent = {
      type: 'indicated',
      target: features.flatMap(feature => {
        const { id } = feature.properties;
        if (/^itinerary\/[^\/]+\/location\//.test(id)) {
          return [{ __typename: 'ItineraryLocation', id, feature }];
        }
        return [];
      }),
      position: e.lngLat.toArray() as [number, number],
    };

    // Determine the indicated action
    this.alpacaEvent.emit(event);

    if (this.disableMouseoverPopup !== true) {
      // Reset the popup state
      this.removeIndicatedFeaturePopup();
      this.map.getCanvas().style.cursor = '';

      // If we have a target
      if (event.target.length > 0) {
        const [target] = event.target;

        this.map.getCanvas().style.cursor = 'pointer';
        this.displayIndicatedFeaturePopup(target);
      }
    }
  }

  @Method()
  async displayIndicatedFeaturePopup(
    item: Target,
    options: {
      position?: [number, number];
      popup?: PopupOptions;
    } = {
      popup: {
        closeButton: false,
      },
    },
  ) {
    const id = item.id;
    const pos = (() => {
      // Position is supplied
      if (options.position != null) {
        return options.position;
      }
      // Item position is most accurate
      if (item.position != null) {
        return [item.position.lon, item.position.lat] as [number, number];
      }
      // Check the geometry from a posisble feature
      if (item.feature?.geometry != null) {
        const { geometry } = item.feature;
        if (geometry.type == 'Point') {
          return geometry.coordinates as [number, number];
        }
      }
      // If we have a manifest viewport
      if (this.manifest?.viewports[id] != null) {
        const viewport = this.manifest.viewports[id];

        if (viewport.pos != null) {
          return viewport.pos;
        }
      }
    })();
    const label = (() => {
      // Obtain from the item
      if (item.title != null) {
        return item.title;
      }
      // Obtain from the feature properties
      const feature = (() => {
        // Look at the included feature
        if (item.feature != null) {
          return item.feature;
        }
        // Query the loaded map source data
        const source = this.itineraryId.replace('itinerary/', 'itinerary_');
        const filter = ['all', ['==', 'class', 'location_marker'], ['==', 'id', id]];
        const querySource = this.map.querySourceFeatures(source, {
          filter,
          sourceLayer: 'default',
        });

        return querySource[0];
      })();

      if (feature?.properties?.label != null) {
        return feature.properties.label;
      }
    })();

    if (id != null && pos != null && label != null) {
      this.popup = new window.mapboxgl.Popup(options.popup)
        .setHTML(`<strong>${label}</strong>`)
        .setLngLat(pos)
        .addTo(this.map);
    }
  }

  @Method()
  async removeIndicatedFeaturePopup() {
    if (this.popup != null) {
      // Remove the popup if no marker under the mouse
      if (this.popup) this.popup.remove();
    }
  }

  @Method()
  async getMapboxApi() {
    return this.map;
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}

export type AlpacaEvent = {
  type: 'indicated';
  target: Target[];
  position: [number, number] | undefined;
};

export type Target = ItineraryLocation & {
  feature?: Feature;
};

type NodeIdentifier<T extends string> = {
  __typename?: T;
  id: string;
};

export type ItineraryLocation = NodeIdentifier<'ItineraryLocation'> & {
  title?: string;
  position?: { lon: number; lat: number };
};

export type Feature = MapboxGeoJSONFeature & {
  properties: {
    id?: string;
    label?: string;
  };
};

async function fetchManifest(url): Promise<Manifest> {
  const response = await fetch(url);

  const json = await response.json();

  return json;
}

type Viewport = NodeIdentifier<'ItineraryLocation' | 'Itinerary'> & {
  pos?: [number, number];
  bounds: [[number, number], [number, number]] | null;
};

type Manifest = {
  viewports: Record<string, Viewport>;
  styles: Record<string, string>;
  bounds: [[number, number], [number, number]] | null;
};
