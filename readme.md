# Alpaca Travel Web Components

Provides some basic components that could be used to add to a site or forked
and styled as appropriate for your application.

These examples can be used to include alpaca on your website, and also
enhance functionality through communicating with the web component interface.

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Include mapbox -->
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js"></script>
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.css" rel="stylesheet" />

    <!-- Include the web components -->
    <script type="module" src="https://unpkg.com/@alpaca-travel/web-components@latest"></script>
  </head>
  <body>
    <itinerary-map
      itinerary-id="itinerary/abc123"
      alpaca-access-token="pk.123"
      mapbox-access-token="pk.123"
    />
  </body>
</html>
```
