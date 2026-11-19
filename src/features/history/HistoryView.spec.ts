import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../shared/api/http';
import type { TransactionResponse } from '../exchange/types';
import { getHistory, type HistoryPage } from './api';
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

/** What the server answers: one page of items, and how many there are in total. */
const pageOf = (
  items: TransactionResponse[],
  total = items.length,
): HistoryPage => ({ items, total });

async function open() {
  const wrapper = mount(HistoryView, { global: { plugins: [createPinia()] } });
  await flushPromises();
  return wrapper;
}

const nextButton = (wrapper: Awaited<ReturnType<typeof open>>) =>
  wrapper.findAll('button').find((b) => b.text() === 'Siguiente')!;

describe('HistoryView', () => {
  beforeEach(() => {
    vi.mocked(getHistory).mockReset();
  });

  it('loads the last 30 days when it opens, asking for the days of the user', async () => {
    vi.mocked(getHistory).mockResolvedValue(pageOf(many(2)));

    const wrapper = await open();

    expect(getHistory).toHaveBeenCalledTimes(1);
    expect(getHistory).toHaveBeenCalledWith(
      {
        startDate: expect.stringMatching(/T05:00:00\.000Z$/), // midnight in Peru
        endDate: expect.stringMatching(/T04:59:59\.999Z$/), // the end of the day in Peru
      },
      1,
      10,
    );
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  describe('pagination, done by the server', () => {
    it('asks the server for each page and shows the total it reports', async () => {
      vi.mocked(getHistory)
        .mockResolvedValueOnce(pageOf(many(10), 25))
        .mockResolvedValueOnce(pageOf(many(10), 25))
        .mockResolvedValueOnce(pageOf(many(5), 25));

      const wrapper = await open();
      expect(wrapper.findAll('tbody tr')).toHaveLength(10);
      expect(wrapper.text()).toContain('Mostrando 1–10 de 25');

      await nextButton(wrapper).trigger('click');
      await flushPromises();
      expect(getHistory).toHaveBeenLastCalledWith(expect.anything(), 2, 10);
      expect(wrapper.text()).toContain('Mostrando 11–20 de 25');

      await nextButton(wrapper).trigger('click');
      await flushPromises();
      expect(getHistory).toHaveBeenLastCalledWith(expect.anything(), 3, 10);
      expect(wrapper.findAll('tbody tr')).toHaveLength(5);
      expect(nextButton(wrapper).attributes('disabled')).toBeDefined(); // last page
    });

    it('goes back to the first page when the user searches again', async () => {
      vi.mocked(getHistory).mockResolvedValue(pageOf(many(10), 25));
      const wrapper = await open();
      await nextButton(wrapper).trigger('click');
      await flushPromises();

      await wrapper.get('form').trigger('submit');
      await flushPromises();

      expect(getHistory).toHaveBeenLastCalledWith(expect.anything(), 1, 10);
    });

    it('keeps the days of the last search when moving between pages, even if the inputs were edited', async () => {
      vi.mocked(getHistory).mockResolvedValue(pageOf(many(10), 25));
      const wrapper = await open();
      const daysOfTheSearch = vi.mocked(getHistory).mock.calls[0][0];

      // The user changes a date but does not press "Buscar".
      await wrapper.findAll('input')[0].setValue('2000-01-01');
      await nextButton(wrapper).trigger('click');
      await flushPromises();

      expect(getHistory).toHaveBeenLastCalledWith(daysOfTheSearch, 2, 10);
    });
  });

  it('says so when there are no operations in the range', async () => {
    vi.mocked(getHistory).mockResolvedValue(pageOf([]));

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
      .mockResolvedValueOnce(pageOf(many(3)));

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
    vi.mocked(getHistory).mockResolvedValue(pageOf(many(1)));
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

  it('ignores a slow answer that arrives after a newer search', async () => {
    let finishFirst!: (page: HistoryPage) => void;
    vi.mocked(getHistory)
      .mockImplementationOnce(
        () =>
          new Promise<HistoryPage>((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(pageOf(many(2)));
    const wrapper = mount(HistoryView, {
      global: { plugins: [createPinia()] },
    });
    await flushPromises();

    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    finishFirst(pageOf(many(7)));
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });
});
