import { newSpecPage } from '@stencil/core/testing';
import { ItineraryMap } from '../itinerary-map';

describe('itinerary-map', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ItineraryMap],
      html: `<itinerary-map></itinerary-map>`,
    });
    expect(page.root).toEqualHtml(`
      <itinerary-map>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </itinerary-map>
    `);
  });
});
