import { newE2EPage } from '@stencil/core/testing';

describe('itinerary-map', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<itinerary-map></itinerary-map>');

    const element = await page.find('itinerary-map');
    expect(element).toHaveClass('hydrated');
  });
});
