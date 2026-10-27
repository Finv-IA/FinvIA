const tlv = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixCode({ key, name, city, amount, txid = '***' }) {
  const account = tlv('00', 'br.gov.bcb.pix') + tlv('01', key);
  const payload =
    tlv('00', '01') +
    tlv('26', account) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (amount ? tlv('54', Number(amount).toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', name.substring(0, 25).toUpperCase()) +
    tlv('60', city.substring(0, 15).toUpperCase()) +
    tlv('62', tlv('05', txid)) +
    '6304';
  return payload + crc16(payload);
}