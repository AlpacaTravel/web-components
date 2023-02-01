# itinerary-map



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                    | Description | Type      | Default     |
| ------------------------- | ---------------------------- | ----------- | --------- | ----------- |
| `alpacaAccessToken`       | `alpaca-access-token`        |             | `string`  | `undefined` |
| `disableMouseoverPopup`   | `disable-mouseover-popup`    |             | `boolean` | `undefined` |
| `initialFitBoundsPadding` | `initial-fit-bounds-padding` |             | `string`  | `undefined` |
| `itineraryId`             | `itinerary-id`               |             | `string`  | `undefined` |
| `mapboxAccessToken`       | `mapbox-access-token`        |             | `string`  | `undefined` |


## Events

| Event    | Description | Type                                                                                |
| -------- | ----------- | ----------------------------------------------------------------------------------- |
| `alpaca` |             | `CustomEvent<{ type: "indicated"; target: Target[]; position: [number, number]; }>` |
| `mapbox` |             | `CustomEvent<MapboxEvent<undefined>>`                                               |


## Methods

### `displayIndicatedFeaturePopup(item: Target, options?: { position?: [number, number]; popup?: PopupOptions; }) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getMapboxApi() => Promise<Map>`



#### Returns

Type: `Promise<Map>`



### `removeIndicatedFeaturePopup() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
