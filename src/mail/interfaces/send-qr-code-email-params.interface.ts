import { UrlTableTuple } from './url-table-tuple.interface'

export interface SendQrCodeEmailParams {
  name: string
  menu: string
  email: string
  urlTableTuples: UrlTableTuple[]
}
