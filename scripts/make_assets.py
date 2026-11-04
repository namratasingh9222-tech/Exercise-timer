"""Generates bell.wav, beep.wav and icon.png with only the standard library."""
import math, os, struct, wave, zlib

OUT = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(OUT, exist_ok=True)
RATE = 22050


def write_wav(name, samples):
    with wave.open(os.path.join(OUT, name), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32000)) for s in samples))


def bell():
    dur = 1.6
    partials = [(660, 1.0, 3.0), (1320, 0.6, 4.5), (1980, 0.35, 6.0), (2640, 0.2, 8.0)]
    out = []
    for i in range(int(RATE * dur)):
        t = i / RATE
        v = sum(a * math.exp(-d * t) * math.sin(2 * math.pi * f * t) for f, a, d in partials)
        attack = min(1.0, t / 0.004)
        out.append(0.45 * v * attack)
    return out


def beep():
    dur = 0.18
    out = []
    for i in range(int(RATE * dur)):
        t = i / RATE
        env = min(1.0, t / 0.005) * min(1.0, (dur - t) / 0.03)
        out.append(0.6 * env * math.sin(2 * math.pi * 880 * t))
    return out


def icon(size=1024):
    # dark rounded background, green ring, white timer hand
    bg, ring, fg = (15, 17, 21), (46, 204, 113), (255, 255, 255)
    cx = cy = size / 2
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            d = math.hypot(x - cx, y - cy)
            c = bg
            if size * 0.30 <= d <= size * 0.38:
                c = ring
            # hand pointing up
            if abs(x - cx) < size * 0.018 and cy - size * 0.24 <= y <= cy + size * 0.02:
                c = fg
            # top button
            if abs(x - cx) < size * 0.05 and size * 0.08 <= y <= size * 0.14:
                c = ring
            row += bytes(c)
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(os.path.join(OUT, "icon.png"), "wb") as f:
        f.write(png)


write_wav("bell.wav", bell())
write_wav("beep.wav", beep())
icon()
print("assets written to", os.path.abspath(OUT))
