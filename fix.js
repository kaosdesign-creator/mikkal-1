const fs = require('fs')
const path = require('path')

const filePath = path.join('C:\\Users\\bthey\\downloads\\mikkal-v1\\mikkal\\components\\images\\ImagesInterface.tsx')

let content = fs.readFileSync(filePath, 'utf8')

const oldGrid = `              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {WHAT_NEXT(img).map((opt, i) => (
                  <button key={i} onClick={opt.onClick} style={{ padding: '14px 16px', border: 'none', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', borderRight: i % 2 === 0 ? '1px solid #f0f0f0' : 'none', background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <opt.icon size={15} color={opt.iconColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {tweakId === img.id && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={tweakText}
                    onChange={e => setTweakText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTweak(img)}
                    placeholder="What would you like to change? e.g. make the lighting warmer..."
                    style={{ flex: 1, padding: '8px 14px', borderRadius: 999, border: '1px solid #e5e5e5', fontSize: 13, background: 'white', color: '#111', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                  />
                  <button onClick={() => handleTweak(img)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowUp size={15} color="white" />
                  </button>
                </div>
              )}

              <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center', background: tweakId === img.id ? 'white' : '#fafafa' }}>`

const newGrid = `              <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa' }}>`

content = content.replace(oldGrid, newGrid)

fs.writeFileSync(filePath, content, 'utf8')
console.log('Done! Preset buttons removed, just the text input remains.')