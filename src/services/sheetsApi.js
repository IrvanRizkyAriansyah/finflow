const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const DRIVE_BASE = 'https://www.googleapis.com/drive/v3/files'

export class GoogleApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.name = 'GoogleApiError'
    this.status = status
    this.details = details
  }
}

/** Factory: getToken({ force }) → Promise<string> */
export function createSheetsApi(getToken) {
  async function request(url, { method = 'GET', body } = {}) {
    const send = async (force) =>
      fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${await getToken({ force })}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      })

    let res = await send(false)
    if (res.status === 401) res = await send(true) // token ditolak → minta token baru sekali

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new GoogleApiError(res.status, data?.error?.message || res.statusText, data?.error)
    }
    return res.status === 204 ? null : res.json()
  }

  return {
    /** Buat spreadsheet baru dengan tab yang ditentukan */
    createSpreadsheet: ({ title, tabs }) =>
      request(SHEETS_BASE, {
        method: 'POST',
        body: {
          properties: { title, timeZone: 'Asia/Jakarta' },
          sheets: tabs.map((name, index) => ({
            properties: { title: name, index, gridProperties: { frozenRowCount: 1 } },
          })),
        },
      }),

    /** true / false; error jaringan dan error lain tetap dilempar */
    async spreadsheetExists(id) {
      try {
        await request(`${SHEETS_BASE}/${id}?fields=spreadsheetId`)
        return true
      } catch (e) {
        if (e instanceof GoogleApiError && (e.status === 404 || e.status === 403)) return false
        throw e
      }
    },

    /** Cari spreadsheet buatan aplikasi ini lewat nama (butuh Drive API aktif) */
    async findSpreadsheetByName(name) {
      const q = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
      const params = new URLSearchParams({ q, fields: 'files(id,name)', orderBy: 'createdTime', pageSize: '1' })
      try {
        const data = await request(`${DRIVE_BASE}?${params}`)
        return data.files?.[0]?.id ?? null
      } catch (e) {
        if (e instanceof GoogleApiError && e.status === 403) {
          console.warn('[FinFlow] Drive API belum aktif / tidak diizinkan, lewati pencarian file.')
          return null
        }
        throw e
      }
    },

    async getValues(id, range) {
      const url = `${SHEETS_BASE}/${id}/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`
      return (await request(url)).values ?? []
    },

    batchUpdateValues: (id, data) =>
      request(`${SHEETS_BASE}/${id}/values:batchUpdate`, {
        method: 'POST',
        body: { valueInputOption: 'RAW', data },
      }),

    appendValues: (id, range, values) =>
      request(
        `${SHEETS_BASE}/${id}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        { method: 'POST', body: { values } },
      ),

        /** Peta { namaTab: sheetId numerik }, dibutuhkan untuk menghapus baris */
    async getSheetIds(id) {
      const data = await request(`${SHEETS_BASE}/${id}?fields=sheets.properties(sheetId,title)`)
      return Object.fromEntries((data.sheets ?? []).map((s) => [s.properties.title, s.properties.sheetId]))
    },

    updateValues: (id, range, values) =>
      request(`${SHEETS_BASE}/${id}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
        method: 'PUT',
        body: { values },
      }),

    /** startIndex berbasis 0 (inklusif), endIndex eksklusif */
    deleteRows: (id, sheetId, startIndex, endIndex) =>
      request(`${SHEETS_BASE}/${id}:batchUpdate`, {
        method: 'POST',
        body: {
          requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex, endIndex } } }],
        },
      }),

    addSheet: (id, title) =>
      request(`${SHEETS_BASE}/${id}:batchUpdate`, {
        method: 'POST',
        body: {
          requests: [{ addSheet: { properties: { title, gridProperties: { frozenRowCount: 1 } } } }],
        },
      }),
  }
}