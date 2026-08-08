import os
import sys
import math
from PIL import Image, ImageDraw, ImageFilter, ImageChops

# Try to import cv2 for video processing, if not present we will install it
try:
    import cv2
except ImportError:
    print("cv2 not installed.")

def get_cropped_resized(img, center, zoom, target_size):
    W, H = img.size
    cx, cy = center
    
    crop_w = W / zoom
    crop_h = H / zoom
    
    crop_w = min(crop_w, W)
    crop_h = min(crop_h, H)
    
    left = max(0, cx - crop_w / 2)
    top = max(0, cy - crop_h / 2)
    right = min(W, left + crop_w)
    bottom = min(H, top + crop_h)
    
    if right == W:
        left = W - crop_w
    if bottom == H:
        top = H - crop_h
        
    crop_box = (int(left), int(top), int(right), int(bottom))
    cropped = img.crop(crop_box)
    return cropped.resize(target_size, Image.Resampling.LANCZOS)

def draw_star(draw, x, y, size, color):
    draw.line((x, y - size, x, y + size), fill=color, width=2)
    draw.line((x - size, y, x + size, y), fill=color, width=2)
    d_size = int(size * 0.5)
    draw.line((x - d_size, y - d_size, x + d_size, y + d_size), fill=color, width=1)
    draw.line((x + d_size, y - d_size, x - d_size, y + d_size), fill=color, width=1)

def draw_elegant_swan(draw, x, y, scale=1.0, flip=False, ripple_idx=0):
    rx = 16 * scale
    ry = 8 * scale
    draw.ellipse((x - rx, y - ry, x + rx, y + ry), fill=(255, 255, 255, 220))
    
    nx = x - 10 * scale if not flip else x + 10 * scale
    ny = y - 14 * scale
    draw.line((x, y, nx, ny), fill=(255, 255, 255, 220), width=int(4 * scale))
    draw.ellipse((nx - 4*scale, ny - 4*scale, nx + 4*scale, ny + 4*scale), fill=(255, 255, 255, 220))
    
    bx = nx - 7 * scale if not flip else nx + 7 * scale
    draw.line((nx, ny, bx, ny + 2*scale), fill=(244, 63, 94, 255), width=int(2 * scale))
    
    for r_idx in range(2):
        r = ((ripple_idx * 0.5 + r_idx * 15) % 30) * scale
        alpha = int((1.0 - r / (30 * scale)) * 80)
        draw.ellipse((x - rx - r, y + ry/2 - r*0.4, x + rx + r, y + ry/2 + r*0.4), 
                     outline=(216, 180, 254, alpha), width=1)

def draw_swan_trail(draw, sx, sy, index, scale=1.0, flip=False):
    for t_idx in range(5):
        lag = (t_idx + 1) * 7
        sparkle_x = sx + lag*scale if not flip else sx - lag*scale
        sparkle_y = sy + int(3 * math.sin(index * 0.2 - t_idx) * scale)
        alpha = int((1.0 - t_idx / 5) * 140 * (0.4 + 0.6 * math.sin(index * 0.25 - t_idx)))
        if alpha > 10:
            draw.ellipse((sparkle_x - 2, sparkle_y - 2, sparkle_x + 2, sparkle_y + 2), fill=(255, 255, 255, alpha))

def draw_person_silhouette(draw, x, y, scale=1.0, color=(253, 224, 71, 200)):
    r_head = 4 * scale
    draw.ellipse((x - r_head, y - 16*scale - r_head, x + r_head, y - 16*scale + r_head), fill=color)
    draw.polygon([
        (x, y - 16*scale), 
        (x - 7*scale, y), 
        (x + 7*scale, y)
    ], fill=color)

def draw_falling_petals(draw, index, W, H):
    for p_idx in range(18):
        px = (W * (0.05 * p_idx + 0.04) + 30 * math.sin(index * 0.05 + p_idx)) % W
        py = (index * 2.0 + p_idx * 65) % (H + 40) - 20
        size_w = 6 + (p_idx % 4)
        size_h = 4 + (p_idx % 3)
        draw.ellipse((px - size_w - 1, py - size_h - 1, px + size_w + 1, py + size_h + 1), fill=(255, 141, 161, 40))
        draw.ellipse((px - size_w, py - size_h, px + size_w, py + size_h), fill=(255, 182, 193, 210))

def draw_flying_bird(draw, x, y, index, scale=1.0):
    flap = math.sin(index * 0.4)
    w_offset = int(7 * scale)
    h_offset = int(5 * scale * flap)
    draw.line((x, y, x - w_offset, y - h_offset), fill=(255, 255, 255, 200), width=int(2 * scale))
    draw.line((x, y, x + w_offset, y - h_offset), fill=(255, 255, 255, 200), width=int(2 * scale))

def draw_water_shimmer(draw, index, W, H):
    for s_idx in range(20):
        sx = (W * (0.1 + 0.04 * s_idx) + 20 * math.sin(index * 0.04 + s_idx)) % W
        sy = H * (0.75 + 0.01 * (s_idx % 6))
        alpha = int(120 + 135 * math.sin(index * 0.25 + s_idx))
        if alpha > 30:
            draw.ellipse((sx - 3, sy - 1, sx + 3, sy + 1), fill=(255, 255, 255, alpha))

def draw_fountain_spray(draw, index, cx, cy, scale=1.0):
    for p_idx in range(30):
        angle = -math.pi / 2 + (p_idx - 15) * 0.07
        speed = 5.0 + 3.5 * math.sin(p_idx * 1.8)
        t = (index * 0.3 + p_idx) % 15
        
        px = cx + speed * math.cos(angle) * t * scale
        py = cy + speed * math.sin(angle) * t * scale + 0.22 * (t ** 2) * scale
        
        if py < cy + 18:
            alpha = int((1.0 - t / 15) * 240)
            draw.ellipse((px - 2, py - 2, px + 2, py + 2), fill=(216, 180, 254, alpha))
            if t > 5 and t < 11:
                draw.ellipse((px - 3, py - 3, px + 3, py + 3), fill=(255, 255, 255, int(alpha * 0.6)))

def draw_fountain_splash_ripples(draw, index, cx, cy, scale=1.0):
    for r_idx in range(3):
        r = ((index * 0.35 + r_idx * 8) % 18) * scale
        alpha = int((1.0 - r / (18 * scale)) * 80)
        draw.ellipse((cx - r * 1.6, cy - r * 0.4, cx + r * 1.6, cy + r * 0.4), 
                     outline=(216, 180, 254, alpha), width=1)

def draw_god_rays(draw, index, W, H):
    offset = 50 * math.sin(index * 0.015)
    for r_idx in range(4):
        rx = W * (0.15 + 0.22 * r_idx) + offset
        draw.polygon([
            (rx - 50, 0),
            (rx + 50, 0),
            (rx + 180, H),
            (rx + 80, H)
        ], fill=(255, 255, 255, 8))

def draw_shooting_stars(draw, index, W, H):
    for ss_idx in range(3):
        t = (index * 1.0 + ss_idx * 50) % 200
        if t < 20:
            sx = W * (0.15 + 0.3 * ss_idx) + t * 18
            sy = H * 0.08 + t * 9
            length = int(t * 2.5)
            draw.line((sx, sy, sx - length, sy - length * 0.5), 
                      fill=(255, 255, 255, int(255 * (1.0 - t/20))), width=2)

def draw_mist(draw, index, W, H):
    for m_idx in range(5):
        mx = (W * 0.05 + W * 0.22 * m_idx + index * 1.3) % (W + 250) - 125
        my = H * (0.69 + 0.02 * math.sin(index * 0.025 + m_idx))
        rw = 150
        rh = 28
        draw.ellipse((mx - rw, my - rh, mx + rw, my + rh), fill=(243, 223, 162, 10))
        draw.ellipse((mx - rw*0.75, my - rh*0.75, mx + rw*0.75, my + rh*0.75), fill=(216, 180, 254, 8))

def draw_fairy(draw, index, f_idx, W, H, phase):
    if phase == 1:
        cx, cy = W * 0.2, H * 0.6
    elif phase == 2:
        cx, cy = W * 0.7, H * 0.65
    else:
        cx, cy = W * 0.35, H * 0.55
        
    fx = cx + 90 * math.sin(index * 0.05 + f_idx * 1.4)
    fy = cy + 45 * math.cos(index * 0.08 + f_idx * 2.3)
    
    alpha = int(140 + 115 * math.sin(index * 0.12 + f_idx))
    draw.ellipse((fx - 2, fy - 2, fx + 2, fy + 2), fill=(255, 255, 255, alpha))
    r_glow = 7
    color = (255, 141, 161, int(alpha * 0.25)) if f_idx % 2 == 0 else (253, 224, 71, int(alpha * 0.25))
    draw.ellipse((fx - r_glow, fy - r_glow, fx + r_glow, fy + r_glow), fill=color)

def draw_stardust_wind(draw, index, W, H):
    for s_idx in range(30):
        speed = 2.0 + (s_idx % 3)
        sx = (W * 0.033 * s_idx - index * speed) % (W + 40) - 20
        sy = (H * 0.033 * s_idx + 12 * math.sin(index * 0.015 + s_idx)) % H
        alpha = int(90 + 90 * math.sin(index * 0.04 + s_idx))
        draw.ellipse((sx - 1, sy - 1, sx + 1, sy + 1), fill=(255, 255, 255, alpha))

def draw_chandelier(draw, cx, cy, index, scale=1.0):
    draw.line((cx, 0, cx, cy), fill=(223, 186, 107, 180), width=int(3 * scale))
    for tier in range(1, 4):
        w_radius = tier * 35 * scale
        h_radius = tier * 14 * scale
        box = (cx - w_radius, cy - h_radius, cx + w_radius, cy + h_radius)
        draw.arc(box, 0, 180, fill=(223, 186, 107, 200), width=int(2 * scale))
        
        num_drops = tier * 3
        for d in range(num_drops + 1):
            angle = math.pi * (d / num_drops)
            dx = cx + w_radius * math.cos(angle)
            dy = cy + h_radius * math.sin(angle)
            c_alpha = int(140 + 115 * math.sin(index * 0.15 + d * 1.5))
            draw.line((dx, dy, dx, dy + 10*scale), fill=(255, 255, 255, c_alpha), width=1)
            draw.ellipse((dx - 2, dy + 10*scale - 2, dx + 2, dy + 10*scale + 2), fill=(255, 255, 255, c_alpha))
            
    c_glow = int(130 + 60 * math.sin(index * 0.1))
    draw.ellipse((cx - 15*scale, cy - 15*scale, cx + 15*scale, cy + 15*scale), fill=(253, 224, 71, int(c_glow * 0.15)))
    draw.ellipse((cx - 4*scale, cy - 4*scale, cx + 4*scale, cy + 4*scale), fill=(255, 255, 255, c_glow))

def animate_frame_effects(img, index, phase):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    W, H = img.size
    
    draw_stardust_wind(draw, index, W, H)
    
    if phase == 1 or phase == 2:
        draw_mist(draw, index, W, H)
        
    if phase == 1:
        draw_water_shimmer(draw, index, W, H)
        
    if phase == 1 or phase == 2:
        bx1 = (W * 0.1 + index * 1.2) % (W + 50) - 20 # Slowed for 480 frames
        by1 = H * 0.12 + 10 * math.sin(index * 0.02)
        draw_flying_bird(draw, bx1, by1, index, scale=0.7)
        
        bx2 = (W * 0.9 - index * 1.8) % (W + 50) - 20
        by2 = H * 0.08 + 8 * math.cos(index * 0.025)
        draw_flying_bird(draw, bx2, by2, index, scale=0.5)

    if phase == 1:
        t = index / 120.0
        s1_x = W * (0.15 + 0.15 * t)
        s1_y = H * (0.76 + 0.01 * math.sin(index * 0.1))
        draw_swan_trail(draw, s1_x, s1_y, index, scale=0.8, flip=True)
        draw_elegant_swan(draw, s1_x, s1_y, scale=0.8, flip=True, ripple_idx=index)
        
        s2_x = W * (0.80 - 0.12 * t)
        s2_y = H * (0.80 + 0.01 * math.cos(index * 0.08))
        draw_swan_trail(draw, s2_x, s2_y, index, scale=0.9, flip=False)
        draw_elegant_swan(draw, s2_x, s2_y, scale=0.9, flip=False, ripple_idx=index + 10)
        
    if phase == 1 or phase == 2 or phase == 3:
        for f_idx in range(4):
            draw_fairy(draw, index, f_idx, W, H, phase)

    if phase == 1:
        t = index / 120.0
        p1_x = W * (0.32 + 0.12 * t)
        p1_y = H * 0.64
        draw_person_silhouette(draw, p1_x, p1_y, scale=0.6, color=(253, 224, 71, 180))
        p2_x = W * (0.68 - 0.10 * t)
        p2_y = H * 0.65
        draw_person_silhouette(draw, p2_x, p2_y, scale=0.55, color=(255, 141, 161, 180))
        
    elif phase == 2:
        t = (index - 120) / 120.0
        p3_x = W * (0.45 + 0.08 * t)
        p3_y = H * (0.66 - 0.04 * t)
        draw_person_silhouette(draw, p3_x, p3_y, scale=0.9, color=(253, 224, 71, 200))
        p4_x = W * 0.35
        p4_y = H * 0.68
        draw_person_silhouette(draw, p4_x, p4_y, scale=0.85, color=(255, 141, 161, 200))
        
    elif phase == 3:
        t = (index - 240) / 120.0
        p5_x = W * (0.42 + 0.10 * t)
        p5_y = H * (0.66 + 0.02 * math.sin(index * 0.07))
        draw_person_silhouette(draw, p5_x, p5_y, scale=1.1, color=(255, 141, 161, 220))
        p6_x = W * 0.65
        p6_y = H * 0.67
        draw_person_silhouette(draw, p6_x, p6_y, scale=1.0, color=(253, 224, 71, 220))
        
        # Fountain & Chandelier are focal points in Palace Interior (Phase 3)
        fountain_cx = W * 0.52
        fountain_cy = H * 0.56
        draw_fountain_splash_ripples(draw, index, fountain_cx, fountain_cy, scale=1.0)
        draw_fountain_spray(draw, index, fountain_cx, fountain_cy, scale=1.0)
        draw_chandelier(draw, W * 0.52, H * 0.18, index, scale=1.0)
        draw_god_rays(draw, index, W, H)

    if phase == 4:
        # Chandelier drops away as we ascend to the stars
        draw_chandelier(draw, W * 0.52, H * 0.18 - (index - 360) * 5, index, scale=0.8)
        draw_shooting_stars(draw, index, W, H)
        draw_god_rays(draw, index, W, H)

    if phase == 1 or phase == 2:
        pulse = 0.55 + 0.25 * math.sin(index * 0.1)
        gate_cx, gate_cy = W * 0.5, H * 0.4
        r = int(60 + 20 * math.sin(index * 0.07))
        for radius in range(r, 0, -10):
            alpha = int((1.0 - radius/r) * 40 * pulse)
            draw.ellipse((gate_cx - radius, gate_cy - radius, gate_cx + radius, gate_cy + radius), 
                         fill=(216, 180, 254, alpha))
            
    if phase == 2 or phase == 3:
        spire_points = [
            (W * 0.35, H * 0.25),
            (W * 0.50, H * 0.15),
            (W * 0.65, H * 0.25)
        ]
        for idx, (sx, sy) in enumerate(spire_points):
            star_size = int(12 + 8 * math.sin(index * 0.12 + idx))
            alpha = int(180 + 75 * math.sin(index * 0.12 + idx))
            draw_star(draw, sx, sy, star_size, (253, 224, 71, alpha))
            
            halo_r = int(20 + 8 * math.cos(index * 0.05 + idx))
            draw.ellipse((sx - halo_r, sy - halo_r, sx + halo_r, sy + halo_r), 
                         outline=(253, 224, 71, int(45 * (1.0 - halo_r/28))), width=1)
            
    if phase == 3 or phase == 4:
        for b_idx in range(6):
            bx = (W * (0.2 + 0.12 * b_idx) + 40 * math.sin(index * 0.02 + b_idx)) % W
            by = (H * 0.8 - (index * 1.5 + b_idx * 90)) % (H + 40) - 20
            radius = int(15 + 8 * math.sin(index * 0.03 + b_idx))
            draw.ellipse((bx - radius, by - radius, bx + radius, by + radius), 
                         outline=(255, 141, 161, 100), width=2)
            draw.ellipse((bx - radius + 2, by - radius + 2, bx + radius - 2, by + radius - 2), 
                         fill=(255, 255, 255, 25))
            glint_r = radius // 4
            draw.ellipse((bx - radius/2 - glint_r, by - radius/2 - glint_r, bx - radius/2 + glint_r, by - radius/2 + glint_r), 
                         fill=(255, 255, 255, 150))
            
    draw_falling_petals(draw, index, W, H)
        
    final_img = Image.alpha_composite(img.convert("RGBA"), overlay)
    return final_img.convert("RGB")

def compile_video_and_extract_frames():
    assets_dir = r"d:\main\projects\fiction-scroll-world\assets"
    temp_frames_dir = os.path.join(assets_dir, "temp_frames")
    final_frames_dir = os.path.join(assets_dir, "frames")
    video_path = os.path.join(assets_dir, "elysium_walkthrough.mp4")
    
    os.makedirs(temp_frames_dir, exist_ok=True)
    os.makedirs(final_frames_dir, exist_ok=True)
    
    img_paths = [
        r"C:\Users\MY PC\.gemini\antigravity\brain\1e551095-5b69-40de-a54f-f9eecf4b25ac\luxury_princess_world_1786190521889.jpg",
        r"C:\Users\MY PC\.gemini\antigravity\brain\1e551095-5b69-40de-a54f-f9eecf4b25ac\palace_gates_1786190774312.jpg",
        r"C:\Users\MY PC\.gemini\antigravity\brain\1e551095-5b69-40de-a54f-f9eecf4b25ac\palace_interior_1786190789536.jpg",
        r"C:\Users\MY PC\.gemini\antigravity\brain\1e551095-5b69-40de-a54f-f9eecf4b25ac\celestial_sky_1786190805435.jpg"
    ]
    
    for p in img_paths:
        if not os.path.exists(p):
            print(f"Error: Image not found at {p}", file=sys.stderr)
            return
            
    images = [Image.open(p) for p in img_paths]
    sizes = [img.size for img in images]
    print(f"Loaded {len(images)} source images.")
    
    # 240 FRAMES (5 SECONDS PER PHASE AT 12 FPS)
    num_frames = 240
    target_size = (960, 540)
    
    # --- STEP 1: Generate Raw Animated Frames ---
    print(f"Generating {num_frames} raw animated frames with rich visual effects...")
    temp_paths = []
    for i in range(num_frames):
        frames_per_phase = num_frames // 4
        if i < frames_per_phase:
            phase = 1
            t = i / float(frames_per_phase)
            z0 = 1.0 + (2.5 - 1.0) * t
            c0 = (sizes[0][0] * 0.50, sizes[0][1] * 0.40)
            img0_frame = get_cropped_resized(images[0], c0, z0, target_size)
            
            z1 = 1.0 + (1.2 - 1.0) * t
            c1 = (sizes[1][0] * 0.50, sizes[1][1] * 0.50)
            img1_frame = get_cropped_resized(images[1], c1, z1, target_size)
            
            trans_start = int(frames_per_phase * 0.67)
            trans_len = frames_per_phase - trans_start
            alpha = 0.0 if i < trans_start else (i - trans_start) / float(trans_len)
            frame = Image.blend(img0_frame, img1_frame, alpha)
            
        elif i < 2 * frames_per_phase:
            phase = 2
            t = (i - frames_per_phase) / float(frames_per_phase)
            z1 = 1.2 + (2.6 - 1.2) * t
            c1 = (sizes[1][0] * 0.50, sizes[1][1] * 0.50)
            img1_frame = get_cropped_resized(images[1], c1, z1, target_size)
            
            z2 = 0.9 + (1.2 - 0.9) * t
            c2 = (sizes[2][0] * 0.50, sizes[2][1] * 0.50)
            img2_frame = get_cropped_resized(images[2], c2, z2, target_size)
            
            trans_start = frames_per_phase + int(frames_per_phase * 0.67)
            trans_len = frames_per_phase - int(frames_per_phase * 0.67)
            alpha = 0.0 if i < trans_start else (i - trans_start) / float(trans_len)
            frame = Image.blend(img1_frame, img2_frame, alpha)
            
        elif i < 3 * frames_per_phase:
            phase = 3
            t = (i - 2 * frames_per_phase) / float(frames_per_phase)
            z2 = 1.2 + (2.5 - 1.2) * t
            c2 = (sizes[2][0] * 0.50, sizes[2][1] * 0.35)
            img2_frame = get_cropped_resized(images[2], c2, z2, target_size)
            
            z3 = 1.0 + (1.1 - 1.0) * t
            c3 = (sizes[3][0] * 0.50, sizes[3][1] * 0.50)
            img3_frame = get_cropped_resized(images[3], c3, z3, target_size)
            
            trans_start = 2 * frames_per_phase + int(frames_per_phase * 0.67)
            trans_len = frames_per_phase - int(frames_per_phase * 0.67)
            alpha = 0.0 if i < trans_start else (i - trans_start) / float(trans_len)
            frame = Image.blend(img2_frame, img3_frame, alpha)
            
        else:
            phase = 4
            t = (i - 3 * frames_per_phase) / float(frames_per_phase - 1)
            z3 = 1.1 + (1.3 - 1.1) * t
            c3 = (sizes[3][0] * (0.50 - 0.05 * t), sizes[3][1] * (0.50 - 0.05 * t))
            frame = get_cropped_resized(images[3], c3, z3, target_size)
            
        animated_frame = animate_frame_effects(frame, i, phase)
        temp_name = f"temp_{i:03d}.jpg"
        temp_path = os.path.join(temp_frames_dir, temp_name)
        animated_frame.save(temp_path, "JPEG", quality=75)
        temp_paths.append(temp_path)
        
    print("Raw frames generated.")
    
    # --- STEP 2: Compile Frames into an MP4 Video file ---
    import cv2
    print(f"Compiling frames into video file: {video_path}...")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(video_path, fourcc, 24, target_size)
    
    for t_path in temp_paths:
        cv_img = cv2.imread(t_path)
        video_writer.write(cv_img)
        
    video_writer.release()
    print("Video container compiled successfully.")
    
    # --- STEP 3: Read Video Container and extract frames frame-by-frame ---
    print(f"Reading video file: {video_path} and breaking into final frames...")
    cap = cv2.VideoCapture(video_path)
    frame_idx = 0
    
    while cap.isOpened():
        ret, frame_img = cap.read()
        if not ret:
            break
            
        final_name = f"frame_{frame_idx:03d}.jpg"
        final_path = os.path.join(final_frames_dir, final_name)
        
        cv2.imwrite(final_path, frame_img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        
        if frame_idx % 30 == 0:
            print(f"Extracted frame {frame_idx+1} from video: {final_name}")
        frame_idx += 1
        
    cap.release()
    print(f"Extracted {frame_idx} frames successfully!")
    
    # --- Clean up temp frames ---
    for t_path in temp_paths:
        try:
            os.remove(t_path)
        except OSError:
            pass
    try:
        os.rmdir(temp_frames_dir)
    except OSError:
        pass
        
    print("Temporary frames cleaned up. Process complete!")

if __name__ == "__main__":
    generate_multi_image_frames = compile_video_and_extract_frames()
