import type { Order } from '../api/orders';

const fmt = (v: string | number) =>
  Number(v || 0).toLocaleString('ru-RU', { minimumFractionDigits: 0 });

const escape = (s: string | number | null | undefined) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const getShopName = () =>
  (typeof localStorage !== 'undefined' && localStorage.getItem('activeShopName')) || 'PRIME LIGHTING';

/** Open a printer-friendly window (80mm thermal cheque) and print the order. */
export function printOrderReceipt(order: Order, opts?: { shopName?: string }): void {
  const shopName = opts?.shopName || getShopName();

  const subtotal = Number(order.subtotal || 0);
  const taxAmount = Number(order.taxAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const total = Number(order.total || 0);
  const paidByCash = Number(order.paidByCash || 0);
  const paidByCard = Number(order.paidByCard || 0);
  const notPaid = Number(order.notPaid || 0);
  const paidTotal = paidByCash + paidByCard;
  const change = Math.max(0, paidTotal - (total - notPaid));

  const w = window.open('', '_blank', 'width=320,height=640');
  if (!w) return;

  const itemsHtml = (order.items ?? [])
    .map((i, idx) => `
      <div class="item">
        <div class="item-row">
          <span class="item-name">${idx + 1}. ${escape(i.name)}</span>
        </div>
        <div class="item-row">
          <span class="item-calc">${fmt(i.price)} × ${i.quantity}</span>
          <span class="item-total">${fmt(i.lineTotal)}</span>
        </div>
      </div>
    `)
    .join('');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Chek ${escape(order.orderNumber)}</title>
    <style>
      @page { size: 80mm auto; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        width: 72mm;
        padding: 4mm 3mm;
        font-family: 'Courier New', ui-monospace, Menlo, monospace;
        font-size: 12px;
        color: #000;
        line-height: 1.35;
      }
      .center  { text-align: center; }
      .right   { text-align: right; }
      .bold    { font-weight: 700; }
      .muted   { color: #444; }
      .shop    { font-size: 16px; font-weight: 800; letter-spacing: 1px; }
      .sub     { font-size: 11px; margin-top: 2px; }
      .sep     { border-top: 1px dashed #000; margin: 6px 0; }
      .meta    { font-size: 11px; }
      .meta-row{ display: flex; justify-content: space-between; gap: 8px; }
      .item    { margin: 4px 0; }
      .item-row{ display: flex; justify-content: space-between; gap: 8px; }
      .item-name { font-weight: 700; }
      .item-calc { color: #222; }
      .item-total{ font-weight: 700; }
      .totals  { font-size: 12px; }
      .total-row { display: flex; justify-content: space-between; gap: 8px; padding: 1px 0; }
      .grand   { font-size: 15px; font-weight: 800; padding: 4px 0; }
      .pay     { font-size: 11px; }
      .footer  { font-size: 11px; margin-top: 8px; }
      .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 22px; text-align: center; letter-spacing: 1px; margin-top: 6px; }
    </style>
  </head>
  <body>
    <div class="center shop">${escape(shopName)}</div>
    <div class="center sub muted">Kassa cheki</div>

    <div class="sep"></div>

    <div class="meta">
      <div class="meta-row"><span>Buyurtma:</span><span class="bold">${escape(order.orderNumber)}</span></div>
      <div class="meta-row"><span>Sana:</span><span>${escape(formatDate(order.createdAt))}</span></div>
      ${order.cashier?.name ? `<div class="meta-row"><span>Kassir:</span><span>${escape(order.cashier.name)}</span></div>` : ''}
      ${order.customer?.name ? `<div class="meta-row"><span>Mijoz:</span><span>${escape(order.customer.name)}</span></div>` : ''}
    </div>

    <div class="sep"></div>

    ${itemsHtml}

    <div class="sep"></div>

    <div class="totals">
      <div class="total-row"><span>Oraliq summa</span><span>${fmt(subtotal)}</span></div>
      ${taxAmount > 0 ? `<div class="total-row"><span>Soliq</span><span>${fmt(taxAmount)}</span></div>` : ''}
      ${discountAmount > 0 ? `<div class="total-row"><span>Chegirma</span><span>−${fmt(discountAmount)}</span></div>` : ''}
    </div>

    <div class="sep"></div>

    <div class="total-row grand">
      <span>JAMI</span><span>${fmt(total)} UZS</span>
    </div>

    <div class="sep"></div>

    <div class="pay">
      ${paidByCash > 0 ? `<div class="total-row"><span>Naqd</span><span>${fmt(paidByCash)}</span></div>` : ''}
      ${paidByCard > 0 ? `<div class="total-row"><span>Karta</span><span>${fmt(paidByCard)}</span></div>` : ''}
      ${notPaid > 0 ? `<div class="total-row"><span>Nasiya</span><span>${fmt(notPaid)}</span></div>` : ''}
      ${change > 0 ? `<div class="total-row bold"><span>Qaytim</span><span>${fmt(change)}</span></div>` : ''}
    </div>

    <div class="sep"></div>

    <div class="center footer">
      Xaridingiz uchun rahmat!<br/>
      Yana tashrif buyuring :)
    </div>

    <div class="center footer muted" style="margin-top:6px">
      ${escape(shopName)} · Prime Lighting POS
    </div>

    <script>
      window.onload = function () {
        try { window.focus(); window.print(); } catch (e) {}
        setTimeout(function () { window.close(); }, 400);
      };
    </script>
  </body>
</html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
}
