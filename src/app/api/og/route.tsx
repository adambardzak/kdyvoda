import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(to bottom right, #87CEEB, #1E90FF)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Sun */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '100px',
            width: '200px',
            height: '200px',
            background: '#FFD700',
            borderRadius: '50%',
            border: '8px solid #FFA500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Sun rays */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '20px',
                height: '40px',
                background: '#FFD700',
                border: '6px solid #FFA500',
                transform: `rotate(${i * 30}deg) translateY(-120px)`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            />
          ))}
          {/* Smiley face */}
          <div
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#000',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#000',
                  borderRadius: '50%',
                }}
              />
            </div>
            <div
              style={{
                width: '40px',
                height: '20px',
                borderBottom: '4px solid #000',
                borderRadius: '50%',
              }}
            />
          </div>
        </div>

        {/* River */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            width: '100%',
            height: '200px',
            background: '#4A90E2',
            clipPath: 'path("M0,200 Q300,150 600,200 Q900,250 1200,200 L1200,400 L0,400 Z")',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            width: '100%',
            height: '200px',
            background: '#3478C5',
            opacity: '0.5',
            clipPath: 'path("M0,250 Q300,200 600,250 Q900,300 1200,250 L1200,400 L0,400 Z")',
          }}
        />

        {/* Boats */}
        <div
          style={{
            position: 'absolute',
            bottom: '150px',
            left: '400px',
            width: '180px',
            height: '60px',
            background: '#8B4513',
            clipPath: 'path("M20,50 C20,50 40,60 100,60 C160,60 180,50 180,50 L170,40 C170,40 140,30 100,30 C60,30 30,40 30,40 Z")',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '80px',
              width: '20px',
              height: '20px',
              background: '#FDB797',
              borderRadius: '50%',
              border: '2px solid #000',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '140px',
            left: '600px',
            width: '180px',
            height: '60px',
            background: '#8B4513',
            clipPath: 'path("M20,50 C20,50 40,60 100,60 C160,60 180,50 180,50 L170,40 C170,40 140,30 100,30 C60,30 30,40 30,40 Z")',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '80px',
              width: '20px',
              height: '20px',
              background: '#FDB797',
              borderRadius: '50%',
              border: '2px solid #000',
            }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            KdyVoda
          </h1>
          <h2
            style={{
              fontSize: '36px',
              margin: 0,
            }}
          >
            Vodácký Plánovač Eventu
          </h2>
          <p
            style={{
              fontSize: '24px',
              margin: 0,
            }}
          >
            Naplánuj si vodáckou akci s kámošema bez streamů
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
} 