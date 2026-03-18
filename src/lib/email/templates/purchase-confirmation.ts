// src/lib/email/templates/purchase-confirmation.ts

interface PurchaseEmailProps {
  buyerName:     string | null;
  bookTitleEs:   string;
  bookTitleEn:   string;
  bookCoverUrl:  string;
  authorName:    string;
  downloadToken: string;
  hasPdf:        boolean;
  hasEpub:       boolean;
  locale:        'es' | 'en';
  appUrl:        string;
  currency:      string;
  amount:        string;
}

export function purchaseConfirmationEmail(props: PurchaseEmailProps): {
  subject: string;
  html:    string;
  text:    string;
} {
  const {
    buyerName, bookTitleEs, bookTitleEn, bookCoverUrl, authorName,
    downloadToken, hasPdf, hasEpub, locale, appUrl, currency, amount,
  } = props;

  const isEs      = locale === 'es';
  const bookTitle = isEs ? bookTitleEs : bookTitleEn;
  const name      = buyerName ? (isEs ? `Hola, ${buyerName}` : `Hi, ${buyerName}`) : (isEs ? 'Hola' : 'Hi there');

  const pdfUrl  = `${appUrl}/api/download/${downloadToken}?format=pdf`;
  const epubUrl = `${appUrl}/api/download/${downloadToken}?format=epub`;

  const subject = isEs
    ? `Tu libro está listo: ${bookTitle}`
    : `Your book is ready: ${bookTitle}`;

  const expiryText = isEs
    ? 'Este enlace es válido por 7 días.'
    : 'This link is valid for 7 days.';

  const downloadBtnText = isEs ? 'Descargar mi libro' : 'Download my book';
  const thankYouText    = isEs
    ? 'Gracias por tu compra'
    : 'Thank you for your purchase';
  const orderText = isEs ? 'Resumen de tu pedido' : 'Order summary';
  const bookText  = isEs ? 'Libro' : 'Book';
  const totalText = isEs ? 'Total' : 'Total';
  const bodyText  = isEs
    ? `Tu compra fue procesada exitosamente. Puedes descargar <strong>${bookTitle}</strong> usando el botón de abajo.`
    : `Your purchase was processed successfully. You can download <strong>${bookTitle}</strong> using the button below.`;
  const supportText = isEs
    ? `Si tienes algún problema, responde este email y te ayudaremos de inmediato.`
    : `If you have any issues, reply to this email and we will help you immediately.`;

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f5f0e8;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#8098fa;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">Andrew Myer</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">${bookTitle}</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.55);font-size:13px;">${authorName}</p>
            </td>
          </tr>

          <!-- Book cover + success icon -->
          <tr>
            <td style="background-color:#1a1a2e;padding:0 40px 32px;text-align:center;">
              <div style="display:inline-block;position:relative;">
                <img src="${bookCoverUrl}"
                  alt="${bookTitle}"
                  width="120"
                  style="width:120px;height:auto;border-radius:8px;box-shadow:4px 4px 16px rgba(0,0,0,0.4);display:block;margin:0 auto;" />
              </div>
            </td>
          </tr>

          <!-- Success badge -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <div style="display:inline-block;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:24px;padding:8px 20px;margin-bottom:4px;">
                <span style="color:#15803d;font-size:13px;font-weight:600;">✓ ${thankYouText}</span>
              </div>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <p style="margin:0;color:#4a4a6a;font-size:15px;line-height:1.7;">${name}. ${bodyText}</p>
            </td>
          </tr>

          <!-- Download button(s) -->
          <tr>
            <td style="padding:28px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  ${hasPdf ? `
                  <td align="center" style="padding:0 ${hasEpub ? '6px' : '0'} 0 0;">
                    <a href="${pdfUrl}"
                      style="display:block;background-color:#4a52ea;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;text-align:center;">
                      📄 ${downloadBtnText} — PDF
                    </a>
                  </td>` : ''}
                  ${hasEpub ? `
                  <td align="center" style="padding:0 0 0 ${hasPdf ? '6px' : '0'};">
                    <a href="${epubUrl}"
                      style="display:block;background-color:#ffffff;color:#4a52ea;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;border:2px solid #4a52ea;text-align:center;">
                      📱 ${downloadBtnText} — EPUB
                    </a>
                  </td>` : ''}
                </tr>
              </table>
              <p style="margin:12px 0 0;text-align:center;color:#9ca3af;font-size:12px;">${expiryText}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #f0ede6;margin:0;" /></td></tr>

          <!-- Order summary -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">${orderText}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="background-color:#faf8f4;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f0ede6;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;">${bookText}</td>
                        <td style="color:#1a1a2e;font-size:13px;font-weight:600;text-align:right;">${bookTitle}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="color:#1a1a2e;font-size:14px;font-weight:700;">${totalText}</td>
                        <td style="color:#4a52ea;font-size:16px;font-weight:700;text-align:right;">
                          ${new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
                            style: 'currency', currency,
                          }).format(parseFloat(amount))}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #f0ede6;margin:0;" /></td></tr>

          <!-- Support -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">${supportText}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf8f4;padding:20px 40px;text-align:center;border-top:1px solid #f0ede6;">
              <p style="margin:0;color:#c4c0b8;font-size:12px;">
                © ${new Date().getFullYear()} Andrew Myer. ${isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
              </p>
              <p style="margin:6px 0 0;color:#c4c0b8;font-size:12px;">
                <a href="${appUrl}/${locale}/libros" style="color:#9ca3af;text-decoration:none;">
                  ${isEs ? 'Ver todos los libros' : 'Browse all books'}
                </a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Container -->

      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain text fallback
  const text = isEs
    ? `${name}!\n\nGracias por tu compra de "${bookTitle}".\n\nTu libro está listo para descargar:\n${hasPdf  ? `PDF:  ${pdfUrl}\n`  : ''}${hasEpub ? `EPUB: ${epubUrl}\n` : ''}\n${expiryText}\n\nTotal: ${amount} ${currency}\n\n${supportText}\n\n© ${new Date().getFullYear()} Andrew Myer`
    : `${name}!\n\nThank you for purchasing "${bookTitle}".\n\nYour book is ready to download:\n${hasPdf  ? `PDF:  ${pdfUrl}\n`  : ''}${hasEpub ? `EPUB: ${epubUrl}\n` : ''}\n${expiryText}\n\nTotal: ${amount} ${currency}\n\n${supportText}\n\n© ${new Date().getFullYear()} Andrew Myer`;

  return { subject, html, text };
}
