import { flushPromises, mount } from '@vue/test-utils'
import MainPage from '@/views/MainPage.vue'
import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => vi.unstubAllGlobals())

describe('Cuaca Jakarta', () => {
  test('pairs hourly values and limits the list to ten rows', async () => {
    const time = Array.from({ length: 12 }, (_, i) => `2026-10-18T${String(i).padStart(2, '0')}:00`)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hourly: { time, temperature_2m: time.map((_, i) => 25 + i) } }),
    }))
    const wrapper = mount(MainPage)
    await flushPromises()
    expect(wrapper.findAll('ion-item')).toHaveLength(10)
    expect(wrapper.findAll('ion-item')[0].text()).toContain('2026-10-18 00:00')
    expect(wrapper.findAll('ion-item')[0].text()).toContain('25 °C')
    expect(wrapper.findAll('ion-item')[9].text()).toContain('34 °C')
    wrapper.unmount()
  })

  test('shows failure and recovers when reloaded', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        hourly: { time: ['2026-10-18T00:00'], temperature_2m: [null] },
      }) })
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(MainPage)
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Offline')
    await wrapper.find('ion-button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Tidak tersedia')
    wrapper.unmount()
  })

  test('rejects mismatched hourly arrays', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true,
      json: async () => ({ hourly: { time: ['2026-10-18T00:00'], temperature_2m: [] } }),
    }))
    const wrapper = mount(MainPage)
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Format data cuaca tidak sesuai')
    expect(wrapper.findAll('ion-item')).toHaveLength(0)
    wrapper.unmount()
  })
})
