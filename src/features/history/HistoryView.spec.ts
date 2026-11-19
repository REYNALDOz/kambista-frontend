import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../shared/api/http';
import type { TransactionResponse } from '../exchange/types';
import { getHistory } from './api';
import HistoryView from './HistoryView.vue';

vi.mock('./api');

function exchange(n: number): TransactionResponse {
  return {
    id: `tx-${n}`,
    monedaOrigen: 'USD',
    monedaDestino: 'PEN',
    monto: n,
    montoCambiado: n * 3.739,
    tipoCambio: 3.739,
    fecha: '2024-01-18T15:30:00.000Z',
  };
}

const many = (count: number) =>
  Array.from({ length: count }, (_, i) => exchange(i + 1));

async function open() {
  const wrapper = mount(HistoryView);
  await flushPromises();
  return wrapper;
}

describe('HistoryView', () => {
  beforeEach(() => {
    vi.mocked(getHistory).mockReset();
  });

  it('loads the last 30 days when it opens, asking for the days of the user', async () => {
    vi.mocked(getHistory).mockResolvedValue(many(2));

    const wrapper = await open();

    expect(getHistory).toHaveBeenCalledTimes(1);
    expect(getHistory).toHaveBeenCalledWith({
      startDate: expect.stringMatching(/T05:00:00\.000Z$/), // midnight in Peru
      endDate: expect.stringMatching(/T04:59:59\.999Z$/), // the end of the day in Peru
    });
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('shows 10 operations per page and moves between pages', async () => {
    vi.mocked(getHistory).mockResolvedValue(many(25));

    const wrapper = await open();
    expect(wrapper.findAll('tbody tr')).toHaveLength(10);
    expect(wrapper.text()).toContain('Mostrando 1–10 de 25');

    const next = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Siguiente')!;
    await next.trigger('click');
    expect(wrapper.text()).toContain('Mostrando 11–20 de 25');

    await next.trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(5);
    expect(next.attributes('disabled')).toBeDefined(); // last page
  });

  it('says so when there are no operations in the range', async () => {
    vi.mocked(getHistory).mockResolvedValue([]);

    const wrapper = await open();

    expect(wrapper.text()).toContain(
      'No hay operaciones en este rango de fechas.',
    );
    expect(wrapper.find('table').exists()).toBe(false);
  });

  it('shows the error and lets the user retry', async () => {
    vi.mocked(getHistory)
      .mockRejectedValueOnce(
        new ApiError(500, 'Algo salió mal en el servidor.'),
      )
      .mockResolvedValueOnce(many(3));

    const wrapper = await open();
    expect(wrapper.text()).toContain('Algo salió mal en el servidor.');

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Reintentar')!
      .trigger('click');
    await flushPromises();

    expect(wrapper.text()).not.toContain('Algo salió mal');
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
  });

  it('does not search when the end date is before the start date', async () => {
    vi.mocked(getHistory).mockResolvedValue(many(1));
    const wrapper = await open();

    const [start, end] = wrapper.findAll('input');
    await start.setValue('2024-02-01');
    await end.setValue('2024-01-01');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain(
      'La fecha final no puede ser anterior a la inicial.',
    );
    expect(getHistory).toHaveBeenCalledTimes(1); // only the one when it opened
  });
});
