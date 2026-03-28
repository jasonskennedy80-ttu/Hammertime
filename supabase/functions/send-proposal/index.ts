import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const body = await req.json()
    const { to, subject, message, project, company, validUntil } = body

    if (!to || !subject || !project) {
      return json({ error: 'Missing required fields: to, subject, project' }, 400)
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      return json({ error: 'Email service not configured. Add RESEND_API_KEY to Supabase secrets.' }, 500)
    }

    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
    const fromName = company?.name ?? 'Hammertime'

    const html = buildEmailHtml({ project, company, message, validUntil })

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject,
        html,
      }),
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      console.error('Resend error:', resendData)
      return json({ error: resendData.message ?? 'Failed to send email' }, 500)
    }

    return json({ success: true, id: resendData.id })
  } catch (err) {
    console.error('Edge function error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ─── HTML Email Builder ───────────────────────────────────────────────────────

function buildEmailHtml({ project, company, message, validUntil }: {
  project: Record<string, any>
  company: Record<string, any>
  message?: string
  validUntil: string
}) {
  const customer = project.customer ?? {}
  const scopeSections: any[] = project.scope_sections ?? []
  const lineItems: any[] = project.line_items ?? []
  const paymentSchedule: any[] = project.payment_schedule ?? []

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)

  const fmtDate = (d: string | null) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return d }
  }

  const fmtPhone = (p: string | null) => {
    if (!p) return ''
    const digits = p.replace(/\D/g, '')
    if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    return p
  }

  const companyPhone = company?.phone ? fmtPhone(company.phone) : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(project.name ?? 'Proposal')}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header -->
      <tr>
        <td style="background:#0f172a;padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">${escHtml(company?.name ?? 'Hammertime')}</p>
                ${company?.tagline ? `<p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">${escHtml(company.tagline)}</p>` : ''}
                ${companyPhone ? `<p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">${escHtml(companyPhone)}</p>` : ''}
                ${company?.email ? `<p style="margin:2px 0 0;font-size:13px;color:#94a3b8;">${escHtml(company.email)}</p>` : ''}
                ${company?.license ? `<p style="margin:2px 0 0;font-size:13px;color:#94a3b8;">License: ${escHtml(company.license)}</p>` : ''}
              </td>
              <td align="right" style="vertical-align:top;">
                <p style="margin:0;font-size:24px;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:2px;">Proposal</p>
                <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Valid until: ${escHtml(validUntil)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Personal message -->
      ${message ? `
      <tr>
        <td style="padding:24px 32px 0;">
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${escHtml(message)}</p>
        </td>
      </tr>` : ''}

      <!-- Prepared For / Project Info -->
      <tr>
        <td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="vertical-align:top;padding-right:16px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Prepared For</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${escHtml(customer.first_name ?? '')} ${escHtml(customer.last_name ?? '')}</p>
                ${customer.company ? `<p style="margin:2px 0 0;font-size:13px;color:#475569;">${escHtml(customer.company)}</p>` : ''}
                ${customer.phone ? `<p style="margin:2px 0 0;font-size:13px;color:#475569;">${escHtml(fmtPhone(customer.phone))}</p>` : ''}
                ${customer.email ? `<p style="margin:2px 0 0;font-size:13px;color:#475569;">${escHtml(customer.email)}</p>` : ''}
              </td>
              <td width="50%" style="vertical-align:top;padding-left:16px;border-left:1px solid #e2e8f0;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Project</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${escHtml(project.name ?? '')}</p>
                ${project.location_address ? `<p style="margin:2px 0 0;font-size:13px;color:#475569;">${escHtml(project.location_address)}</p>` : ''}
                ${project.start_date ? `<p style="margin:4px 0 0;font-size:13px;color:#475569;">Start: ${escHtml(fmtDate(project.start_date))}</p>` : ''}
                ${project.completion_date ? `<p style="margin:2px 0 0;font-size:13px;color:#475569;">Est. Completion: ${escHtml(fmtDate(project.completion_date))}</p>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" /></td></tr>

      <!-- Description -->
      ${project.description ? `
      <tr>
        <td style="padding:20px 32px 0;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Project Overview</p>
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${escHtml(project.description)}</p>
        </td>
      </tr>` : ''}

      <!-- Scope of Work -->
      ${scopeSections.length > 0 ? `
      <tr>
        <td style="padding:20px 32px 0;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Scope of Work</p>
          ${scopeSections.map((s, i) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
            <tr>
              <td style="padding:10px 14px;background:#f8fafc;border-radius:6px;border-left:3px solid #0ea5e9;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">${i + 1}. ${escHtml(s.title ?? '')}</p>
                ${s.description ? `<p style="margin:4px 0 0;font-size:13px;color:#475569;line-height:1.5;">${escHtml(s.description)}</p>` : ''}
              </td>
            </tr>
          </table>`).join('')}
        </td>
      </tr>` : ''}

      <!-- Line Items -->
      ${lineItems.length > 0 ? `
      <tr>
        <td style="padding:20px 32px 0;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Pricing</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr style="border-bottom:2px solid #e2e8f0;">
              <td style="padding:6px 0;font-size:12px;font-weight:600;color:#64748b;">Description</td>
              <td style="padding:6px 0;font-size:12px;font-weight:600;color:#64748b;text-align:right;">Qty</td>
              <td style="padding:6px 0;font-size:12px;font-weight:600;color:#64748b;text-align:right;padding-left:12px;">Unit</td>
              <td style="padding:6px 0;font-size:12px;font-weight:600;color:#64748b;text-align:right;padding-left:12px;">Amount</td>
            </tr>
            ${lineItems.map((item) => `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0;">
                <p style="margin:0;font-size:13px;font-weight:500;color:#0f172a;">${escHtml(item.name ?? '')}</p>
                ${item.description ? `<p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">${escHtml(item.description)}</p>` : ''}
              </td>
              <td style="padding:8px 0;font-size:13px;color:#475569;text-align:right;">${item.quantity ?? 0}</td>
              <td style="padding:8px 0;font-size:13px;color:#475569;text-align:right;padding-left:12px;">${escHtml(item.unit ?? '')}</td>
              <td style="padding:8px 0;font-size:13px;font-weight:500;color:#0f172a;text-align:right;padding-left:12px;">${fmtCurrency(item.total)}</td>
            </tr>`).join('')}
          </table>
          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr><td></td><td width="200">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#475569;">Subtotal</td>
                  <td style="padding:4px 0;font-size:13px;color:#475569;text-align:right;">${fmtCurrency(project.subtotal)}</td>
                </tr>
                ${(project.tax_rate ?? 0) > 0 ? `<tr>
                  <td style="padding:4px 0;font-size:13px;color:#475569;">Tax (${project.tax_rate}%)</td>
                  <td style="padding:4px 0;font-size:13px;color:#475569;text-align:right;">${fmtCurrency(project.tax_amount)}</td>
                </tr>` : ''}
                ${(project.discount_amount ?? 0) > 0 ? `<tr>
                  <td style="padding:4px 0;font-size:13px;color:#16a34a;">Discount</td>
                  <td style="padding:4px 0;font-size:13px;color:#16a34a;text-align:right;">-${fmtCurrency(project.discount_amount)}</td>
                </tr>` : ''}
                <tr style="border-top:2px solid #e2e8f0;">
                  <td style="padding:8px 0 4px;font-size:15px;font-weight:700;color:#0f172a;">Total</td>
                  <td style="padding:8px 0 4px;font-size:15px;font-weight:700;color:#0f172a;text-align:right;">${fmtCurrency(project.total)}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td>
      </tr>` : ''}

      <!-- Payment Schedule -->
      ${paymentSchedule.length > 0 ? `
      <tr>
        <td style="padding:20px 32px 0;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Payment Schedule</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden;">
            ${paymentSchedule.map((item, i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#64748b;width:24px;">${i + 1}.</td>
              <td style="padding:10px 14px;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">${escHtml(item.label ?? '')}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${escHtml(item.due_trigger ?? '')}</p>
              </td>
              <td style="padding:10px 14px;font-size:14px;font-weight:700;color:#0f172a;text-align:right;white-space:nowrap;">${fmtCurrency(item.amount)}</td>
            </tr>`).join('')}
            <tr style="background:#0f172a;">
              <td colspan="2" style="padding:10px 14px;font-size:13px;font-weight:600;color:#ffffff;">Total</td>
              <td style="padding:10px 14px;font-size:14px;font-weight:700;color:#38bdf8;text-align:right;">${fmtCurrency(paymentSchedule.reduce((s: number, i: any) => s + (i.amount ?? 0), 0))}</td>
            </tr>
          </table>
        </td>
      </tr>` : ''}

      <!-- Customer Notes -->
      ${project.customer_notes ? `
      <tr>
        <td style="padding:20px 32px 0;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Notes</p>
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${escHtml(project.customer_notes)}</p>
        </td>
      </tr>` : ''}

      <!-- Terms -->
      <tr>
        <td style="padding:20px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#475569;">Terms &amp; Conditions</p>
                <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">This proposal is valid until ${escHtml(validUntil)}. Work will begin upon receipt of the acceptance draw and signed agreement. All materials remain the property of the contractor until paid in full. Any changes to the scope of work must be agreed upon in writing prior to execution.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 32px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">Thank you for the opportunity to earn your business.</p>
          ${company?.phone ? `<p style="margin:6px 0 0;font-size:13px;color:#64748b;font-weight:500;">${escHtml(companyPhone)} &nbsp;·&nbsp; ${escHtml(company?.name ?? '')}</p>` : ''}
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br />')
}
