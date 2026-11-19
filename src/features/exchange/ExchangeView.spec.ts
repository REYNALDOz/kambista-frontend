import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../shared/api/http';
import { createTransaction } from './api';
import ExchangeView from './ExchangeView.vue';

vi.mock('./api');

const created = {
  id: 'tx-1',
  monedaOrigen: 'USD' as const,
  monedaDestino: 'PEN' as const,
  monto: 100,
  montoCambiado: 373.9,
  tipoCambio: 3.739,
  fecha: '2024-01-18T15:30:00.000Z',
};

async function submitWith(amount: string) {
  const wrapper = mount(ExchangeView);
  await wrapper.get('input').setValue(amount);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  return wrapper;
}

describe('ExchangeView', () => {
  beforeEach(() => {
    vi.mocked(createTransaction).mockReset();
  });

  it('shows the error and does not call the API when the amount is empty', async () => {
    const wrapper = await submitWith('');

    expect(wrapper.text()).toContain('Ingresa el monto a cambiar.');
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('does not call the API when both currencies are the same', async () => {
    const wrapper = mount(ExchangeView);
    await wrapper.get('input').setValue('100');
    await wrapper.findAll('select')[1].setValue('USD'); // "to" becomes USD, like "from"
    await wrapper.get('form').trigger('submit');

    expect(wrapper.text()).toContain('deben ser distintas');
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('sends the exchange and shows what the user receives', async () => {
    vi.mocked(createTransaction).mockResolvedValue(created);

    const wrapper = await submitWith('100');

    expect(createTransaction).toHaveBeenCalledWith({
      monedaOrigen: 'USD',
      monedaDestino: 'PEN',
      monto: 100,
    });
    expect(wrapper.text()).toContain('Tu cambio fue registrado');
    // Peruvian format: "S/ 373.90" (the space can be a non-breaking one).
    expect(wrapper.text()).toMatch(/S\/\s373\.90/);
  });

  it('shows the message of the API when the exchange fails', async () => {
    vi.mocked(createTransaction).mockRejectedValue(
      new ApiError(503, 'Todavía no hay un tipo de cambio disponible.'),
    );

    const wrapper = await submitWith('100');

    expect(wrapper.text()).toContain(
      'Todavía no hay un tipo de cambio disponible.',
    );
    expect(wrapper.find('form').exists()).toBe(true); // the user can try again
  });
});
